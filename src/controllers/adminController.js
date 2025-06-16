require("dotenv").config()

const { Op } = require("sequelize");
const { fetchAdmninforLogin, getAllUsers, updateUserStatus, countVendors, insertExtraAdmin, getadmins, updateAdminDetails, checkAdmin } = require("../db/querys/admin");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, success, notFound } = require("../errorHandler/statusCodes");
const { generateToken, checkPassword, createUUID, sendAdminMailCredentials } = require("../util/base");
const { FETCH_LIMIT, PARAMS, STATUSES } = require("../util/consts");
const { loginValidator, createAdminSchema, adminSchema } = require("../util/validators/accountValidator");
const { countAllproducts } = require("../db/querys/products");
const { insertCoupon, getCoupons, deleteCoupon, updateCoupon } = require("../db/querys/category");
const { couponValidator, couponUpdateValidator } = require("../util/validators/categoryValidator");
const { hashSync } = require("bcryptjs");


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
    const count = await countVendors(actual_query)

    const total_pages = Math.ceil(count / FETCH_LIMIT)



    return success(res, { users, pages: total_pages }, "Fetched")
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
        product: {
            total: await countAllproducts({}),
            active: await countAllproducts({ [PARAMS.status]: "Active" }),
            inactive: await countAllproducts({ [PARAMS.status]: "Inactive" })
        },
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


// team members
exports.createAdmin = catchAsync(async (req, res) => {
    const valid_ = createAdminSchema.validate(req.body)

    if (valid_.error){
        console.log(valid_.error.details)
        return generalError(res, valid_.error.message)
    }

    const admin_exists = await fetchAdmninforLogin(req.body[PARAMS.email])

    if (admin_exists){
        return generalError(res, "An admin with email provided exists", {})
    }
    const pwd = createUUID()
    req.body[PARAMS.password] = hashSync(pwd)

    try{
        sendAdminMailCredentials(req.body[PARAMS.email], pwd)
    }catch(error){
        return generalError(res, "Unable  to send admin credentials")
    }

    await insertExtraAdmin(req.body)

    success(res, {}, "Account credentials created and sent.")

    
})

exports.fetchAdmins = catchAsync(async(req, res)=>{
    const data = await getadmins()

    return success(res, data, "Fetched")
})

exports.updateAdmin = catchAsync(async(req, res) =>{
    const uid  = req.params.uid
    const valid_ = adminSchema.validate(req.body)
    if(valid_.error){
        return generalError(res, valid_.error.message, {})
    }
    
    const admin_exists = checkAdmin(uid)
    if(!admin_exists){
        return notFound(res, "Admin profile not found")
    }

    await updateAdminDetails(uid, req.body)

    return success(res, {}, "User details updated")
})


// billing
// exports.createlocation = catchAsync(async (req, res) => {
//     const valid_ = createAdminSchema.validate(req.body)

//     if (valid_.error){
//         console.log(valid_.error.details)
//         return generalError(res, valid_.error.message)
//     }

//     const admin_exists = await fetchAdmninforLogin(req.body[PARAMS.email])

//     if (admin_exists){
//         return generalError(res, "An admin with email provided exists", {})
//     }
//     const pwd = createUUID()
//     req.body[PARAMS.password] = hashSync(pwd)

//     try{
//         sendAdminMailCredentials(req.body[PARAMS.email], pwd)
//     }catch(error){
//         return generalError(res, "Unable  to send admin credentials")
//     }

//     await insertExtraAdmin(req.body)

//     success(res, {}, "Account credentials created and sent.")

    
// })

// exports.fetchlocation = catchAsync(async(req, res)=>{
//     const data = await getadmins()

//     return success(res, data, "Fetched")
// })

// exports.updatelocation = catchAsync(async(req, res) =>{
//     const uid  = req.params.uid
//     const valid_ = adminSchema.validate(req.body)
//     if(valid_.error){
//         return generalError(res, valid_.error.message, {})
//     }
    
//     const admin_exists = checkAdmin(uid)
//     if(!admin_exists){
//         return notFound(res, "Admin profile not found")
//     }

//     await updateAdminDetails(uid, req.body)

//     return success(res, {}, "User details updated")
// })