const { createUUID, sendAdminMailCredentials } = require("../../util/base");
const { PARAMS } = require("../../util/consts");
const { admin } = require("../models/admin");
const { hashSync } = require("bcryptjs");
const { user } = require("../models/user");
const { deliv_locations } = require("../models/deliv_locations");

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

exports.fetchAdminForProfile = async (uid) => {
    return await admin.findOne(
        {
            where: { uid },
            attributes: [PARAMS.email, PARAMS.status, PARAMS.name, PARAMS.role, PARAMS.phone_no, PARAMS.business_name, PARAMS.billing_address]
        }
    )
}

exports.updateAdminProfile = async(uid, update) =>{
   await admin.update(update, {where:{uid}})
}

exports.fetchAdmninforMiddleware = async (uid) => {
    return await admin.findOne(
        {
            where: {
                [PARAMS.uid]: uid
            },
            attributes: [PARAMS.uid]

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
            [PARAMS.name]: "admin",
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

exports.insertExtraAdmin = async (data) => {
    return await admin.create(data)
}

exports.getAllUsers = async (query, limit, offset) => {
    return await user.findAll(
        {
            where: query,
            attributes: [PARAMS.uid, PARAMS.username, PARAMS.email, PARAMS.name, PARAMS.phone_no, PARAMS.createdAt, PARAMS.status, PARAMS.billing_address, PARAMS.shpping_address, PARAMS.business_name],
            order: [[PARAMS.createdAt, "DESC"]],
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

exports.countVendors = async (where) => {
    return await user.count(
        {
            where: where
        }
    )
}

exports.getadmins = async () => {
    return await admin.findAll(
        {
            attributes: [PARAMS.uid, PARAMS.name, PARAMS.email, PARAMS.status, PARAMS.phone_no, PARAMS.role, PARAMS.createdAt]
        }
    )
}

exports.updateAdminDetails = async (uid, update) => {
    return await admin.update(update, { where: { uid } })
}

exports.createDeliveryLocations = async (data) => {
    return await deliv_locations.create(data)
}

exports.fetchLocations = async () => {
    return await deliv_locations.findAll({})
}

exports.fetchSpecLocation = async (id) => {
    return await deliv_locations.findOne({ where: { id } })
}


exports.updateSpecLocation = async (id, update) => {
    return await deliv_locations.update(update, {
        where: { id }
    })
}

exports.deleteLocation = async (id) => {
    return await deliv_locations.destroy({ where: { id } })
}