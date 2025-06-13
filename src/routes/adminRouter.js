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
admin.get("/category/:category_id", productController.fetchProductsUnderCategory)
// admin.get("/product", prod)

admin.post("/product", adminAuth, uploadMiddleWare, productController.addProducts)
admin.get("/products", productController.getAllProductsWithFilter)
admin.get("/product/:productId", adminAuth, productController.getSpecificProduct)
admin.delete("/product/:productId", adminAuth, productController.deleteProducts)
admin.put("/product/:productId", adminAuth, productController.updateProducts)

admin.get("/users", adminAuth, adminController.getUsers)
admin.put("/users", adminAuth, adminController.updateUserStatus)

admin.get("/dashboard/metrics", adminAuth, adminController.dashboardMetrics)

admin.post("/coupon", adminAuth, adminController.createCoupon)
admin.get("/coupon", adminAuth, adminController.fetchCoupons)


module.exports = {
    adminRouter: admin
}
