const { DataTypes } = require("sequelize");
const { MODEL_NAMES, PARAMS } = require("../../util/consts");
const { conn } = require("../base");

const notifications = conn.define(MODEL_NAMES.notifications, {
    [PARAMS.id]: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull:false,
        primaryKey:true
    },
    [PARAMS.type]:{
        type: DataTypes.STRING(20),
        allowNull:false
    },
    [PARAMS.title]: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    [PARAMS.description]:{
        type: DataTypes.TEXT("medium"),
        allowNull:false
    },
    [PARAMS.alert]:{
        type: DataTypes.STRING(20),
        allowNull:false
    },
    [PARAMS.isRead]:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: MODEL_NAMES.notifications,
    modelName: MODEL_NAMES.notifications

})

module.exports = {
    notifications
}