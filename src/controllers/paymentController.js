
require("dotenv").config()

const { Op } = require("sequelize");
// const { updateCartItemsforOrder } = require("../db/querys/cart");
// const { updateTransaction } = require("../db/querys/transactions");
const { catchAsync } = require("../errorHandler/allCatch");
const { success, generalError } = require("../errorHandler/statusCodes");
const { PARAMS, NOTIFICATION_TITLES } = require("../util/consts");
const crypto = require("crypto");
const { uploadTransaction } = require("../db/querys/transactions");
const { fetchSingleCartItem, createOrder, insertIntoOrdersOnly } = require("../db/querys/cart");
const { fetchUserForMiddleware, createNotification } = require("../db/querys/users");

const paystackSecret = process.env.PAYSTACK_SECRET

exports.paymentWebhook = catchAsync(async (req, res) => {

    const hash = crypto.createHmac('sha512', paystackSecret).update(JSON.stringify(req.body)).digest('hex');

    if (hash != req.headers['x-paystack-signature']) {
        return generalError(res, "Lmao, transaction unverified.")
    }
    // console.log("recieved:::webhook", req.body )
    success(res, {}, "Recieved")

    try {
        const data = req.body;
        if (data.event == "charge.success") {

            const cartId = data.data.metadata[PARAMS.cartId]

            const item = await fetchSingleCartItem(cartId)

            const products = item.products
            const userId = item.userId
            const amount = item.total_amount
            const user = await fetchUserForMiddleware(userId)


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
                reference: data.data.reference,
                total_amount: amount,
                [PARAMS.locationId]: item[PARAMS.locationId],
                [PARAMS.deliveryMode]: item[PARAMS.deliveryMode],
                [PARAMS.vendorName]: user[PARAMS.business_name] ?? user[PARAMS.name],
                [PARAMS.dest_address]: item[PARAMS.dest_address],
                [PARAMS.year]: new Date().getFullYear(),
                [PARAMS.month]: new Date().getMonth(),
                [PARAMS.date]: new Date().getDate(),

            })

            await createOrder(products)
            await item.destroy()

            
            await createNotification(NOTIFICATION_TITLES.order_new.title, `${user[PARAMS.business_name]} placed a new order  worth ${amount} for ${products.length} distict items. Click to view items`, NOTIFICATION_TITLES.order_new.alert, NOTIFICATION_TITLES.order_new.type)

            // send email notification at this point to vendors with the order of their detail with this link below
            // https://rags-and-soles.netlify.app/order-detail/{orderId}

        }

    }
    catch (error) {
        console.log("error::paystackWebhook:::", error)
    }
})