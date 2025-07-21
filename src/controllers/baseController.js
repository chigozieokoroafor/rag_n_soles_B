require("dotenv").config()

const { fetchAdmninforLogin, updateAdminProfile, fetchAdmninforMiddleware } = require("../db/querys/admin");
const { checkUserExists, createUserAccount, verifyUser, getUserByEmail, createNotification, fetchUserForMiddleware, updateUserdetail } = require("../db/querys/users");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, success, newError, notFound, redirect, expired, invalid } = require("../errorHandler/statusCodes");
const { sendAccountVerificationMail, hashPassword, generateToken, createUUID, verifytoken, checkPassword, sendPasswordResetMail } = require("../util/base");
const { PARAMS, NOTIFICATION_TITLES } = require("../util/consts");
const { createAccountSchema, loginValidator } = require("../util/validators/accountValidator");
const jwt = require("jsonwebtoken")


exports.createAccount = catchAsync(async (req, res) => {
    const valid_ = createAccountSchema.validate(req.body)
    if (valid_.error) {
        return generalError(res, valid_.error.message, {})
    }

    // use express sesion for this. and not normal bearer jwts

    const { email, name, password } = req.body

    const user = await checkUserExists(email)
    if (user) {
        return generalError(res, "Account exists with email provided")
    }

    req.body.password = hashPassword(password)
    const uid = createUUID()
    req.body.uid = uid


    try {
        await createUserAccount(req.body)
    } catch (error) {
        console.log("error:::createAccount", error)
        return generalError(res, "Unable to create account at this time.")
    }



    const token = generateToken({ id: uid }, 1 * 10 * 60, process.env.AUTH_SECRET)
    const baseUrl = process.env.API_BASE_URL + `?token=${token}`

    // console.log("ur:::, base:::", baseUrl)

    success(res, {}, "Verification mail sent to Mail")

    sendAccountVerificationMail(email, baseUrl, name)


})

exports.verify = catchAsync(async (req, res) => {
    const { token } = req.query

    const payload = verifytoken(token)
    if (!payload.success) {
        return newError(res, payload.err, payload.err_status)
    }

    // console.log("payload:::", payload)
    const uid = payload.d.id
    const user = fetchUserForMiddleware(uid)
    if (!user) {
        return notFound(res, "User not found")
    }

    const update = await verifyUser(uid)

    if (update[0] < 1) {
        return generalError(res, "Unable to verify mail")
    }
    await createNotification(NOTIFICATION_TITLES.vendor.title, `${user[PARAMS.business_name]} just created an account and is waiting for approval`, NOTIFICATION_TITLES.vendor.alert, NOTIFICATION_TITLES.vendor.type)
    return redirect(res, process.env.WEB_BASE_URL_VERIFICATION)

})

exports.login = catchAsync(async (req, res) => {

    const valid_ = loginValidator.validate(req.body)

    if (valid_.error) {
        return generalError(res, valid_.error.message)
    }

    let user_type = "Vendor"
    let user

    const promises = await Promise.allSettled([getUserByEmail(req.body?.email), fetchAdmninforLogin(req.body?.email)])

    const vendor = promises[0].value
    const admin = promises[1].value


    if (vendor) {
        user = vendor
    }

    if (admin) {
        user_type = "Admin"
        user = admin
    }


    if (!user) {
        return notFound(res, "Account with email provided not found")
    }

    const passwordMatch = checkPassword(req.body?.password, user.password)
    if (!passwordMatch) {
        return generalError(res, "Invalid Credentials")
    }


    if (user_type == "Vendor" && !user[PARAMS.isAdminVerified]) {
        return generalError(res, "Account requires validation by admin.", {})
    }

    const secret = user_type == "Vendor" ? process.env.AUTH_SECRET : process.env.ADMIN_SECRET

    const token = generateToken({ id: user.uid, userType: user_type }, 14 * 60 * 60000, secret)

    // do a set session here instead of returning authorization token.

    return success(res, {
        token,
        email: req.body.email,
        [PARAMS.business_name]: user?.[PARAMS.business_name],
        status: user?.[PARAMS.status],
        user_type
    }, "Login successful")

})

exports.sendResetLink = catchAsync(async (req, res) => {
    const email = req.body?.email

    if (!email) {
        return generalError(res, "Kindly provide an email to proceed", {})
    }


    let user_type = "Vendor"
    let user

    const promises = await Promise.allSettled([getUserByEmail(req.body?.email), fetchAdmninforLogin(req.body?.email)])

    const vendor = promises[0].value
    const admin = promises[1].value


    if (vendor) {
        user = vendor
    }

    if (admin) {
        user_type = "Admin"
        user = admin
    }


    if (!user) {
        return notFound(res, "Account with email provided not found")
    }

    if (!user) {
        return notFound(res, "Account with email not found")
    }

    const token = generateToken({ email: email, userType: user_type }, 1 * 10 * 60, process.env.AUTH_SECRET)

    const resetLink = process.env.WEB_BASE_URL + `/reset-password?token=${token}`

    sendPasswordResetMail(email, resetLink, "")

    return success(res, {}, "Reset link sent.")
})

exports.resetPwd = catchAsync(async (req, res) => {
    const token = req.query.token
    let payload
    try {
        payload = jwt.verify(token, process.env.AUTH_SECRET);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return expired(res, "Session Expired.")

        } else if (error.name === "JsonWebTokenError") {

            return invalid(res, "Invalid Token")

        }
    }

    let user_data
    if (!(payload.userType == "Admin" || payload.userType == "Editor")) {
        user_data = (await getUserByEmail(payload.email))?.toJSON()
    } else {
        user_data = (await fetchAdmninforLogin(payload.email))?.toJSON()
    }

    const password = req.body?.password
    if(!password){
        return generalError(res, "Kindly provide a password to proceed")
    }

    // console.log(user_data)

    const hashed = hashPassword(password)
    const uid = user_data.uid

    if (!(payload.userType == "Admin" || payload.userType == "Editor")) {
        await updateUserdetail(uid, { password: hashed })
    } else {
        await updateAdminProfile(uid, { password: hashed })
    }

    return success(res, {}, "Password updated.")

})