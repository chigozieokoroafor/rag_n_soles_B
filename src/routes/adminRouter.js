const { Router } = require("express")
const  adminController = require("../controllers/adminController")
const  productController = require("../controllers/productController")
const { uploadMiddleWare } = require("../middleware/upload")
const { adminAuth } = require("../middleware/auth")


const admin = Router()


admin.post("/login", adminController.login)

admin.post("/category", adminAuth, productController.createCategory)
admin.get("/category",productController.fetchCategories)
// base.get("/category/:category_id", productController.fetchProductsUnderCategory)
admin.get("/category/:category_id", productController.fetchProductsUnderCategory)
admin.get("/product/:product_id", productController.getSpecificProduct)
admin.post("/product", adminAuth, productController.addProducts)
admin.delete("/product", adminAuth, productController.deleteProducts)



module.exports = {
    adminRouter: admin
}
