const { DataTypes } = require("sequelize");
const { MODEL_NAMES, PARAMS } = require("../../util/consts");
const { conn } = require("../base");
const { createUUID } = require("../../util/base");

const admin = conn.define(MODEL_NAMES.admin, {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    },
    uid: {
        type: DataTypes.STRING(40),
        unique: true,
        defaultValue: () => createUUID()
    },
    [PARAMS.email]:{
        type: DataTypes.STRING(255),
        allowNull: false
    },
    username:{
        type: DataTypes.STRING(255),
        allowNull:false
    },
    password:{
        type: DataTypes.TEXT("long"),
        allowNull:false
    }
}, {
    tableName: MODEL_NAMES.admin,
    modelName: MODEL_NAMES.admin
})

module.exports = {
    admin
}