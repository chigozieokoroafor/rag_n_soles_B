const { fetchAdmninforLogin } = require("../db/querys/admin");
const { countOrders } = require("../db/querys/cart");
const { checkUserExists, createUserAccount, verifyUser, getUserByEmail } = require("../db/querys/users");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, success, newError, notFound, redirect } = require("../errorHandler/statusCodes");

const { PARAMS, FETCH_LIMIT } = require("../util/consts");


exports.getMetrics = catchAsync(async (req, res) => {
    const userId = req.user.id

    const { page } = req.query

    if (!page || Number(page) < 1 || Number.isNaN(page)) {
        return generalError(res, "Kindly provide page as a number greater than 0")
    }

    const offsetc = FETCH_LIMIT * (Number(page) -1)

    const data = await countOrders(userId,)

    return success(res, data, "fetched")
})



