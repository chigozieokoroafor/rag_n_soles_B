const { Op } = require("sequelize");
const { addToCartQuery, fetchCartItems, fetchCartItemsToOrder, updateCartItemsforOrder } = require("../db/querys/cart");
const { getspecificProduct } = require("../db/querys/products");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, notFound, internalServerError, success } = require("../errorHandler/statusCodes");
const { createUUID, initializePayment } = require("../util/base");
const { PARAMS, FETCH_LIMIT } = require("../util/consts");
const { addToCartSchema } = require("../util/validators/cartValidator");
const { uploadTransaction } = require("../db/querys/transactions");

exports.addItemToCart = catchAsync(async (req, res) => {
    const user_id = req.user.uid
    const valid_ = addToCartSchema.validate(req.body)

    if (valid_.error) {
        return generalError(res, valid_.error.message)
    }

    let data = req.body

    const product = await getspecificProduct(req.body[PARAMS.productId])
    if (!product) {
        return notFound(res, "Product selected not found 🤔.")
    }



    // data["unit_price"] = product[PARAMS.price]

    data[PARAMS.uid] = user_id
    data[PARAMS.total_amount] = data["unit_price"] * data[PARAMS.units]

    try {
        const q = await addToCartQuery(data)
        if (!q) {
            return generalError(res, "Error while adding to cart.")
        }
        return success(res, {}, "Item added to cart")
    } catch (error) {
        return internalServerError(res, "unable to add to cart")
    }

})

exports.getCart = catchAsync(async (req, res) => {
    const user_id = req.user?.uid

    offset = 0
    const data = await fetchCartItems(user_id, offset, FETCH_LIMIT)

    const total = data.reduce((total, item) => total + item[PARAMS.total_amount], 0)

    return success(res, { cart: data, total }, "Working")
})

exports.checkout = catchAsync(async (req, res) => {
    const user_id = req.user?.uid
    const cart = await fetchCartItemsToOrder(user_id)

    if(cart.length < 1){
        return generalError(res, "No items in cart to purchase")
    }

    const orderId = createUUID()
    const total_amount = cart.reduce((total, current) => total + current[PARAMS.total_amount], 0)
    const cart_ids = cart.map((item) => {

        return item.id

    })

    const ref = createUUID()
    const response = await initializePayment(ref, total_amount, req.user?.email, { [PARAMS.orderId]: orderId, [PARAMS.cart_ids]:cart_ids })
    if (!response.success) {
        return generalError(res, response.msg,)
    }


    await uploadTransaction(
        {
            [PARAMS.uid]:user_id,
            [PARAMS.orderId]:orderId,
            [PARAMS.reference]:ref,
            [PARAMS.amount]:total_amount,


        }
    )





    return success(res, { url: response.url }, "Click to get to payment.")

})