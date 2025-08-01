const { conn } = require("./base")
const { user } = require("./models/user")
const { admin } = require("./models/admin")
const { cart } = require("./models/cart")
const { category } = require("./models/category")
const { images } = require("./models/images")
const { order } = require("./models/order")
const { product, coupon, specifications } = require("./models/product")
const { review } = require("./models/review")
const { shipping } = require("./models/shipping")
const { transaction } = require("./models/transaction")
const { deliv_locations } = require("./models/deliv_locations")
const { ordersOnly } = require("./models/ordersOnly")
const { notifications } = require("./models/notifications")


exports.sync = async () => {

    conn.authenticate().then(async () => {
        await Promise.allSettled(
            [
                // user.sync({ alter: true }), // merge to main
                // admin.sync({ alter: true }),
                // cart.sync({ alter: true }), //sync with main
                // category.sync({ alter: true }),    
                // order.sync({alter:true}),
                // product.sync({alter:true}),
                // images.sync({alter:true}),
                // review.sync({alter:true}),
                // shipping.sync({alter:true}),
                // transaction.sync({alter:true}),
                // coupon.sync({alter:true}),
                // deliv_locations.sync({alter:true}),
                // specifications.sync({alter: true}),
                // ordersOnly.sync({alter:true}),
                // notifications.sync({alter:true})
            ]
        )
    })
}

