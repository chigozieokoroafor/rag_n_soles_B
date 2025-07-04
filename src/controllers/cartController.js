const { Op, where } = require("sequelize");
const { addToCartQuery, fetchCartItems, fetchCartItemsToOrder, updateCartItemsforOrder, createOrder, fetchOrdersQuery, fetchSingleOrderDetail, fetchOrdersQueryAdmin } = require("../db/querys/cart");
const { getspecificProduct, reduceProductCount } = require("../db/querys/products");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, notFound, internalServerError, success } = require("../errorHandler/statusCodes");
const { createUUID, initializePayment } = require("../util/base");
const { PARAMS, FETCH_LIMIT, DELIVERY_MODES } = require("../util/consts");
const { addToCartSchema, checkoutSchema } = require("../util/validators/cartValidator");
const { uploadTransaction } = require("../db/querys/transactions");
const { fetchSingleCoupon, updateCoupon } = require("../db/querys/category");
const { fetchLocations, fetchSpecLocation } = require("../db/querys/admin");


exports.createOrder = catchAsync(async (req, res) => {
    const user_id = req.user?.id

    const valid_ = checkoutSchema.validate(req.body)

    if (valid_.error) {
        // console.log("error::::", valid_.error)
        return generalError(res, valid_.error.message, {})
    }

    req.body.userId = user_id

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
            // exit_iteration = true
            return
        }

        for (spec of cart_item[PARAMS.specifications]) {
            const product_spec = product[PARAMS.product_specifications].find(spec_spec => spec_spec.id == spec.id)

            if (!product_spec) {
                notFound(res, `Specification provided not found: ${spec.size}`,)
                return
            }

            if (product_spec.units < spec.count) {
                generalError(res, `available units for size ${spec.size} doesn't reach the requested amount`)
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
        }else{
            total_amount = total_amount - coupon_detail.value
        }

        promises.push(coupon_detail.increment("usage", { by: 1, where: { id: coupon_detail.id } }))
    }

    if (req.body[PARAMS.isDeliveryFree]){
        const locationId = req.body[PARAMS.locationId]

        const loc_data = await fetchSpecLocation(locationId)

        if(!loc_data){
            return notFound(res, "Location selected Not found")
        }
        deliveryMode = DELIVERY_MODES.delivery
        deliveryFee = loc_data.price
    }

    req.body.total_amount = total_amount + deliveryFee
    req.body[PARAMS.deliveryMode] = deliveryMode

    const temp_order = await addToCartQuery(req.body)

    const response = await initializePayment(createUUID(), total_amount, req.user?.email, { cartId: temp_order.cartId })
    if (!response.success) {
        return generalError(res, response.msg, {})
    }

    success(res, { url: response.url }, "Kindly proceed to making payment.")

    await Promise.allSettled(promises)



})

exports.fetchOrders = catchAsync(async (req, res) => {
    const user_id = req.user?.id
    const { page } = req.query

    if (!page || Number(page) < 1 || Number.isNaN(page)) {
        return generalError(res, "Kindly provide page as a number greater than 0")
    }

    const offsetc = FETCH_LIMIT * (Number(page) - 1)

    const data = await fetchOrdersQuery(user_id, FETCH_LIMIT, offsetc)

    return success(res, data, "fetched")

})

exports.fetchOrdersAdmin = catchAsync(async(req, res)=>{
    // limit = 0
    // offset 
    const data = await fetchOrdersQueryAdmin(10, 0)

    return success(res, data, "fetched")
})