require("dotenv").config()

const { checkAdmin } = require("../db/querys/admin");
const { getUserByEmail } = require("../db/querys/users");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, success, notFound } = require("../errorHandler/statusCodes");
const { generateToken, checkPassword } = require("../util/base");
const { loginValidator } = require("../util/validators/accountValidator");
const { productUploadSchema } = require("../util/validators/productsValidator");


exports.login = catchAsync(async (req, res) => {

    const valid_ = loginValidator.validate(req.body)

    if (valid_.error) {
        return generalError(res, valid_.error.message)
    }

    const user = await getUserByEmail(req.body?.email)

    if (!user) {
        return notFound(res, "Admin Account not found.")
    }

    const uid = user.uid
    const adminCheck = await checkAdmin(uid)
    if (!adminCheck) {
        return notFound(res, "Account not found")
    }

    const passwordMatch = checkPassword(req.body?.password, user.password)
    if (!passwordMatch) {
        return generalError(res, "Invalid Credentials")
    }
    // put email verification here to check if userIsn't verified

    const token = generateToken({ id: user.uid, userType: "admin" }, 14 * 60 * 60000, process.env.ADMIN_SECRET)

    // do a set session here instead of returning authorization token.

    return success(res, { token }, "Login successful")

})
