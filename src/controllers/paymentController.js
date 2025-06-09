
require("dotenv").config()

const { Op } = require("sequelize");
const { updateCartItemsforOrder } = require("../db/querys/cart");
const { updateTransaction } = require("../db/querys/transactions");
const { catchAsync } = require("../errorHandler/allCatch");
const { success, generalError } = require("../errorHandler/statusCodes");
const { PARAMS } = require("../util/consts");
const crypto = require("crypto")

const paystackSecret = process.env.PAYSTACK_SECRET

exports.paymentWebhook = catchAsync(async (req, res)=>{
    
    const hash = crypto.createHmac('sha512', paystackSecret).update(JSON.stringify(req.body)).digest('hex');

    if (hash != req.headers['x-paystack-signature']) {
        return generalError(res, "Lmao, transaction unverified.")
    }
    console.log("recieved:::webhook", req.body )
    success(res, {}, "Recieved")
    
    try{
        console.log("here::: success")
        const data = req.body;
        if (data.event == "charge.success"){      
            const cart_ids = data.data.metadata[PARAMS.cart_ids]
            const orderId = data.data.metadata[PARAMS.orderId]
            const promises = await Promise.allSettled([updateTransaction({status:"Success"}, orderId ), updateCartItemsforOrder({ orderId: orderId , [PARAMS.ordered]:true}, { id: { [Op.in]: cart_ids } })])

            promises.forEach((promise, index) =>{
                console.log("promise:::::", index, ":::::", promise.status)
                console.log("promise:::::", promise.reason)
            })
            
            
        }

    }
    catch(error){
        console.log("error::paystackWebhook:::", error)
    }
})