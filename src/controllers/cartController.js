const { Op } = require("sequelize");
const { addToCartQuery, fetchOrdersQuery, fetchOrdersQueryAdmin, countAllOrders, fetchSingleOrderDetail, updateOrderStatus, fetchOrderDetailForReciept, insertIntoOrdersOnly, createOrder, fetchSingleCartItem } = require("../db/querys/cart");
const { getspecificProduct, reduceProductCount } = require("../db/querys/products");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, notFound, success, newError } = require("../errorHandler/statusCodes");
const { createUUID, initializePayment, sendOrderMailToUser } = require("../util/base");
const { PARAMS, FETCH_LIMIT, DELIVERY_MODES, NOTIFICATION_TITLES, MODEL_NAMES } = require("../util/consts");
const { checkoutSchema, orderUpdate, manualOrderSchema } = require("../util/validators/cartValidator");
const { fetchSingleCoupon } = require("../db/querys/category");
const { fetchSpecLocation } = require("../db/querys/admin");
const { createNotification, fetchUserForMiddleware, getUserByEmail } = require("../db/querys/users");
const { uploadTransaction } = require("../db/querys/transactions");


exports.validateCoupon = catchAsync(async (req, res) => {
    const { coupon } = req.body

    if (!coupon) {
        return generalError(res, "Kindly provide a coupon to validate", {})
    }

    const coupons = await fetchSingleCoupon(coupon)

    if (!coupons) {
        return generalError(res, "Coupon not valid/expired", {})
    }

    return success(res, { type: coupons.type, value: coupons.value }, "Fetched.")
})

async function processOrder(products) {
    const spec_list = [];
    let total_amount = 0.0;

    for (const cart_item of products) {
        const product = await getspecificProduct(cart_item[PARAMS.productId]);

        if (!product) {
            return {
                type: "error",
                body: { code: 404, msg: "Product not found" }
            };
        }

        const low_count_notifications = []

        for (const spec of cart_item[PARAMS.specifications]) {
            const product_spec = product[PARAMS.product_specifications].find(
                (spec_spec) => spec_spec.id == spec.id
            );

            if (!product_spec) {
                return {
                    type: "error",
                    body: {
                        code: 404,
                        msg: `Specification not found for ${product.name}: Size ${spec.size}`
                    }
                };
            }

            if (product_spec.units < spec.count) {
                return {
                    type: "error",
                    body: {
                        code: 400,
                        msg: `${product.name} (Size: ${spec.size}) is currently low on stock and can't fulfill the requested quantity.`
                    }
                };
            }



            total_amount += product.price * spec.count;

            spec_list.push({
                count: spec.count,
                id: spec.id,
                low_stock: product_spec.units - spec.count <= 5 ? `${product.name} is remaining 5 items left for "${spec.size}"` : null
            });
        }
    }

    return {
        type: "success",
        body: {
            spec_list,
            total_amount
        }
    };
}

async function processManualOrder(cartId, reference, email, name) {

    const item = await fetchSingleCartItem(cartId)

    // console.log("item ===> ", item)

    const products = item.products
    const userId = item.userId
    const amount = item.total_amount
    // const user = await fetchUserForMiddleware(userId)
    let zone = "Pickup"
    let estimate = " 2-3 business days"
    if (item[PARAMS.locationId]) {
        const deliveryLoc = await fetchSpecLocation(item[PARAMS.locationId])
        zone = deliveryLoc?.location
        estimate = deliveryLoc?.period
    }


    const trx = await uploadTransaction(
        {
            userId,
            reference: reference,
            amount: amount,
            [PARAMS.isManual]: true
        }
    )
    const orderId = trx.orderId

    const templateItems = await Promise.all(products.map(async (product, index) => {
        product.orderId = orderId
        product.userId = userId
        products[index] = product

        const specificProduct = await getspecificProduct(product.productId)


        return {
            name: specificProduct.name,
            specifications: product.specifications,
            price: specificProduct.price,
            image: specificProduct?.Images[0]?.url,

        }
    }))

    await item.destroy()


    const promises = await Promise.allSettled([
        insertIntoOrdersOnly({
            userId,
            orderId,
            reference: reference,
            total_amount: amount,
            [PARAMS.locationId]: item[PARAMS.locationId],
            [PARAMS.deliveryMode]: item[PARAMS.deliveryMode],
            [PARAMS.vendorName]: name ?? "Manual Order",
            [PARAMS.dest_address]: item[PARAMS.dest_address],
            [PARAMS.discount_type]: item[PARAMS.discount_type],
            [PARAMS.discount_value]: item[PARAMS.discount_value]
        }),

        createOrder(products),

        createNotification(NOTIFICATION_TITLES.order_new.title, `Manual order worth ${amount} for ${products.length} distict items placed. Click to view items`, NOTIFICATION_TITLES.order_new.alert, NOTIFICATION_TITLES.order_new.type)
    ])

    promises.forEach((item, index) => {
        console.log("index=======>", index)
        console.log("index=======>", item.status)
        console.log("index=======>", item.reason)
        console.log("888888888888888888888888888888")
        // console.log("index=======>", index)
    })


    if (email) {
        const data_ = {
            customerName: name ?? "Vendor",
            orderId: orderId,
            status: 'Paid',
            orderDate: new Date().toUTCString(),
            totalAmount: Number(amount).toLocaleString(),
            items: templateItems,
            delivery: {
                recipient: item[PARAMS.dest_address][PARAMS.name],
                address: item[PARAMS.dest_address][PARAMS.address],
                phone: item[PARAMS.dest_address][PARAMS.phone_no],
                zone: zone,
                estimate: estimate,
            },
            orderLink: process.env.WEB_BASE_URL + `/order-detail/${orderId}` //'https://ragsandsoles.com/orders/RNS-294102',
        };

        sendOrderMailToUser(email, `Order Confirmation - ${orderId}`, data_)
    }
}

exports.createOrder = catchAsync(async (req, res) => {
    const user_id = req.user?.id

    const valid_ = checkoutSchema.validate(req.body)

    if (valid_.error) {
        // console.log("error::::", valid_.error)
        return generalError(res, valid_.error.message, {})
    }

    // console.log("req.payload:::::", req.body)

    req.body.userId = user_id
    // till payment is processed before product units are reduced.

    // const order = await createOrder(req.body)
    // let total_amount = 0.0
    const products = req.body[PARAMS.products]
    let deliveryFee = 0
    let deliveryMode = DELIVERY_MODES.pickup
    const promises = []

    let coupon_detail
    let couponId

    const processedOrder = await processOrder(products)
    if (processedOrder.type == "error") {
        return newError(res, processedOrder.body.msg, processedOrder.body.code)
    }

    let total_amount = processedOrder.body?.total_amount
    const spec_list = processedOrder.body?.spec_list

    if (req.body.coupon) {
        coupon_detail = await fetchSingleCoupon(req.body.coupon)
        if (!coupon_detail) {
            return notFound(res, `Coupon code '${req.body.coupon}' not found.`)
        }

        if (coupon_detail.limit <= coupon_detail.usage) {
            generalError(res, "Coupon expired")
            await coupon_detail.update({ status: "Expired" }, { where: { id: coupon_detail.id } })
            return
        }

        if (coupon_detail?.type == "percentage") {
            total_amount = total_amount - ((Number(coupon_detail.value) / 100) * total_amount)
        } else {
            total_amount = total_amount - coupon_detail.value
        }

        req.body[PARAMS.discount_type] = coupon_detail?.type
        req.body[PARAMS.discount_value] = coupon_detail?.value
        couponId = coupon_detail.id
    }

    if (!req.body[PARAMS.isDeliveryFree]) {
        const locationId = req.body[PARAMS.locationId]

        const loc_data = await fetchSpecLocation(locationId)

        if (!loc_data) {
            return notFound(res, "Location selected Not found")
        }
        deliveryMode = DELIVERY_MODES.delivery
        deliveryFee = loc_data.price
    }

    req.body.total_amount = total_amount + deliveryFee
    req.body[PARAMS.deliveryMode] = deliveryMode

    const temp_order = await addToCartQuery(req.body)

    const response = await initializePayment(createUUID(), req.body.total_amount, req.user?.email, { cartId: temp_order.cartId })
    if (!response.success) {
        return generalError(res, response.msg, {})
    }

    success(res, { url: response.url }, "Kindly proceed to making payment.")



    spec_list.forEach(
        (item) => { 
            if(item?.low_stock){
                promises.push (createNotification(NOTIFICATION_TITLES.product.title, item.low_stock, NOTIFICATION_TITLES.product.alert, NOTIFICATION_TITLES.product.type))
            }
            
            promises.push(reduceProductCount(item.count, item.id)) 
        }
    )
    if (couponId) {
        promises.push(
            coupon_detail.increment("usage", { by: 1, where: { id: couponId } }),
            createNotification(NOTIFICATION_TITLES.coupon.title, `${req.user[PARAMS.business_name] ?? req.user[PARAMS.name]} used coupon, ${req.body.coupon} `, NOTIFICATION_TITLES.coupon.alert, NOTIFICATION_TITLES.coupon.type)
        )
    }

    promises.push(createNotification(NOTIFICATION_TITLES.order_new.title, `${req.user[PARAMS.business_name] ?? req.user[PARAMS.name]} placed a new order  worth ${req.body.total_amount} for ${products.length} distict items. Click to view items`, NOTIFICATION_TITLES.order_new.alert,NOTIFICATION_TITLES.order_new.type))
    await Promise.allSettled(promises)

})

exports.fetchOrders = catchAsync(async (req, res) => {
    const user_id = req.user?.id
    // const { page } = req.query

    // if (!page || Number(page) < 1 || Number.isNaN(page)) {
    //     return generalError(res, "Kindly provide page as a number greater than 0")
    // }

    // const offsetc = FETCH_LIMIT * (Number(page) - 1)


    const { status, search, page } = req.query

    if (page <= 0 || !page || Number.isNaN(page)) {
        return generalError(res, "Page cannot be less than 1")
    }

    const offset = (Number(page) - 1) * FETCH_LIMIT
    let actual_query = {
        [PARAMS.userId]: user_id
    }


    if (search) {
        // query_list.push(Sequelize.literal(`MATCH (${PARAMS.name}) AGAINST("${search}" IN BOOLEAN MODE)`),)

        actual_query[PARAMS.orderId] = {
            [Op.like]: `%${search}%`
        }

    }
    if (status) {
        actual_query[PARAMS.deliv_status] = status
    }

    const orders = await fetchOrdersQuery(actual_query, FETCH_LIMIT, offset)

    const total = await countAllOrders(actual_query)
    const pages = Math.ceil(total / FETCH_LIMIT)

    return success(res, { orders, pages }, "fetched")

})

exports.fetchOrdersAdmin = catchAsync(async (req, res) => {
    // limit = 0
    // offset 

    const { status, search, page } = req.query

    if (page <= 0 || !page || Number.isNaN(page)) {
        return generalError(res, "Page cannot be less than 1")
    }

    const offset = (Number(page) - 1) * FETCH_LIMIT
    let actual_query = {}


    if (search) {
        // query_list.push(Sequelize.literal(`MATCH (${PARAMS.name}) AGAINST("${search}" IN BOOLEAN MODE)`),)

        actual_query[Op.or] = {
            [PARAMS.orderId]: {
                [Op.like]: `%${search}%`
            },
            [PARAMS.vendorName]: {
                [Op.like]: `%${search}%`
            }
        }

    }
    if (status) {
        actual_query[PARAMS.deliv_status] = status
    }

    const orders = await fetchOrdersQueryAdmin(actual_query, FETCH_LIMIT, offset)
    const total = await countAllOrders(actual_query)
    const pages = Math.ceil(total / FETCH_LIMIT)

    return success(res, { pages, orders }, "fetched")
})

exports.updateStatusOfOrders = catchAsync(async (req, res) => {
    const valid_ = orderUpdate.validate(req.body)

    if (valid_.error) {
        return generalError(res, valid_.error.message)
    }

    const order = await fetchSingleOrderDetail(req.body[PARAMS.orderId])

    // return success(res, order,"")

    const statuses = order.statuses

    if (statuses.includes(req.body.status)) {
        return generalError(res, "Cannnot set status at current time")
    }
    statuses.push(req.body.status)

    const update = {
        [PARAMS.statuses]: statuses,
        [PARAMS.deliv_status]: req.body.status
    }

    await updateOrderStatus(req.body[PARAMS.orderId], update)

    success(res, order, "Order Updated")

    const templateItems = order[MODEL_NAMES.order].map((product, index) => {

        return {
            name: product[MODEL_NAMES.product].name,
            specifications: product.specifications,
            price: product[MODEL_NAMES.product].price,
            image: product[MODEL_NAMES.product].defaultImage.url,
        }
    })

    const data_ = {
        customerName: order[MODEL_NAMES.user][PARAMS.name],
        orderId: req.body[PARAMS.orderId],
        status: req.body.status.toLocaleUpperCase(),
        orderDate: order[PARAMS.createdAt],
        totalAmount: Number(order.total_amount).toLocaleString(),
        items: templateItems,
        delivery: {
            recipient: order[PARAMS.dest_address][PARAMS.name],
            address: order[PARAMS.dest_address][PARAMS.address],
            phone: order[PARAMS.dest_address][PARAMS.phone_no],
            zone: order["deliveryLocation"][PARAMS.location],
            estimate: order["deliveryLocation"][PARAMS.period],
        },
        orderLink: process.env.WEB_BASE_URL + `/order-detail/${req.body[PARAMS.orderId]}` //'https://ragsandsoles.com/orders/RNS-294102',
    };



    sendOrderMailToUser(order[MODEL_NAMES.user].email, `Order ${req.body[PARAMS.orderId]} — Status Update.`, data_)

})

exports.fetchSingleOrder = catchAsync(async (req, res) => {
    const orderId = req.params.orderId

    const order = await fetchOrderDetailForReciept(orderId)

    return success(res, order,)
})

exports.fetchSingleOrderFun = catchAsync(async (req, res) => {
    const orderId = req.params.orderId

    const order = await fetchSingleOrderDetail(orderId)

    return success(res, order,)
})

exports.manualOrder = catchAsync(async (req, res) => {

    const user_id = req.user?.id

    let who_ordered = user_id

    const valid_ = manualOrderSchema.validate(req.body)

    if (valid_.error) {
        return generalError(res, valid_.error.message, {})
    }

    if (!req.body?.email && !req.body?.name) {
        return generalError(res, "Kindly provide either the name or email of reciepient")
    }


    if (req.body?.email) {

        const u = await getUserByEmail(req.body.email)
        if (u) {
            who_ordered = u.uid
        }
    }

    req.body.userId = who_ordered

    const products = req.body[PARAMS.products]
    let deliveryFee = 0
    let deliveryMode = DELIVERY_MODES.pickup
    const promises = []

    let coupon_detail
    let couponId

    const processedOrder = await processOrder(products)
    if (processedOrder.type == "error") {
        return newError(res, processedOrder.body.msg, processedOrder.body.code)
    }

    let total_amount = processedOrder.body?.total_amount
    const spec_list = processedOrder.body?.spec_list

    if (req.body.coupon) {
        coupon_detail = await fetchSingleCoupon(req.body.coupon)
        if (!coupon_detail) {
            return notFound(res, `Coupon code '${req.body.coupon}' not found.`)
        }

        if (coupon_detail.limit <= coupon_detail.usage) {
            generalError(res, "Coupon expired")
            await coupon_detail.update({ status: "Expired" }, { where: { id: coupon_detail.id } })
            return
        }

        if (coupon_detail?.type == "percentage") {
            total_amount = total_amount - ((Number(coupon_detail.value) / 0.01) * total_amount)
        } else {
            total_amount = total_amount - coupon_detail.value
        }

        req.body[PARAMS.discount_type] = coupon_detail?.type
        req.body[PARAMS.discount_value] = coupon_detail?.value
        couponId = coupon_detail.id
    }

    if (!req.body[PARAMS.isDeliveryFree]) {
        const locationId = req.body[PARAMS.locationId]

        const loc_data = await fetchSpecLocation(locationId)

        if (!loc_data) {
            return notFound(res, "Location selected Not found")
        }
        deliveryMode = DELIVERY_MODES.delivery
        deliveryFee = loc_data.price
    }

    req.body.total_amount = total_amount + deliveryFee
    req.body[PARAMS.deliveryMode] = deliveryMode

    const temp_order = await addToCartQuery(req.body)

    success(res, {}, "Order being processed.")

    await processManualOrder(temp_order.cartId, `MANUAL/${createUUID()}`, req.body?.email, req.body?.name)

    spec_list.forEach((item) => promises.push(reduceProductCount(item.count, item.id)))
    if (couponId) {
        promises.push(
            coupon_detail.increment("usage", { by: 1, where: { id: couponId } }),
            createNotification(NOTIFICATION_TITLES.coupon.title, `Admin user, ${req.user.name}, used coupon for ${req.body?.email ?? req.body?.name}'s order`, NOTIFICATION_TITLES.coupon.alert, NOTIFICATION_TITLES.coupon.type)
        )
    }

    promises.push(createNotification(NOTIFICATION_TITLES.order_new.title, `Admin user, ${req.user.name}, placed a new order for ${req.body?.email ?? req.body?.name}  worth ${req.body.total_amount} for ${products.length} distict items. Click to view items`, NOTIFICATION_TITLES.order_new.alert, NOTIFICATION_TITLES.order_new.type))
    await Promise.allSettled(promises)


})

