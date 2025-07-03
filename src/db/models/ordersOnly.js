const { DataTypes } = require("sequelize");
const { MODEL_NAMES, STATUSES, PARAMS } = require("../../util/consts");
const { conn } = require("../base");
const { order } = require("./order");
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
    
    discount_type:{
        type:DataTypes.STRING(20),
        allowNull:true
    },
    discount_value:{
        type:DataTypes.DOUBLE,
        defaultValue:0
        
    },
    [PARAMS.deliveryMode]:{
        type: DataTypes.STRING(20),
    }
}, {
    tableName: MODEL_NAMES.ordersOnly,
    modelName: MODEL_NAMES.ordersOnly
})

ordersOnly.hasMany(order, {foreignKey: PARAMS.orderId, sourceKey: PARAMS.orderId})

order.belongsTo(order, {foreignKey: PARAMS.orderId, sourceKey: PARAMS.orderId})

module.exports = {
    ordersOnly
}