const multer = require("multer")
// const { ALL_MIME_TYPES } = require("../consts")
const { generalError } = require("../errorHandler/statusCodes")
const { ALL_MIME_TYPES } = require("../util/consts")


const storage = multer.memoryStorage()
const fileFilter = (req, file, cb) =>{
    const allowedFileTypes = [
        ALL_MIME_TYPES.jpeg, ALL_MIME_TYPES.jpg, ALL_MIME_TYPES.png, ALL_MIME_TYPES.xpng
    ]
    console.log("file mimetype", file.mimetype)
    
    if (allowedFileTypes.includes(file.mimetype)){
        cb(null, true)
    }else{
        // console.log("tests:::4")
        cb(new Error(`Invalid file type. Only PNG, JPEG and JPG files are allowed.`));
    }
}

const upload = multer({storage:storage, fileFilter:fileFilter, limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5                     // Maximum 5 files per upload
  }})

const uploadMiddleWare = (req, res, next) =>{
    // console.log("tests:::1")
    const uploadF = upload.array("images")
    // console.log("tests:::3", req.files)

    uploadF(req, res, (err)=>{
        if (err){
            console.log(err)
            return generalError(res, err.message)
        }

        if (!req.files || req.files?.length < 1) {
            return generalError(res, 'images required for product.');
          }

        // console.log("file::::", req?.file)
        next()
    })
}


const uploadMiddleWareNotrequired = (req, res, next) =>{
    const uploadF = upload.array("images")
    // console.log("tests:::3", req.files)

    uploadF(req, res, (err)=>{
        if (err){
            console.log(err)
            return generalError(res, err.message)
        }
        // console.log("file::::", req?.file)
        next()
    })
}
module.exports = {
    uploadMiddleWare,
    uploadMiddleWareNotrequired
}