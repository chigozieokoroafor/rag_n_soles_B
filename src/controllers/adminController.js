require("dotenv").config()

const { Op } = require("sequelize");
const { fetchAdmninforLogin, getAllUsers, updateUserStatus, countVendors } = require("../db/querys/admin");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, success, notFound } = require("../errorHandler/statusCodes");
const { generateToken, checkPassword } = require("../util/base");
const { FETCH_LIMIT, PARAMS, STATUSES } = require("../util/consts");
const { loginValidator } = require("../util/validators/accountValidator");
const { countAllproducts } = require("../db/querys/products");
const { insertCoupon, getCoupons, deleteCoupon, updateCoupon } = require("../db/querys/category");
const { couponValidator, couponUpdateValidator } = require("../util/validators/categoryValidator");



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

exports.updateUserStatus = catchAsync(async (req, res) => {
    const { uid, status } = req.body

    if (!uid || !status) {
        return generalError(res, "USer or status missing", {})
    }

    const update = await updateUserStatus(uid, status)

    if (!update[0]) {
        return generalError(res, "Unable to update user status")
    }

    return success(res, {}, "user updated")


})

exports.dashboardMetrics = catchAsync(async (req, res) => {
    const data = {
        product: await countAllproducts(),
        vendors: {
            total: await countVendors({}),
            pending: await countVendors({ [PARAMS.status]: STATUSES.pending }),
            blocked: await countVendors({ [PARAMS.status]: STATUSES.blocked }),
        },
        orders: {
            total: 0,
            pending: 0
        },
        lowstock: 0
    }

    return success(res, data, "fetched.")
})

exports.createCoupon = catchAsync(async (req, res) => {
    const valid_ = couponValidator.validate(req.body)

    if (valid_.error) {
        return generalError(res, valid_.error.message, {})
    }


    try {
        await insertCoupon(req.body)
    } catch (error) {
        console.log("error:::coupon::::", error)
        return generalError(res, "unable to create coupon")
    }

    return success(res, {}, "Coupon added")
})

exports.fetchCoupons = catchAsync(async (req, res) => {
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

    const data = await getCoupons(actual_query, FETCH_LIMIT, offset)

    return success(res, data, "Fetched.")
})

exports.deleteCoupon = catchAsync(async (req, res) => {
    const couponId = req.params.couponId

    await deleteCoupon(couponId)

    return success(res, {}, "Coupon Deleted")
    
})


exports.updateCouponDetails = catchAsync(async (req, res) => {
    const couponId = req.params.couponId
    const valid_ = couponUpdateValidator.validate(req.body)

    if (valid_.error) {
        return generalError(res, valid_.error.message, {})
    }


    try {
        await updateCoupon(req.body, couponId)
    } catch (error) {
        console.log("error:::coupon::::", error)
        return generalError(res, "unable to update coupon details")
    }

    return success(res, {}, "Coupon updated")
})
