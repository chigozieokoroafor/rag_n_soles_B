const { DataTypes } = require("sequelize");
const { MODEL_NAMES, STATUSES, PARAMS } = require("../../util/consts");
const { conn } = require("../base");
const { createLenUid } = require("../../util/base");
const { order } = require("./order");

const transaction = conn.define(MODEL_NAMES.transaction, {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    },
    orderId: {
        type: DataTypes.STRING(40),
        unique: true,
        defaultValue: () => `ORD_${createLenUid(5)}`
    },
    userId: {
        type: DataTypes.STRING(255),
        allowNull:false
    },
    reference: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    amount: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING(50),
        defaultValue: STATUSES.success
    }
}, {
    tableName: MODEL_NAMES.transaction,
    modelName: MODEL_NAMES.transaction
})


transaction.hasMany(order, {foreignKey: PARAMS.orderId})
order.belongsTo(transaction, {foreignKey: PARAMS.orderId})


module.exports = {
    transaction
}