const { Op, where } = require("sequelize");
const { addToCartQuery, fetchCartItems, fetchCartItemsToOrder, updateCartItemsforOrder, createOrder } = require("../db/querys/cart");
const { getspecificProduct, reduceProductCount } = require("../db/querys/products");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, notFound, internalServerError, success } = require("../errorHandler/statusCodes");
const { createUUID, initializePayment } = require("../util/base");
const { PARAMS, FETCH_LIMIT } = require("../util/consts");
const { addToCartSchema, checkoutSchema } = require("../util/validators/cartValidator");
const { uploadTransaction } = require("../db/querys/transactions");
const { fetchSingleCoupon, updateCoupon } = require("../db/querys/category");

// exports.addItemToCart = catchAsync(async (req, res) => {
//     const user_id = req.user.uid
//     const valid_ = addToCartSchema.validate(req.body)

//     if (valid_.error) {
//         return generalError(res, valid_.error.message)
//     }

//     let data = req.body

//     const product = await getspecificProduct(req.body[PARAMS.productId])
//     if (!product) {
//         return notFound(res, "Product selected not found 🤔.")
//     }



//     // data["unit_price"] = product[PARAMS.price]

//     data[PARAMS.uid] = user_id
//     data[PARAMS.total_amount] = product["price"] * data[PARAMS.units]

//     try {
//         const q = await addToCartQuery(data)
//         if (!q) {
//             return generalError(res, "Error while adding to cart.")
//         }
//         return success(res, {}, "Item added to cart")
//     } catch (error) {
//         return internalServerError(res, "unable to add to cart")
//     }

// })

// exports.getCart = catchAsync(async (req, res) => {
//     const user_id = req.user?.uid

//     offset = 0
//     const data = await fetchCartItems(user_id, offset, FETCH_LIMIT)

//     const total = data.reduce((total, item) => total + item[PARAMS.total_amount], 0)

//     return success(res, { cart: data, total }, "Working")
// })

// exports.checkout = catchAsync(async (req, res) => {
//     const user_id = req.user?.uid
//     const cart = await fetchCartItemsToOrder(user_id)

//     if (cart.length < 1) {
//         return generalError(res, "No items in cart to purchase")
//     }

//     const orderId = createUUID()
//     const total_amount = cart.reduce((total, current) => total + current[PARAMS.total_amount], 0)
//     const cart_ids = cart.map((item) => {

//         return item.id

//     })

//     const ref = createUUID()
//     const response = await initializePayment(ref, total_amount, req.user?.email, { [PARAMS.orderId]: orderId, [PARAMS.cart_ids]: cart_ids })
//     if (!response.success) {
//         return generalError(res, response.msg,)
//     }


//     await uploadTransaction(
//         {
//             [PARAMS.uid]: user_id,
//             [PARAMS.orderId]: orderId,
//             [PARAMS.reference]: ref,
//             [PARAMS.amount]: total_amount,


//         }
//     )

//     return success(res, { url: response.url }, "Click to get to payment.")

// })

exports.createOrder = catchAsync(async (req, res) => {
    const user_id = req.user?.id

    const valid_ = checkoutSchema.validate(req.body)

    if (valid_.error) {
        console.log("error::::", valid_.error)
        return generalError(res, valid_.error.message,{})
    }

    req.body.userId = user_id

    // till payment is processed before product units are reduced.

    // const order = await createOrder(req.body)
    let total_amount = 0.0
    const products = req.body[PARAMS.products]

    const promises = []

    let coupon_detail
    // exit_iteration = false

    for (cart_item of products) {
        const product = await getspecificProduct( cart_item[PARAMS.productId])
        if (!product){
            notFound(res, "Product not found")
            // exit_iteration = true
            return
        }

        for (spec of cart_item[PARAMS.specifications]){
            const product_spec = product[PARAMS.product_specifications].find(spec_spec => spec_spec.id == spec.id)

            if (!product_spec){
                notFound(res, `Specification provided not found: ${spec.size}`, )
                return
            }

            if(product_spec.units < spec.count){
                generalError(res, `available units for size ${spec.size} doesn't reach the requested amount`)
                return
            }


            total_amount += product.price * spec.count
            promises.push(reduceProductCount(spec.count, spec.id))
        }

    };

    if (req.body.coupon){
        coupon_detail = await fetchSingleCoupon(req.body.coupon) 
        if(!coupon_detail){
            return notFound(res, `Coupon code '${req.body.coupon}' not found.`)
        }

        if (coupon_detail.limit >= coupon_detail.usage){
            generalError(res, "Coupon expired")
            // await updateCoupon({status: "Expired"}, coupon_detail.id)
            await coupon_detail.update({status: "Expired"}, {where: {id: coupon_detail.id}})
            return 
        }

        if(coupon_detail?.type == "percentage"){
            total_amount = (Number(coupon_detail.value) / 0.01) * total_amount
        }

        promises.push(coupon_detail.increment("usage", {by: 1, where:{id: coupon_detail.id}}))
    }

    console.log(`total====> ${total_amount}`)

    req.body.total_amount = total_amount

    const temp_order = await addToCartQuery(req.body)

    const response = await initializePayment(createUUID(), total_amount, req.user?.email, {cartId: temp_order.cartId})
    if (!response.success){
        return generalError(res, response.msg, {})
    }

    success(res,{url: response.url}, "Kindly proceed to making payment.")

    await Promise.allSettled(promises)

    

})

exports.fetchOrders = catchAsync(async(req, res) =>{
    const user_id = req.user?.id

    
})