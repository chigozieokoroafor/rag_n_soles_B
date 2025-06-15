require("dotenv").config()
const jwt = require("jsonwebtoken")
// const { unAuthorized, generalError, expired, invalid, newError } = require("./errorHandlers/statusCodes");

// const { SECRETS } = require("./consts");
// const { fetchUserForMiddleware } = require("../db/query/user");
const { unAuthorized, generalError, newError } = require("../errorHandler/statusCodes");
const { fetchUserForMiddleware } = require("../db/querys/users");
const { fetchAdmninforMiddleware } = require("../db/querys/admin");

class Auth {
    secret = process.env.AUTH_SECRET

    constructor(secret) {
        if (secret) {
            this.secret = secret;
        }
    }

    auth = async (req, res, next) => {


        if (!req?.headers?.authorization) {
            return unAuthorized(res, "Request unauthorized");
        }
        const authorization = req?.headers?.authorization;
        if (!authorization.startsWith("Bearer")) {
            return generalError(res, "Bearer authorization required");
        }
        const token = authorization.split("Bearer")[1].trim();

        let err;
        let err_status;

        try {
            const payload = jwt.verify(token, this.secret);
            
            let user_data
            if (!(payload.userType == "Admin")){
                user_data = await fetchUserForMiddleware(payload.id ?? payload.uid)
            }else{
                console.log("entered here")
                user_data = await fetchAdmninforMiddleware(payload.id ?? payload.uid)
            }

            

            if (!user_data) {
                req.err = {
                    err: "User not found",
                    status: 404
                };
                return next()
            }
            req.user = payload

            // if (payload?.userType) {
            //     req.user.userType = payload?.userType
            // }

            // console.log("user:::",req.user)

            return next(); // Call next to proceed if token is valid
        } catch (error) {

            if (error.name === "TokenExpiredError") {
                err = "Session Expired.";
                err_status = 403;
            } else if (error.name === "JsonWebTokenError") {
                err = "Invalid Token";
                err_status = 498;
            }
            // console.log("error:::middleware::::", error)
        }
        req.err = {
            err: err,
            status: err_status
        };
        return next(); // Proceed to next middleware even if there's an error
    }

}

const baseAuth = (req, res, next) => { // auth for students
    new Auth().auth(req, res, () => {
        // console.log("user:::", req.user )
        if (req?.err?.err) {
            return newError(res, req.err.err, req.err.status);
        } else if (!req?.user?.id) {
            return unAuthorized(res, "Unauthorized");
        }
        next();
    });
}

const adminAuth = (req, res, next) => { // auth for students
    new Auth(process.env.ADMIN_SECRET).auth(req, res, () => {

        if (req?.err?.err) {
            return newError(res, req.err.err, req.err.status);
        } else if (!req?.user?.id) {
            return unAuthorized(res, "Unauthorized");
        }
        next();
    });
}

module.exports = {
    baseAuth,
    adminAuth
}