const { DataTypes } = require("sequelize");
const { MODEL_NAMES, STATUSES, PARAMS } = require("../../util/consts");
const { conn } = require("../base");
const { order } = require("./order");
const { deliv_locations } = require("./deliv_locations");
const { user } = require("./user");
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
        allowNull: true
    },
    vendorName: {
        type: DataTypes.STRING(255),
    },
    orderId: {
        type: DataTypes.STRING(255),
    },
    reference: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    total_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    deliv_status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: STATUSES.pending,
    },
    statuses: {
        type: DataTypes.JSON,
        defaultValue: [STATUSES.pending]
        // allowNull:
    },
    [PARAMS.locationId]: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    discount_type: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    discount_value: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    },
    [PARAMS.deliveryMode]: {
        type: DataTypes.STRING(20),
    },
    [PARAMS.dest_address]: {
        type: DataTypes.JSON,
        allowNull: true
    },

    // [PARAMS.year]:{
    //     type: DataTypes.INTEGER,
    //     allowNull: false,
    //     defaultValue: ()=>{ new Date().getFullYear() }
    // },
    // [PARAMS.month]:{
    //     type: DataTypes.INTEGER,
    //     allowNull: false,
    //     defaultValue: ()=>{ new Date().getMonth() }
    // },
    // [PARAMS.date]:{
    //     type: DataTypes.INTEGER,
    //     allowNull: false,
    //     defaultValue: () =>{new Date().getDate()}
    // }
}, {
    tableName: MODEL_NAMES.ordersOnly,
    modelName: MODEL_NAMES.ordersOnly
})



module.exports = {
    ordersOnly
}