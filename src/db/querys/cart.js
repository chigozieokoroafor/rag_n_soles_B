const { PARAMS, STATUSES } = require("../../util/consts");
const { cart } = require("../models/cart");
const { order } = require("../models/order");
const { ordersOnly } = require("../models/ordersOnly");
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

exports.fetchSingleCartItem = async (cartId) => {
    return await cart.findOne({ where: { [PARAMS.cartId]: cartId } })
}

exports.countOrders = async (userId) => {

    const data = {
        total: await ordersOnly.count(
            {
                where: {
                    userId
                }
            }
        ),
        pending: await ordersOnly.count(
            {
                where: {
                    userId,
                    [PARAMS.deliv_status]: STATUSES.pending
                }
            }
        ),
        transit: await ordersOnly.count(
            {
                where: {
                    userId,
                    [PARAMS.deliv_status]: STATUSES.transit
                }
            }
        ),
        delivered: await ordersOnly.count(
            {
                where: {
                    userId,
                    [PARAMS.deliv_status]: STATUSES.delivered
                }
            }
        ),
    }

    return data


}

exports.fetchOrdersQuery = async (userId, limit, skip) => {
    return await ordersOnly.findAll(
        {
            where: {
                userId: userId,

            },
            attributes:[PARAMS.orderId, PARAMS.total_amount, PARAMS.deliv_status, PARAMS.discount_type, PARAMS.discount_value],
            limit: limit,
            offset: skip,
            order: [
                [PARAMS.createdAt, "DESC"]
            ]
        }
    )
}

exports.insertIntoOrdersOnly = async (data) =>{
    await ordersOnly.create(data)
}