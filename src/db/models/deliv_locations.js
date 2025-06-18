// contains model for billing locations and prices

const { DataTypes } = require("sequelize");
const { PARAMS, MODEL_NAMES } = require("../../util/consts");
const { conn } = require("../base");

const   deliv_locations = conn.define(MODEL_NAMES.deliv_locations, {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    },

    location:{
        type: DataTypes.STRING(255),
        allowNull: false
    },
    price: {
        type: DataTypes.DOUBLE
    },
    period:{
        type: DataTypes.STRING(255),
        allowNull: false
    },
}, {
    tableName:MODEL_NAMES.deliv_locations,
    modelName:MODEL_NAMES.deliv_locations
})

module.exports = {
    deliv_locations
}