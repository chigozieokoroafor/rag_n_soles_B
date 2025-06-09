const { admin } = require("../models/admin");

exports.checkAdmin = async(uid) =>{
    return admin.findOne({where:{uid}})
}