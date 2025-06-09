const { DataTypes } = require("sequelize");
const { MODEL_NAMES } = require("../../util/consts");
const { conn } = require("../base");

const review = conn.define(MODEL_NAMES.review, {
    id:{
        type:DataTypes.INTEGER,
        unique:true,
        autoIncrement:true,
        primaryKey:true
    }, 
    uid:{
        type:DataTypes.STRING(40),
        allowNull:true
    },
    name:{
        type: DataTypes.STRING(255),
        allowNull:true
    },
    email:{
        type: DataTypes.STRING(255),
        allowNull:true,
        validate:{
            isEmail:true
        }
    }
}, {
    tableName:MODEL_NAMES.review,
    modelName:MODEL_NAMES.review
})

module.exports = {
    review
}