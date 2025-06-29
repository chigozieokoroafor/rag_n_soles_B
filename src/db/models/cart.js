const { DataTypes } = require("sequelize");
const { MODEL_NAMES, STATUSES, PARAMS } = require("../../util/consts");
const { conn } = require("../base");
const { generate } = require("rand-token");
const { createUUID } = require("../../util/base");

const cart = conn.define(MODEL_NAMES.cart,
    // {
    //     [PARAMS.id]: {
    //         type: DataTypes.INTEGER,
    //         unique: true,
    //         autoIncrement: true,
    //         primaryKey: true
    //     },
    //     [PARAMS.productId]: {
    //         type: DataTypes.STRING(40),
    //         unique: true
    //     },
    //     [PARAMS.uid]: {
    //         type: DataTypes.STRING(255),
    //         allowNull: false
    //     },
    //     [PARAMS.units]: {
    //         type: DataTypes.STRING(255),
    //         allowNull: true
    //     },
    //     [PARAMS.specifications]: {
    //         type: DataTypes.JSON
    //     },
    //     [PARAMS.unit_price]: {
    //         type: DataTypes.DOUBLE
    //     },
    //     [PARAMS.total_amount]: {
    //         type: DataTypes.DOUBLE
    //     },
    //     [PARAMS.orderId]: {
    //         type: DataTypes.STRING,
    //         allowNull: true
    //     },
    //     [PARAMS.ordered]: {
    //         type: DataTypes.BOOLEAN,
    //         defaultValue: false
    //     }
    // }
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