const { fetchAdmninforLogin } = require("../db/querys/admin");
const { countOrders } = require("../db/querys/cart");
const { checkUserExists, createUserAccount, verifyUser, getUserByEmail, updateUserdetail } = require("../db/querys/users");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, success, newError, notFound, redirect } = require("../errorHandler/statusCodes");
const { hashPassword } = require("../util/base");

const { PARAMS, FETCH_LIMIT } = require("../util/consts");
const { updateAccountSchema } = require("../util/validators/accountValidator");


exports.getMetrics = catchAsync(async (req, res) => {
    const userId = req.user.id

    const data = await countOrders(userId,)

    return success(res, data, "fetched")
})

exports.fetchMe = catchAsync(async (req, res) => {
    const data = {
        email: req.user.email,
        // userType:req.user,
        billing_address: req.user.billing_address,
        shipping_address: req.user.shipping_address,
        business_name: req.user.business_name,
        username: req.user.name,
        phone_no: req.user.phone_no
    }
    return success(res, data, "Profile fetched")
})

exports.updateMe = catchAsync(async (req, res) => {
    const valid_ = updateAccountSchema.validate(req.body)

    if (valid_.error) {
        generalError(res, valid_.error.message, {})
        return
    }

    await updateUserdetail(req.user.id, req.body)

    success(res, {}, "Profile updated")

    return

})

exports.changePassword = catchAsync(async (req, res) =>{
    const password = req.body?.password

    if(!password){
        return generalError(res, "Password required", {})
    }
    const pwd = hashPassword(password)

    await updateUserdetail(req.user.id, {password: pwd})

    success(res, {}, "Passowrd updated")
})