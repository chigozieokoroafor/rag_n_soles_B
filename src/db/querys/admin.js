const { createUUID, sendAdminMailCredentials } = require("../../util/base");
const { PARAMS } = require("../../util/consts");
const { admin } = require("../models/admin");
const { hashSync } = require("bcryptjs")

exports.checkAdmin = async (uid) => {
    return await admin.findOne({ where: { uid } })
}

exports.fetchAdmninforLogin = async(username) =>{
    return await admin.findOne(
        {
            where:{
                [PARAMS.email]: username
            }
        }
    )
}

exports.checkAdminExists = async () => {
    return await admin.findOne()
}

exports.createFirstAdmin = async () => {
    const pwd = createUUID()
    const d = (await admin.create(
        {
            [PARAMS.email]:process.env.DEFAULT_RECIEPIENT,
            [PARAMS.username]: "admin",
            [PARAMS.password]: hashSync(pwd)
        }
    ))?.toJSON()

    return {[PARAMS.email]:process.env.DEFAULT_RECIEPIENT, user: "admin", pwd: pwd}
}

exports.createAdmin = async() =>{
    const exists = await this.checkAdminExists()
    if(!exists){
        const cred = await this.createFirstAdmin()

        sendAdminMailCredentials(cred.email, cred.pwd)

        console.log("cred========", cred)
    }
}