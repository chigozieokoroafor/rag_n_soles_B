require("dotenv").config()

const { fetchAdmninforLogin, getAllUsers } = require("../db/querys/admin");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, success, notFound } = require("../errorHandler/statusCodes");
const { generateToken, checkPassword } = require("../util/base");
const { FETCH_LIMIT } = require("../util/consts");
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


exports.getUsers = catchAsync(async (req, res) => {
    const page = req.query?.page

    if (!page || Number(page) < 1 || Number.isNaN(page)) {
        return generalError(res, "Kindly provide page as a number greater than 0")
    }

    const offset = FETCH_LIMIT * (Number(page) - 1)

    const users = await getAllUsers(FETCH_LIMIT, offset)

    return success(res, users, "Fetched")
})