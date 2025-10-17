const { PARAMS } = require("../../util/consts")
const { cart } = require("./cart")
const { category } = require("./category")
const { deliv_locations } = require("./deliv_locations")
const { images } = require("./images")
const { notifications } = require("./notifications")
const { order } = require("./order")
const { ordersOnly } = require("./ordersOnly")
const { product, specifications, coupon } = require("./product")
const { transaction } = require("./transaction")
const { user } = require("./user")


category.hasMany(product, {foreignKey:PARAMS.categoryId, sourceKey:PARAMS.uid, as:"Product"})
product.belongsTo(category, {foreignKey:PARAMS.categoryId, targetKey:PARAMS.uid, as:"Category"})

ordersOnly.hasMany(order, { foreignKey: PARAMS.orderId, sourceKey: PARAMS.orderId })
order.belongsTo(ordersOnly, { foreignKey: PARAMS.orderId, sourceKey: PARAMS.orderId })

// deliv_locations.hasMany(ordersOnly, {foreignKey: PARAMS.locationId, sourceKey: PARAMS.id})
ordersOnly.hasOne(deliv_locations, {foreignKey: PARAMS.id, sourceKey: PARAMS.locationId, as:"deliveryLocation"})

user.hasMany(ordersOnly, { foreignKey: PARAMS.userId, sourceKey: PARAMS.uid })
ordersOnly.belongsTo(user, { foreignKey: PARAMS.userId, targetKey: PARAMS.uid })

product.hasMany(specifications, {foreignKey: PARAMS.productId, sourceKey: PARAMS.uid})
specifications.belongsTo(product, {foreignKey:PARAMS.productId, targetKey:PARAMS.uid})

product.hasMany(order, {foreignKey: PARAMS.productId, sourceKey: PARAMS.id})
order.belongsTo(product, {foreignKey: PARAMS.productId, targetKey: PARAMS.id })

product.hasMany(images, {foreignKey: PARAMS.productId, sourceKey: PARAMS.uid})
product.hasOne(images, {
    as: 'defaultImage',
    foreignKey: PARAMS.productId,
    sourceKey: PARAMS.uid,
    scope: {
        isDefault: true
    }
});
images.belongsTo(product, {foreignKey: PARAMS.productId, targetKey: PARAMS.uid})

product.hasMany(order, {foreignKey: PARAMS.productId, sourceKey: PARAMS.uid})
order.belongsTo(product, {foreignKey: PARAMS.productId, targetKey: PARAMS.uid})

transaction.hasMany(order, {foreignKey: PARAMS.orderId, sourceKey: PARAMS.orderId})
order.belongsTo(transaction, {foreignKey: PARAMS.orderId, targetKey:PARAMS.orderId})


module.exports = {
    category,
    transaction,
    product,
    order,
    ordersOnly,
    images,
    specifications,
    user,
    deliv_locations,
    coupon,
    notifications,
    cart

}