const { DataTypes } = require("sequelize");
const { MODEL_NAMES, STATUSES } = require("../../util/consts");
const { conn } = require("../base");

const order = conn.define(MODEL_NAMES.order, {
    id:{
        type:DataTypes.INTEGER,
        unique:true,
        autoIncrement:true,
        primaryKey:true
    }, 
    orderId:{
        type:DataTypes.STRING(255),
        // unique:false
    },
    cart_Id:{
        type: DataTypes.STRING(255),
        allowNull:false
    },
    status:{ // delivered or not
        type: DataTypes.STRING(255),
        allowNull:false,
        defaultValue:STATUSES.pending
    },
    paymentStatus:{ //status of payment
        type: DataTypes.STRING(255),
        allowNull:false,
        defaultValue:STATUSES.pending
    }
}, {
    tableName:MODEL_NAMES.order,
    modelName:MODEL_NAMES.order
})

module.exports = {
    order
}