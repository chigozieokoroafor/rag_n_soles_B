const { DataTypes } = require("sequelize");
const { MODEL_NAMES, STATUSES } = require("../../util/consts");
const { conn } = require("../base");
const { createLenUid } = require("../../util/base");

const order = conn.define(MODEL_NAMES.order, {
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
    orderId: {
        type: DataTypes.STRING(255),
        defaultValue: () =>"ORD_"+createLenUid(6)
        // unique:false
    },
    products: {
        type: DataTypes.JSON
    },
    paymentRef:{
        type: DataTypes.DOUBLE
    },
    status: { // delivered or not
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: STATUSES.pending
    },
    paymentStatus: { //status of payment
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: STATUSES.pending
    },
    total_amount:{
        type: DataTypes.DOUBLE,
        allowNull:false
    }
}, {
    tableName: MODEL_NAMES.order,
    modelName: MODEL_NAMES.order
})

module.exports = {
    order
}