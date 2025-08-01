const { Router } = require("express")
const  adminController = require("../controllers/adminController")
const  productController = require("../controllers/productController")
const  cartController = require("../controllers/cartController")
const { uploadMiddleWare, uploadMiddleWareNotrequired } = require("../middleware/upload")
const { adminAuth } = require("../middleware/auth")
const multer =require("multer")


const admin = Router()


// admin.post("/login", adminController.login)

admin.get("/me", adminAuth, adminController.fetchProfile)
admin.put("/me", adminAuth, adminController.updateProfile)

admin.post("/category", adminAuth, productController.createCategory)
admin.get("/category",productController.fetchCategories)
admin.get("/category/:category_id", productController.fetchProductsUnderCategory)
admin.delete("/category/:categoryId", adminAuth, productController.deleteCategory)
admin.put("/category/:categoryId", adminAuth, productController.updateCategory)

// admin.get("/product", prod)

admin.post("/product", adminAuth, uploadMiddleWare, productController.addProducts)
admin.get("/products", adminAuth, productController.getAllProductsWithFilter)
admin.get("/product/:productId", adminAuth, productController.getSpecificProduct)
admin.delete("/product/:productId", adminAuth, productController.deleteProducts)
admin.put("/product/:productId", adminAuth, uploadMiddleWareNotrequired, productController.updateProducts)

admin.delete("/product/:productId/images", adminAuth, productController.deleteImages)
admin.put("/product/:productId/images/setDefault", adminAuth, productController.updateDefaultImages)


admin.get("/users", adminAuth, adminController.getUsers)
admin.put("/users", adminAuth, adminController.updateUserStatus)

admin.get("/dashboard/metrics", adminAuth, adminController.dashboardMetrics)
admin.get("/dashboard/graph", adminAuth, adminController.graph)

admin.post("/coupon", adminAuth, adminController.createCoupon)
admin.get("/coupon", adminAuth, adminController.fetchCoupons)
admin.delete("/coupon/:couponId", adminAuth, adminController.deleteCoupon)
admin.put("/coupon/:couponId", adminAuth, adminController.updateCouponDetails)

admin.post("/location", adminAuth, adminController.createlocation)
admin.put("/location/:id", adminAuth, adminController.updatelocation)
admin.delete("/location/:id", adminAuth, adminController.deleteLocation)


admin.post("/admin", adminAuth, adminController.createAdmin)
admin.get("/admin", adminAuth, adminController.fetchAdmins)
admin.put("/admin/:uid", adminAuth, adminController.updateAdmin)


admin.get("/order", adminAuth, cartController.fetchOrdersAdmin)
admin.put("/order", adminAuth, cartController.updateStatusOfOrders)

admin.get("/notifications", adminAuth, adminController.getNotifications)
admin.put("/notifications", adminAuth, adminController.readNotifications)

module.exports = {
    adminRouter: admin
}
