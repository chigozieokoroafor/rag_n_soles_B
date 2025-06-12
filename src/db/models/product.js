require("dotenv").config()


const { DataTypes } = require("sequelize");
const { MODEL_NAMES, PARAMS } = require("../../util/consts");
const { conn } = require("../base");
const { createUUID } = require("../../util/base");
const { cart } = require("./cart");

const product = conn.define(MODEL_NAMES.product, {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    },
    uid: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        defaultValue: (() => createUUID())
    },
    categoryId: {
        type: DataTypes.STRING(255),
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    price: {
        type: DataTypes.DOUBLE
    },
    images: {
        type: DataTypes.JSON,
        allowNull: true
    },
    spec: { //{ name: "name of specification", "unit": number of products available for said size/specification}
        type: DataTypes.JSON,
        allowNull: true
    },
    isAvailable:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    },
    isDeleted:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    }


}, {
    tableName: MODEL_NAMES.product,
    modelName: MODEL_NAMES.product,
    indexes:[
        {
            type: 'FULLTEXT',
            name: "product_text_idx",
            fields: [PARAMS.name]
        },
    ]
})

product.hasMany(cart, {foreignKey:PARAMS.productId, sourceKey:PARAMS.uid})
cart.belongsTo(product, {foreignKey:PARAMS.productId, targetKey:PARAMS.uid})

module.exports = {
    product
}