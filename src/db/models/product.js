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
        defaultValue: createUUID
    },
    categoryId: {
        type: DataTypes.STRING(255),
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    discount: {
        type: DataTypes.DOUBLE,
        defaultValue: 0.0
    },
    discountExpiry:{
        type:DataTypes.DATE,
        allowNull:true
    },
    price: {
        type: DataTypes.DOUBLE
    },
    img_url: {
        type: DataTypes.TEXT("medium"),
        allowNull: true
    },

    colors: {
        type: DataTypes.JSON,
    },

    description: {
        type: DataTypes.TEXT("long"),
        allowNull: true
    },

    units: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    specifications: {
        type: DataTypes.JSON,
        allowNull: true
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
    ],
    hooks: {
        beforeCreate: (product, options) => {
            if (!product.img_url && product.uid) {
                product.img_url = `${process.env.API_BASE_URL}/api/images/${product.uid}`;
            }
        }
    }
})

product.hasMany(cart, {foreignKey:PARAMS.productId, sourceKey:PARAMS.uid})
cart.belongsTo(product, {foreignKey:PARAMS.productId, targetKey:PARAMS.uid})

module.exports = {
    product
}