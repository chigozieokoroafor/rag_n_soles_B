const { Router } = require("express")
const  adminController = require("../controllers/adminController")
const  productController = require("../controllers/productController")
const { uploadMiddleWare, uploadMiddleWareNotrequired } = require("../middleware/upload")
const { adminAuth } = require("../middleware/auth")
const multer =require("multer")


const admin = Router()


// admin.post("/login", adminController.login)

admin.put("/me", adminController.fetchProfile)

admin.post("/category", adminAuth, productController.createCategory)
admin.get("/category",productController.fetchCategories)
admin.get("/category/:category_id", productController.fetchProductsUnderCategory)
admin.delete("/category/:categoryId", productController.deleteCategory)
// admin.get("/product", prod)

admin.post("/product", adminAuth, uploadMiddleWare, productController.addProducts)
admin.get("/products", productController.getAllProductsWithFilter)
admin.get("/product/:productId", adminAuth, productController.getSpecificProduct)
admin.delete("/product/:productId", adminAuth, productController.deleteProducts)
admin.put("/product/:productId", adminAuth, uploadMiddleWareNotrequired, productController.updateProducts)

admin.delete("/product/:productId/images", adminAuth, productController.deleteImages)
admin.put("/product/:productId/images/setDefault", adminAuth, productController.updateDefaultImages)


admin.get("/users", adminAuth, adminController.getUsers)
admin.put("/users", adminAuth, adminController.updateUserStatus)

admin.get("/dashboard/metrics", adminAuth, adminController.dashboardMetrics)

admin.post("/coupon", adminAuth, adminController.createCoupon)
admin.get("/coupon", adminAuth, adminController.fetchCoupons)
admin.delete("/coupon/:couponId", adminAuth, adminController.deleteCoupon)
admin.put("/coupon/:couponId", adminAuth, adminController.updateCouponDetails)

admin.post("/location", adminAuth, adminController.createlocation)
admin.put("/location/:id", adminAuth, adminController.updatelocation)
admin.delete("/location/:id", adminAuth, adminController.deleteLocation)


admin.post("/admin/", adminAuth, adminController.createAdmin)
admin.get("/admin/", adminAuth, adminController.fetchAdmins)
admin.put("/admin/:uid", adminAuth, adminController.updateAdmin)




module.exports = {
    adminRouter: admin
}
