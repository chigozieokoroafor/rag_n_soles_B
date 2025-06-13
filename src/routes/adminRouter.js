const { Router } = require("express")
const  adminController = require("../controllers/adminController")
const  productController = require("../controllers/productController")
const { uploadMiddleWare } = require("../middleware/upload")
const { adminAuth } = require("../middleware/auth")
const multer =require("multer")


const admin = Router()


admin.post("/login", adminController.login)

admin.post("/category", adminAuth, productController.createCategory)
admin.get("/category",productController.fetchCategories)
// base.get("/category/:category_id", productController.fetchProductsUnderCategory)
admin.get("/category/:category_id", productController.fetchProductsUnderCategory)
admin.get("/product/:product_id", productController.getSpecificProduct)
// admin.get("/product", prod)
admin.post("/product", adminAuth, uploadMiddleWare, productController.addProducts)
admin.get("/products", productController.getAllProductsWithFilter)
admin.delete("/product", adminAuth, productController.deleteProducts)
admin.get("/users", adminAuth, adminController.getUsers)


module.exports = {
    adminRouter: admin
}
