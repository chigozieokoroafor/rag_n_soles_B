const { Router } = require("express")
const baseController = require("../controllers/baseController")
const productController = require("../controllers/productController")
const cartController = require("../controllers/cartController")
const paymentController = require("../controllers/paymentController")
const  adminController = require("../controllers/adminController")
const  vendorController = require("../controllers/vendorController")

const { baseAuth } = require("../middleware/auth")

const base = Router()

base.post("/register", baseController.createAccount)
base.post("/login", baseController.login)
base.get("/verify", baseController.verify)

base.get("/profile",baseAuth, baseController.fetchProfile)

base.get("/dashboard/metric", baseAuth,  vendorController.getMetrics)
base.get("/orders", baseAuth, cartController.fetchOrders)

// base.get("/order/:orderId", baseAuth, cartController.fetchSpecificOrder)

// base.get("/category", productController.fetchCategories)
// base.get("/category/:category_id", productController.fetchProductsUnderCategory)
base.get("/product/:product_id", productController.getSpecificProduct)
base.get("/products", productController.getAllProductsWithFilter)


base.get("/location", adminController.fetchlocation)

// base.get("/products/popular", productController.getPopularProducts)
// base.get("/products/new", productController.getNewArrivals)
// base.post("/cart", baseAuth, cartController.addItemToCart)
// base.get("/cart", baseAuth, cartController.getCart)
// base.get("/checkout", baseAuth, cartController.checkout)


base.post("/order", baseAuth, cartController.createOrder)

base.post("/payment/webhook",paymentController.paymentWebhook )


module.exports = {
    baseRouter: base
}