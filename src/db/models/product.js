require("dotenv").config()


const { DataTypes } = require("sequelize");
const { MODEL_NAMES, PARAMS } = require("../../util/consts");
const { conn } = require("../base");
const { createUUID } = require("../../util/base");
const { cart } = require("./cart");
const { order } = require("./order");

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
    status:{
        type:DataTypes.STRING(20),
        defaultValue:"Active"
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

const specifications = conn.define(MODEL_NAMES.specifications, {
    [PARAMS.id]:{
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    },
    [PARAMS.productId]:{
        type:DataTypes.STRING(255),
        allowNull:false
    },
    [PARAMS.name]:{
        type:DataTypes.STRING(255),
        allowNull:false
    },
    [PARAMS.units]:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:0
    }
}, {
    tableName: MODEL_NAMES.specifications,
    modelName: MODEL_NAMES.specifications,
})

const coupon = conn.define(MODEL_NAMES.coupon, {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    },
    code:{
        type:DataTypes.STRING(50),
        allowNull:false
    },
    type:{ //percentage or fixed
        type:DataTypes.STRING(20),
        allowNull:false
    },
    value:{
        type: DataTypes.DOUBLE,
        allowNull:false
    },
    startDate:{
        type: DataTypes.DATE,
        allowNull:true
    },
    endDate:{
        type: DataTypes.DATE,
        allowNull:true
    },
    limit:{
        type: DataTypes.INTEGER,
        allowNull:false
    },
    usage:{
        type: DataTypes.INTEGER,
        defaultValue:0
    },
    status:{
        type:DataTypes.STRING(20),
        defaultValue:"Active"
    }
})


product.hasMany(cart, {foreignKey:PARAMS.productId, sourceKey:PARAMS.uid})
cart.belongsTo(product, {foreignKey:PARAMS.productId, targetKey:PARAMS.uid})


product.hasMany(specifications, {foreignKey: PARAMS.productId, sourceKey: PARAMS.uid})
specifications.belongsTo(product, {foreignKey:PARAMS.productId, targetKey:PARAMS.uid})

product.hasMany(order, {foreignKey: PARAMS.productId, sourceKey: PARAMS.id})
order.belongsTo(product, {foreignKey: PARAMS.productId, targetKey: PARAMS.id })

module.exports = {
    product,
    coupon,
    specifications
}