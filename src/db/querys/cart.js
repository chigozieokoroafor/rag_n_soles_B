const { Sequelize, Op } = require("sequelize");
const { PARAMS, STATUSES, MODEL_NAMES } = require("../../util/consts");
const { cart } = require("../models/cart");
const { deliv_locations } = require("../models/deliv_locations");
const { images } = require("../models/images");
const { order } = require("../models/order");
const { ordersOnly } = require("../models/ordersOnly");
const { product } = require("../models/product");
const { user } = require("../models/user");

exports.addToCartQuery = async (data) => {
    return await cart.create(data)
}

exports.fetchCartItemsToOrder = async (uid) => {
    return await cart.findAll(
        {
            where: {
                uid,
                [PARAMS.ordered]: false

            },
            attributes: [PARAMS.id, PARAMS.total_amount]
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

exports.fetchOrdersQuery = async (whereQ, limit, skip) => {
    return await ordersOnly.findAll(
        {
            where: whereQ,
            // attributes: [PARAMS.orderId, PARAMS.total_amount, PARAMS.deliv_status, PARAMS.discount_type, PARAMS.discount_value],
            limit: limit,
            offset: skip,
            attributes: [PARAMS.orderId, PARAMS.total_amount, PARAMS.deliv_status, PARAMS.discount_type, PARAMS.discount_value, PARAMS.createdAt, PARAMS.deliveryMode, PARAMS.dest_address],
            include: [
                {
                    model: order,
                    attributes: [PARAMS.specifications],
                    include: [
                        {
                            model: product,
                            attributes: [PARAMS.name, PARAMS.price],
                            include: {
                                model: images,
                                attributes: [PARAMS.url, PARAMS.isDefault],
                                as: "defaultImage"

                            }
                        }
                    ]
                },
                {
                    model: deliv_locations,
                    attributes: [PARAMS.location, PARAMS.price, PARAMS.period],
                    as: "deliveryLocation"
                }
            ],
            order: [
                [PARAMS.createdAt, "DESC"]
            ]
        }
    )
}

exports.fetchOrdersQueryAdmin = async (query, limit, skip) => {
    return await ordersOnly.findAll(
        {
            where: query,

            // attributes: [PARAMS.orderId, PARAMS.total_amount, PARAMS.deliv_status, PARAMS.discount_type, PARAMS.discount_value],
            limit: limit,
            offset: skip,
            attributes: [PARAMS.orderId, PARAMS.total_amount, PARAMS.deliv_status, PARAMS.statuses, PARAMS.discount_type, PARAMS.discount_value, PARAMS.createdAt, PARAMS.deliveryMode, PARAMS.dest_address],
            include: [

                {
                    model: deliv_locations,
                    attributes: [PARAMS.location, PARAMS.price, PARAMS.period],
                    as: "deliveryLocation"
                },

                {
                    model: order,
                    attributes: [PARAMS.specifications],
                    include: [
                        {
                            model: product,
                            attributes: [PARAMS.name, PARAMS.price,],
                            include: {
                                model: images,
                                attributes: [PARAMS.url, PARAMS.isDefault],
                                as: "defaultImage"

                            }
                        }
                    ]
                }
            ],
            order: [
                [PARAMS.createdAt, "DESC"]
            ]
        }
    )
}

exports.countAllOrders = async (query) => {
    return await ordersOnly.count({ where: query })
}

exports.insertIntoOrdersOnly = async (data) => {
    data.statuses = [STATUSES.pending]
    return await ordersOnly.create(data)
}

exports.fetchSingleOrderDetail = async (orderId) => {

    return await ordersOnly.findOne(
        {
            where: {
                orderId
            }
        }
    )
}

exports.fetchOrderDetailForReciept = async (orderId) => {

    // product.hasOne(images, { foreignKey: PARAMS.productId, sourceKey: PARAMS.uid })
    // images.belongsTo(product, { foreignKey: PARAMS.productId, targetKey: PARAMS.uid })

    return await ordersOnly.findOne(
        {
            where: {
                orderId
            },
            attributes: [PARAMS.total_amount, PARAMS.deliv_status, PARAMS.discount_type, PARAMS.dest_address, PARAMS.discount_value, PARAMS.createdAt],
            include: [
                {
                    model: order,
                    attributes: [PARAMS.specifications],
                    include: [
                        {
                            model: product,
                            attributes: [PARAMS.name, PARAMS.price,],
                            include: {
                                model: images,
                                attributes: [PARAMS.url, PARAMS.isDefault],
                                as: "defaultImage"

                            }
                        }
                    ]
                },
                {
                    model: deliv_locations,
                    attributes: [PARAMS.location, PARAMS.price, PARAMS.period],
                    as: "deliveryLocation"
                }
            ]
        }
    )
}

exports.updateOrderStatus = async (orderId, update) => {
    await ordersOnly.update(update, { where: { orderId } })
}

exports.getTotal = async (startDate, endDate) => {
  return await ordersOnly.findAll({
    where: {
      [PARAMS.createdAt]: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    },
    attributes: [
      [Sequelize.fn("SUM", Sequelize.col(PARAMS.total_amount)), "total"]
    ],
    raw: true
  });
};

exports.getDailyTotals = async (startDate, endDate) => {
  return await ordersOnly.findAll({
    where: {
      [PARAMS.createdAt]: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    },
    attributes: [
      [
        Sequelize.literal(`TO_CHAR("${MODEL_NAMES.ordersOnly}"."${PARAMS.createdAt}", 'YYYY-MM-DD')`),
        'date'
      ],
      [
        Sequelize.fn('SUM', Sequelize.col(PARAMS.total_amount)),
        'total'
      ]
    ],
    group: [Sequelize.literal(`TO_CHAR("${MODEL_NAMES.ordersOnly}"."${PARAMS.createdAt}", 'YYYY-MM-DD')`)],
    order: [[Sequelize.literal(`TO_CHAR("${MODEL_NAMES.ordersOnly}"."${PARAMS.createdAt}", 'YYYY-MM-DD')`), 'ASC']],
    raw: true
  });
};