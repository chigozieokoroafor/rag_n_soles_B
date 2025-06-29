
require("dotenv").config()

const { Op } = require("sequelize");
// const { updateCartItemsforOrder } = require("../db/querys/cart");
// const { updateTransaction } = require("../db/querys/transactions");
const { catchAsync } = require("../errorHandler/allCatch");
const { success, generalError } = require("../errorHandler/statusCodes");
const { PARAMS } = require("../util/consts");
const crypto = require("crypto");
const { uploadTransaction } = require("../db/querys/transactions");
const { fetchSingleCartItem, createOrder, insertIntoOrdersOnly } = require("../db/querys/cart");

const paystackSecret = process.env.PAYSTACK_SECRET

exports.paymentWebhook = catchAsync(async (req, res) => {

    const hash = crypto.createHmac('sha512', paystackSecret).update(JSON.stringify(req.body)).digest('hex');

    if (hash != req.headers['x-paystack-signature']) {
        return generalError(res, "Lmao, transaction unverified.")
    }
    // console.log("recieved:::webhook", req.body )
    success(res, {}, "Recieved")

    try {
        console.log("here::: success")
        const data = req.body;
        if (data.event == "charge.success") {

            const cartId = data.data.metadata[PARAMS.cartId]

            const item = await fetchSingleCartItem(cartId)

            const products = item.products
            const userId = item.userId
            const amount = item.total_amount


            const trx = await uploadTransaction(
                {
                    userId,
                    reference: data.data.reference,
                    amount: amount
                }
            )
            const orderId = trx.orderId

            products.forEach((product, index) => {
                product.orderId = orderId
                product.userId = userId
                products[index] = product

            })

            await insertIntoOrdersOnly({
                userId,
                orderId,
                reference: data.reference,
                total_amount: amount,

            })

            await createOrder(products)
            await item.destroy()


        }

    }
    catch (error) {
        console.log("error::paystackWebhook:::", error)
    }
})