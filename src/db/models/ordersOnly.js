const { DataTypes } = require("sequelize");
const { MODEL_NAMES, STATUSES, PARAMS } = require("../../util/consts");
const { conn } = require("../base");
const { order } = require("./order");
const { deliv_locations } = require("./deliv_locations");
const { user } = require("./user");
// const { createLenUid } = require("../../util/base");

const ordersOnly = conn.define(MODEL_NAMES.ordersOnly, {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.STRING(40),
        allowNull: false
    },
    vendorName: {
        type: DataTypes.STRING(255),
    },
    orderId: {
        type: DataTypes.STRING(255),
    },
    reference: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    total_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    deliv_status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: STATUSES.pending,
    },
    statuses: {
        type: DataTypes.JSON,
        defaultValue: [STATUSES.pending]
        // allowNull:
    },
    [PARAMS.locationId]: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    discount_type: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    discount_value: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    },
    [PARAMS.deliveryMode]: {
        type: DataTypes.STRING(20),
    },
    [PARAMS.dest_address]: {
        type: DataTypes.JSON,
        allowNull: true
    },
}, {
    tableName: MODEL_NAMES.ordersOnly,
    modelName: MODEL_NAMES.ordersOnly
})

ordersOnly.hasMany(order, { foreignKey: PARAMS.orderId, sourceKey: PARAMS.orderId })
order.belongsTo(order, { foreignKey: PARAMS.orderId, sourceKey: PARAMS.orderId })

// deliv_locations.hasMany(ordersOnly, {foreignKey: PARAMS.locationId, sourceKey: PARAMS.id})
ordersOnly.hasOne(deliv_locations, {foreignKey: PARAMS.id, sourceKey: PARAMS.locationId, as:"deliveryLocation"})

user.hasMany(ordersOnly, { foreignKey: PARAMS.userId, sourceKey: PARAMS.uid })
ordersOnly.belongsTo(user, { foreignKey: PARAMS.userId, targetKey: PARAMS.uid })

module.exports = {
    ordersOnly
}