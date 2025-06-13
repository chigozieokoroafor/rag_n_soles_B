const { createUUID, sendAdminMailCredentials } = require("../../util/base");
const { PARAMS } = require("../../util/consts");
const { admin } = require("../models/admin");
const { hashSync } = require("bcryptjs");
const { user } = require("../models/user");

exports.checkAdmin = async (uid) => {
    return await admin.findOne({ where: { uid } })
}

exports.fetchAdmninforLogin = async (username) => {
    return await admin.findOne(
        {
            where: {
                [PARAMS.email]: username
            },

        }
    )
}

exports.fetchAdmninforMiddleware = async (uid) => {
    return await admin.findOne(
        {
            where: {
                [PARAMS.uid]: uid
            },

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
            [PARAMS.email]: process.env.DEFAULT_RECIEPIENT,
            [PARAMS.username]: "admin",
            [PARAMS.password]: hashSync(pwd)
        }
    ))?.toJSON()

    return { [PARAMS.email]: process.env.DEFAULT_RECIEPIENT, user: "admin", pwd: pwd }
}

exports.createAdmin = async () => {
    const exists = await this.checkAdminExists()
    if (!exists) {
        const cred = await this.createFirstAdmin()

        sendAdminMailCredentials(cred.email, cred.pwd)

        console.log("cred========", cred)
    }
}

exports.getAllUsers = async (query, limit, offset) => {
    return await user.findAll(
        {
            where:query,
            attributes: [PARAMS.uid, PARAMS.username, PARAMS.email, PARAMS.name, PARAMS.phone_no, PARAMS.createdAt, PARAMS.status, PARAMS.billing_address, PARAMS.shpping_address],
            limit,
            offset
        }
    )
}

exports.updateUserStatus = async (uid, status) => {
   return await user.update(
        {
            [PARAMS.status]: status, 
            [PARAMS.isAdminVerified]: true
        }, {
        where: {
            [PARAMS.uid]: uid
        }
    })
}

exports.countVendors = async (where) =>{
    return await  user.count(
        {
            where:where
        }
    )
}