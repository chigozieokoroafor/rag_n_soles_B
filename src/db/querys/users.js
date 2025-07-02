const { PARAMS } = require("../../util/consts")
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
            where:{uid},
            attributes:[PARAMS.email, PARAMS.uid, PARAMS.billing_address, PARAMS.shpping_address, PARAMS.business_name, PARAMS.username]
        }
    )
}