const { DataTypes } = require("sequelize");
const { MODEL_NAMES, STATUSES, PARAMS } = require("../../util/consts");
const { conn } = require("../base");
const { createUUID } = require("../../util/base");

const user = conn.define(MODEL_NAMES.user, {
    id:{
        type:DataTypes.INTEGER,
        unique:true,
        autoIncrement:true,
        primaryKey:true
    }, 
    uid:{
        type:DataTypes.STRING(40),
        unique:true,
        defaultValue: () => createUUID()
    },
    name:{
        type: DataTypes.STRING(255),
        allowNull:true
    },
    phone_no:{
        type: DataTypes.STRING(255),
        allowNull:true
    },
    email:{
        type: DataTypes.STRING(255),
        allowNull:true,
        validate:{
            isEmail:true
        }
    },
    password:{
        type:DataTypes.TEXT("long")
    },
    isVerified:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    isAdminVerified:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },

    status:{
        type:DataTypes.STRING(255),
        defaultValue: STATUSES.pending
    },
    business_name:{
        type:DataTypes.STRING(255),
        allowNull:false
    },

    billing_address:{
        type: DataTypes.TEXT("long"),
        allowNull:true
    },
    [PARAMS.shpping_address]:{
        type: DataTypes.TEXT("long"),
        allowNull:true 
    }  
}, {
    tableName:MODEL_NAMES.user,
    modelName:MODEL_NAMES.user
})

module.exports = {
    user
}