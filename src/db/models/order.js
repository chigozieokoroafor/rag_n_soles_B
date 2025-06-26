const { DataTypes } = require("sequelize");
const { MODEL_NAMES, STATUSES } = require("../../util/consts");
const { conn } = require("../base");
// const { createLenUid } = require("../../util/base");

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
        // defaultValue: () =>"ORD_"+createLenUid(6)
        // unique:false
    },
    productId: {
        type: DataTypes.STRING(255)
    },

    specifications:{
        type: DataTypes.JSON
    }
    
    
}, {
    tableName: MODEL_NAMES.order,
    modelName: MODEL_NAMES.order
})

module.exports = {
    order
}