const { PARAMS } = require("../../util/consts");
const { cart } = require("../models/cart");
const { order } = require("../models/order");
const { product } = require("../models/product");

exports.addToCartQuery = async (data) => {
    return await cart.create(data)
}

exports.fetchCartItems = async (uid, offset, limit) => {
    return await cart.findAll(
        {
            where: {
                uid,
                [PARAMS.ordered]: false

            },
            include: [
                {
                    model: product,
                    attributes: [PARAMS.uid, PARAMS.img_url, PARAMS.specifications, PARAMS.name]
                }
            ],
            offset,
            limit
        }
    )
}

exports.fetchCartItemsToOrder = async (uid) => {
    return await cart.findAll(
        {
            where: {
                uid,
                [PARAMS.ordered]: false

            },
            attributes: [PARAMS.id, PARAMS.total_amount]
            // include:[
            //     {
            //         model:product,
            //         attributes:[PARAMS.uid, PARAMS.img_url, PARAMS.specifications, PARAMS.name]
            //     }
            // ]
        }
    )
}

exports.updateCartItemsforOrder = async (update, where) => {
    await cart.update(update, { where: where })
}


exports.createOrder = async (data) => {
    return await order.bulkCreate(data)
}



exports.fetchSingleCartItem = async(cartId) =>{
    return await cart.findOne({where: {[PARAMS.cartId]: cartId}})
}