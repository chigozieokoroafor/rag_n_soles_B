const { DataTypes } = require("sequelize");
const { MODEL_NAMES, PARAMS } = require("../../util/consts");
const { conn } = require("../base");

const images = conn.define(MODEL_NAMES.images, {
    [PARAMS.id]:{
        type:DataTypes.INTEGER,
        unique:true,
        autoIncrement:true,
        primaryKey:true
    }, 
    [PARAMS.uid]:{
        type:DataTypes.STRING(255),
        allowNull:false
    },
    // [PARAMS.img_blob]:{
    //     type:DataTypes.BLOB("long"),
    //     allowNull:false
    // },

    [PARAMS.fileType]:{
        type:DataTypes.STRING(255),
        allowNull:false
    }
    
}, {
    tableName:MODEL_NAMES.images,
    modelName:MODEL_NAMES.images
})

module.exports = {
    images
}