
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
const { sendOrderMailToUser } = require("../util/base");
const { getspecificProduct } = require("../db/querys/products");
const { fetchSpecLocation } = require("../db/querys/admin");

const paystackSecret = process.env.PAYSTACK_SECRET

exports.paymentWebhook = catchAsync(async (req, res) => {

    const hash = crypto.createHmac('sha512', paystackSecret).update(JSON.stringify(req.body)).digest('hex');

    // if (hash != req.headers['x-paystack-signature']) {
    //     return generalError(res, "Lmao, transaction unverified.")
    // }
    // console.log("recieved:::webhook ===> ", req.body)

    success(res, {}, "Recieved")

    try {
        const data = req.body;
        if (data.event == "charge.success") {
            // d = data.data

            const cartId = data.data.metadata[PARAMS.cartId]

            const item = await fetchSingleCartItem(cartId)

            // console.log("item ===> ", item)

            const products = item.products
            const userId = item.userId
            const amount = item.total_amount
            const user = await fetchUserForMiddleware(userId)
            let zone = "Pickup"
            let estimate = " 2-3 business days"
            if (item[PARAMS.locationId]) {
                const deliveryLoc = await fetchSpecLocation(item[PARAMS.locationId])
                zone = deliveryLoc?.location
                estimate = deliveryLoc?.period
            }

            // console.log("products ==> ", products)


            const trx = await uploadTransaction(
                {
                    userId,
                    reference: data.data.reference,
                    amount: amount
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
                    // quantity: 1,
                    price: specificProduct.price,
                    image: specificProduct.Images[0].url,

                }
            }))



            await insertIntoOrdersOnly({
                userId,
                orderId,
                reference: data.data.reference,
                total_amount: amount,
                [PARAMS.locationId]: item[PARAMS.locationId],
                [PARAMS.deliveryMode]: item[PARAMS.deliveryMode],
                [PARAMS.vendorName]: user[PARAMS.business_name] ?? user[PARAMS.name],
                [PARAMS.dest_address]: item[PARAMS.dest_address],
                // [PARAMS.year]: new Date().getFullYear(),
                // [PARAMS.month]: (new Date().getMonth()) + 1,
                // [PARAMS.date]: new Date().getDate(),
                [PARAMS.discount_type]: item[PARAMS.discount_type],
                [PARAMS.discount_value]: item[PARAMS.discount_value]
            })

            await createOrder(products)
            await item.destroy()


            await createNotification(NOTIFICATION_TITLES.order_new.title, `${user[PARAMS.business_name]} placed a new order  worth ${amount} for ${products.length} distict items. Click to view items`, NOTIFICATION_TITLES.order_new.alert, NOTIFICATION_TITLES.order_new.type)

            const data_ = {
                customerName: user[PARAMS.name],
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

            sendOrderMailToUser(user[PARAMS.email], `Order Confirmation - ${orderId}`, data_)
            // createTem
            // send email notification at this point to vendors with the order of their detail with this link below
            // https://rags-and-soles.netlify.app/order-detail/{orderId}

        }

    }
    catch (error) {
        console.log("error::paystackWebhook:::", error)
    }
})