const { DataTypes } = require("sequelize");
const { MODEL_NAMES } = require("../../util/consts");
const { conn } = require("../base");

const shipping = conn.define(MODEL_NAMES.shipping, {
    id:{
        type:DataTypes.INTEGER,
        unique:true,
        autoIncrement:true,
        primaryKey:true
    }, 
    uid:{
        type:DataTypes.STRING(40),
        // unique:true
    },
    shippingAddress:{
        type: DataTypes.TEXT("medium"),
        allowNull:true
    },
    billingAddress:{
        type: DataTypes.TEXT("medium"),
        allowNull:true
    },
}, {
    tableName:MODEL_NAMES.shipping,
    modelName:MODEL_NAMES.shipping
})

module.exports = {
    shipping
}