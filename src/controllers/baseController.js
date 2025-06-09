require("dotenv").config()

const { checkUserExists, createUserAccount, verifyUser, getUserByEmail } = require("../db/querys/users");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, success, newError, notFound } = require("../errorHandler/statusCodes");
const { sendAccountVerificationMail, hashPassword, generateToken, createUUID, verifytoken, checkPassword } = require("../util/base");
const { PARAMS } = require("../util/consts");
const { createAccountSchema, loginValidator } = require("../util/validators/accountValidator");


exports.createAccount = catchAsync(async (req, res) => {
    const valid_ = createAccountSchema.validate(req.body)
    if (valid_.error) {
        return generalError(res, valid_.error.message, {})
    }

    // use express sesion for this. and not normal bearer jwts

    const { email, name, username, password } = req.body

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



    const token = generateToken({ id: uid })
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

    console.log("payload:::", payload)

    const uid = payload.d.id

    const update = await verifyUser(uid)

    if (update[0] < 1) {
        return generalError(res, "Unable to verify mail")
    }

    return success(res, {}, "Account Verified")

})

exports.login = catchAsync(async (req, res) => {

    const valid_ = loginValidator.validate(req.body)

    if (valid_.error) {
        return generalError(res, valid_.error.message)
    }

    const user = await getUserByEmail(req.body?.email)

    if (!user) {
        return notFound(res, "Account with email provided not found")
    }

    const passwordMatch = checkPassword(req.body?.password, user.password)
    if (!passwordMatch) {
        return generalError(res, "Invalid Credentials")
    }
    

    if (!user[PARAMS.isAdminVerified]) {
        return generalError(res, "Account required validation by admin.", {})
    }

    const token = generateToken({ id: user.uid, userType: "user" }, 14 * 60 * 60000)

    // do a set session here instead of returning authorization token.

    return success(res, { token }, "Login successful")

})

exports.fetchProfile = catchAsync(async (req, res) => {
    return success(res, req.user, "Profile fetched")
})