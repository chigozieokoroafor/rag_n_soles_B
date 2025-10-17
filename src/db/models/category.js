const { DataTypes } = require("sequelize");
const { MODEL_NAMES, PARAMS } = require("../../util/consts");
const { conn } = require("../base");
const { createUUID } = require("../../util/base");
const { product } = require("./product");

const category = conn.define(MODEL_NAMES.user, {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    },
    uid:{
        type:DataTypes.STRING(255),
        allowNull:false,
        unique:true,
        defaultValue: (() => createUUID())
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    spec:{
        type: DataTypes.JSON,
        allowNull:false
    },
    description:{
        type:DataTypes.TEXT("long"),
        allowNull:true
    }
    // img_url: {
    //     type: DataTypes.TEXT("medium"),
    //     allowNull: true
    // }
}, {
    tableName: MODEL_NAMES.category,
    modelName: MODEL_NAMES.category,
    // hooks: {
    //     beforeCreate: (category, options) => {
    //         if (!category.img_url && category.uid) {
    //             category.img_url = `https://yourdomain.com/images/${category.uid}`;
    //         }
    //     }
    // }
}
)


module.exports = {
    category
}