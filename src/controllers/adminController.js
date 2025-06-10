require("dotenv").config()

const { fetchAdmninforLogin } = require("../db/querys/admin");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, success, notFound } = require("../errorHandler/statusCodes");
const { generateToken, checkPassword } = require("../util/base");
const { loginValidator } = require("../util/validators/accountValidator");



exports.login = catchAsync(async (req, res) => {

    const valid_ = loginValidator.validate(req.body)

    if (valid_.error) {
        return generalError(res, valid_.error.message)
    }

    const user = await fetchAdmninforLogin(req.body?.email)

    if (!user) {
        return notFound(res, "Admin Account not found.")
    }

    const uid = user.uid
    

    const passwordMatch = checkPassword(req.body?.password, user.password)
    if (!passwordMatch) {
        return generalError(res, "Invalid Credentials")
    }
    

    const token = generateToken({ id: uid, userType: "admin" }, 14 * 60 * 60000, process.env.ADMIN_SECRET)

    

    return success(res, { token }, "Login successful")

})
