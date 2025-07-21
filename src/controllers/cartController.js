const { Op } = require("sequelize");
const { addToCartQuery, fetchOrdersQuery, fetchOrdersQueryAdmin, countAllOrders, fetchSingleOrderDetail, updateOrderStatus, fetchOrderDetailForReciept } = require("../db/querys/cart");
const { getspecificProduct, reduceProductCount } = require("../db/querys/products");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, notFound, success } = require("../errorHandler/statusCodes");
const { createUUID, initializePayment } = require("../util/base");
const { PARAMS, FETCH_LIMIT, DELIVERY_MODES, NOTIFICATION_TITLES } = require("../util/consts");
const { checkoutSchema, orderUpdate } = require("../util/validators/cartValidator");
const { fetchSingleCoupon } = require("../db/querys/category");
const { fetchSpecLocation } = require("../db/querys/admin");


exports.validateCoupon = catchAsync(async (req, res) => {
    const { coupon } = req.body

    if(!coupon){
        return generalError(res, "Kindly provide a coupon to validate", {})
    }

    const coupons = await fetchSingleCoupon(coupon)

    if(!coupons){
        return generalError(res, "Coupon not valid/expired", {})
    }

    return success(res, { type: coupons.type, value: coupons.value }, "Fetched.")
})

exports.createOrder = catchAsync(async (req, res) => {
    const user_id = req.user?.id

    const valid_ = checkoutSchema.validate(req.body)

    if (valid_.error) {
        // console.log("error::::", valid_.error)
        return generalError(res, valid_.error.message, {})
    }

    req.body.userId = user_id
    let couponUsed = false
    // till payment is processed before product units are reduced.

    // const order = await createOrder(req.body)
    let total_amount = 0.0
    const products = req.body[PARAMS.products]
    let deliveryFee = 0
    let deliveryMode = DELIVERY_MODES.pickup
    const promises = []

    let coupon_detail
    // exit_iteration = false

    for (cart_item of products) {
        const product = await getspecificProduct(cart_item[PARAMS.productId])
        if (!product) {
            notFound(res, "Product not found")
            return
        }

        for (spec of cart_item[PARAMS.specifications]) {
            const product_spec = product[PARAMS.product_specifications].find(spec_spec => spec_spec.id == spec.id)

            if (!product_spec) {
                notFound(res, `Specification provided not found: ${spec.size}`,)
                return
            }

            if (product_spec.units < spec.count) {
                generalError(res, `${product.name} (Size: ${spec.size}) is currently low on stock and can't fulfill the requested quantity.`)
                return
            }

            total_amount += product.price * spec.count
            
            promises.push(reduceProductCount(spec.count, spec.id))
        }

    };

    if (req.body.coupon) {
        coupon_detail = await fetchSingleCoupon(req.body.coupon)
        if (!coupon_detail) {
            return notFound(res, `Coupon code '${req.body.coupon}' not found.`)
        }

        if (coupon_detail.limit >= coupon_detail.usage) {
            generalError(res, "Coupon expired")
            // await updateCoupon({status: "Expired"}, coupon_detail.id)
            await coupon_detail.update({ status: "Expired" }, { where: { id: coupon_detail.id } })
            return
        }

        if (coupon_detail?.type == "percentage") {
            total_amount = total_amount - ((Number(coupon_detail.value) / 0.01) * total_amount)
        } else {
            total_amount = total_amount - coupon_detail.value
        }
        // await createNotification(NOTIFICATION_TITLES.coupon.title, `${req.user[PARAMS.business_name]} placed a new order  worth ${amount} for ${products.length} distict items. Click to view items`, NOTIFICATION_TITLES.coupon.alert)
        promises.push(coupon_detail.increment("usage", { by: 1, where: { id: coupon_detail.id } }))
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
            [PARAMS.orderId] : {
                [Op.like]: `%${search}%`
            },
            [PARAMS.vendorName]:{
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
    const statuses = order.statuses

    if (statuses.includes(req.body.status)) {
        return generalError(res, "Cannnot set status at current time")
    }
    statuses.push(req.body.status)

    // console.log(statuses)

    const update = {
        [PARAMS.statuses]: statuses,
        [PARAMS.deliv_status]: req.body.status
    }

    await updateOrderStatus(req.body[PARAMS.orderId], update)



    return success(res, order, "Order Updated")

})

exports.fetchSingleOrder = catchAsync(async(req, res) =>{
    const orderId = req.params.orderId

    const order = await fetchOrderDetailForReciept(orderId)

    return success(res, order, )
})