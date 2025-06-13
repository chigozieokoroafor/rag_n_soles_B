require("dotenv").config()

const { Op } = require("sequelize");
const { fetchAdmninforLogin, getAllUsers, updateUserStatus } = require("../db/querys/admin");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, success, notFound } = require("../errorHandler/statusCodes");
const { generateToken, checkPassword } = require("../util/base");
const { FETCH_LIMIT, PARAMS } = require("../util/consts");
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

    const { status, search, page } = req.query

    if (!page || Number(page) < 1 || Number.isNaN(page)) {
        return generalError(res, "Kindly provide page as a number greater than 0")
    }

    let actual_query = {}
    // const query_list = []
    let sub = {}

    if (search) {
        // query_list.push(Sequelize.literal(`MATCH (${PARAMS.name}) AGAINST("${search}" IN BOOLEAN MODE)`),)
        actual_query[PARAMS.name] = {
            [Op.like]: `%${search}%`
        }

    }
    if (status) {
        actual_query[PARAMS.status] = status
    }
    

    const offset = FETCH_LIMIT * (Number(page) - 1)

    const users = await getAllUsers(actual_query, FETCH_LIMIT, offset)

    return success(res, users, "Fetched")
})

exports.updateUserStatus = catchAsync(async (req, res) =>{
    const  {uid, status} = req.body

    if(!uid || !status) {
        return generalError(res, "USer or status missing", {})
    }

    const update =  await updateUserStatus(uid, status)

    if(!update[0]){
        return generalError(res, "Unable to update user status")
    }

    return success(res, {}, "user updated")
    

})