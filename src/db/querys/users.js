const { Op } = require("sequelize")
const { PARAMS } = require("../../util/consts")
const { notifications } = require("../models/notifications")
const { user } = require("../models/user")

exports.checkUserExists = async (email) => {
    return user.findOne({ where: { email }, attributes: [PARAMS.id] })
}

exports.getUserByEmail = async (email) => {
    return user.findOne({ where: { email } })
}

exports.createUserAccount = async (body) => {
    return await user.create(body)
}

exports.verifyUser = async (uid) => {
    return await user.update({ isVerified: true }, { where: { uid } })
}

exports.fetchUserForMiddleware = async (uid) => {
    return await user.findOne(
        {
            where: { uid },
            attributes: [PARAMS.email, PARAMS.uid, PARAMS.billing_address, PARAMS.shpping_address, PARAMS.business_name, PARAMS.name, PARAMS.phone_no]
        }
    )
}

exports.updateUserdetail = async (uid, update) => {
    await user.update(update, { where: { uid } })
}

exports.createNotification = async (title, description, alert_, type) => {
    await notifications.create({
        title,
        description,
        alert: alert_,
        type: type
    })
}

exports.fetchNotifications = async (query, limit, offset) => {
    return await notifications.findAll(
        {
            where: query,
            limit,
            offset,
            order: [["createdAt", "DESC"]]
        }
    )
}

exports.countNotifications = async(query) =>{
    return await notifications.count({where:query})
}

exports.readNotification = async(notificationIds) =>{
    await notifications.update({[PARAMS.isRead] : true}, {where: {
        id:{[Op.in]: notificationIds}
    }})
}