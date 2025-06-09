function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500
    console.log("productionError:::", err)

    let errorResponse = {
        msg: err.message || "Internal Server Error",
        success: false
    }

    if (process.env.ENV == "dev") {
        errorResponse.stack = (err.stack.split("\n   "))
        
    }else{
        // add notification here to notify me by mail in production.
        errorResponse.msg = "Internal Server Error"
    }

    res.status(statusCode).json(errorResponse);

}

module.exports = {
    errorHandler
}