exports.notFound = (res, message) => {
    return res.status(404).json({ "message": message, status:"error" })
}

exports.notAcceptable = (res, message) => {
    return res.status(406).json({ message, status:"error" })
}

exports.generalError = (res, message, data) => {
    return res.status(400).json({ "message": message, status:"error", data: data ?? {} })
}

exports.success = (res, data, message) => {
    
    return res.status(200).json({ status:"success", data, "message": message ?? "" })
}

exports.created = (res, message) => {
    return res.status(201).json({ status:"success", "message": message ?? "" })
}

exports.unAuthorized = (res, message) => {
    return res.status(401).json({ "message": message, status:"error" })
}

exports.expired = (res, message) => {
    return res.status(403).json({ "message": message, status:"error" })
}

exports.invalid = (res, message) => {
    return res.status(498).json({ "message": message, status:"error" })
}

exports.newError = (res, message, statusC) => {
    return res.status(statusC).json({ "message": message, status:"error" })
}

exports.exists = (res, message) => {
    return res.status(409).json({ "message": message, status:"error" })
}

exports.internalServerError = (res, message) => {
    return res.status(500).json({ "message": message, status:"error" })
}

exports.notModifiedError = (res) => {
    return res.status(304).json({ "message": "Not modified", status:"error" })
}

exports.redirect = (res, url) =>{
    return res.status(301).redirect(url)
    
}

