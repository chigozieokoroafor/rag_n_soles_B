const { DataTypes } = require("sequelize");
const { MODEL_NAMES } = require("../../util/consts");
const { conn } = require("../base");

const admin = conn.define(MODEL_NAMES.admin, {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    },
    uid: {
        type: DataTypes.STRING(40),
        unique: true
    }
}, {
    tableName: MODEL_NAMES.admin,
    modelName: MODEL_NAMES.admin
})

module.exports = {
    admin
}