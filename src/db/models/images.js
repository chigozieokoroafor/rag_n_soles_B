const { DataTypes } = require("sequelize");
const { MODEL_NAMES, PARAMS } = require("../../util/consts");
const { conn } = require("../base");

const images = conn.define(MODEL_NAMES.images, {
    [PARAMS.id]: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    },
    [PARAMS.productId]: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    [PARAMS.url]: {
        type: DataTypes.TEXT("long"),
        allowNull: false
    },

    [PARAMS.isDefault]: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }

}, {
    tableName: MODEL_NAMES.images,
    modelName: MODEL_NAMES.images,
    // indexes: [
    //     {
    //         // type: 'FULLTEXT',
    //         name: "images_productId_idx",
    //         fields: [PARAMS.productId]
    //     }
    // ]
})

module.exports = {
    images
}