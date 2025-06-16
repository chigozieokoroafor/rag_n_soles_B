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
    name:{
        type: DataTypes.STRING(255),
        allowNull:false
    },
    phone_no:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    password:{
        type: DataTypes.TEXT("long"),
        allowNull:false
    },
    status:{
        type: DataTypes.STRING(50),
        defaultValue:"Active"
    },
    [PARAMS.role]:{
        type:DataTypes.STRING(20),
        defaultValue:"Admin"
    }
}, {
    tableName: MODEL_NAMES.admin,
    modelName: MODEL_NAMES.admin
})

module.exports = {
    admin
}