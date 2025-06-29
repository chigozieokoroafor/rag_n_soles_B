const { fetchAdmninforLogin } = require("../db/querys/admin");
const { checkUserExists, createUserAccount, verifyUser, getUserByEmail } = require("../db/querys/users");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, success, newError, notFound, redirect } = require("../errorHandler/statusCodes");
const { sendAccountVerificationMail, hashPassword, generateToken, createUUID, verifytoken, checkPassword } = require("../util/base");
const { PARAMS } = require("../util/consts");


exports.getMetrics = catchAsync(async (req, res) => {
    
})
