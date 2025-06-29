const { DataTypes } = require("sequelize");
const { MODEL_NAMES, STATUSES } = require("../../util/consts");
const { conn } = require("../base");
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
    orderId: {
        type: DataTypes.STRING(255),
        // defaultValue: () =>"ORD_"+createLenUid(6)
        // unique:false
    },
    reference:{
        type: DataTypes.STRING(255),
        allowNull:false
    },
    total_amount:{
        type: DataTypes.DOUBLE,
        allowNull:false
    },
    deliv_status:{
        type: DataTypes.STRING(20),
        allowNull:false,
        defaultValue:STATUSES.pending,   
    },
    paymentStatus:{
        type: DataTypes.STRING(20),
        allowNull:false,
        defaultValue:STATUSES.pending,
    }
}, {
    tableName: MODEL_NAMES.ordersOnly,
    modelName: MODEL_NAMES.ordersOnly
})

module.exports = {
    ordersOnly
}