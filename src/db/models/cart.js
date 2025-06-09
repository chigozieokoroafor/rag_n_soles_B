const { DataTypes } = require("sequelize");
const { MODEL_NAMES, STATUSES, PARAMS } = require("../../util/consts");
const { conn } = require("../base");

const cart = conn.define(MODEL_NAMES.cart, {
    [PARAMS.id]:{
        type:DataTypes.INTEGER,
        unique:true,
        autoIncrement:true,
        primaryKey:true
    }, 
    [PARAMS.productId]:{
        type:DataTypes.STRING(40),
        unique:true
    },
    [PARAMS.uid]:{
        type:DataTypes.STRING(255),
        allowNull:false
    },
    [PARAMS.units]:{
        type: DataTypes.STRING(255),
        allowNull:true
    },
    [PARAMS.specifications]:{
        type:DataTypes.JSON
    },
    [PARAMS.unit_price]:{
        type: DataTypes.DOUBLE
    },
    [PARAMS.total_amount]:{
        type:DataTypes.DOUBLE
    },
    [PARAMS.orderId]:{
        type:DataTypes.STRING,
        allowNull:true
    },
    [PARAMS.ordered]:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    }
}, {
    tableName:MODEL_NAMES.cart,
    modelName:MODEL_NAMES.cart
})

module.exports = {
    cart
}