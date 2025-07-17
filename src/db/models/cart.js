const { DataTypes } = require("sequelize");
const { MODEL_NAMES, STATUSES, PARAMS, DELIVERY_MODES } = require("../../util/consts");
const { conn } = require("../base");
const { generate } = require("rand-token");
const { createUUID } = require("../../util/base");

const cart = conn.define(MODEL_NAMES.cart,
    
    {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
            autoIncrement: true,
            primaryKey: true
        },
        cartId: {
            type: DataTypes.STRING(255),
            defaultValue: () => createUUID()
        },
        userId: {
            type: DataTypes.STRING(40),
            allowNull: false
        },
        products: {
            type: DataTypes.JSON
        },
        paymentStatus: { //status of payment
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: STATUSES.pending
        },
        total_amount: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        [PARAMS.isDeliveryFree]:{
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        [PARAMS.locationId]:{
            type: DataTypes.INTEGER,
            allowNull: true
        },
        deliveryMode:{
            type: DataTypes.STRING(20),
            defaultValue: DELIVERY_MODES.pickup
        },
        dest_address:{
            type: DataTypes.JSON,
            allowNull:true
        },

        expiredAt: {
            type: DataTypes.DATE,
            defaultValue: () => new Date(new Date().setMinutes(new Date().getMinutes() + 15))
        }
    }
    , {
        tableName: MODEL_NAMES.cart,
        modelName: MODEL_NAMES.cart
    })

module.exports = {
    cart
}