const { Sequelize, Op } = require("sequelize");
const { checkCategoryExists, createCategoryQuery, fetchCategoryQuery } = require("../db/querys/category");
const { uploadProduct, getProductsByCategory, getspecificProduct, searchProduct, deleteProductQuery } = require("../db/querys/products");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, success, notFound } = require("../errorHandler/statusCodes");
const { createUUID, sendEmail } = require("../util/base");
const { FETCH_LIMIT, PARAMS } = require("../util/consts");
const { categoryCreationSchema } = require("../util/validators/categoryValidator");
const { productUploadSchema } = require("../util/validators/productsValidator");



exports.addProducts = catchAsync(async (req, res) => {
    const valid_ = productUploadSchema.validate(req.body)
    if (valid_.error) {
        return generalError(res, valid_.error.message)
    }

    // let data = req.body

    // new flow -> insert data into db, create a background worker to upload files to bunny, once done, create an emmitter to add files appropriately🤔🤔🤔

    const data = new Object()

    data["name"] = req.body?.name
    data["categoryId"] = req.body?.categoryId
    data["discount"] = req.body?.discount ?? 0.0
    data["price"] = req.body?.price
    data["img_blob"] = req.body?.file
    data["colors"] = req.body?.colors
    data["description"] = req.body?.description
    data["units"] = req.body?.units
    data["specifications"] = req.body?.specifications


    // console.log("data:::;", data)
    try {
        await uploadProduct(data)
    } catch (error) {
        // console.log("product::: error::::",error)
        sendEmail("Error on product upload", "okoroaforc14@gmail.com", error)
        return generalError(res, "Unable to add product at current time.", {})
    }

    return success(res, {}, "Product uploaded successfully")
})

exports.createCategory = catchAsync(async (req, res) => {
    const valid_ = categoryCreationSchema.validate(req.body)
    if (valid_.error) {
        return generalError(res, valid_.error.message)
    }

    const data = new Object()

    data["name"] = req.body?.name
    data["img_blob"] = req.body?.file

    const cat_exists = await checkCategoryExists(req.body?.name)
    if (cat_exists) {
        return generalError(res, `Category "${req.body?.name}" exists`)
    }

    await createCategoryQuery(data)

    return success(res, {}, "Category Created")


})

exports.fetchCategories = catchAsync(async (req, res) => {
    const data = await fetchCategoryQuery()
    return success(res, data, "Fetched")
})

exports.fetchProductsUnderCategory = catchAsync(async (req, res) => {
    const category_id = req.params?.category_id

    if (!category_id) {
        return generalError(res, "Kindly select a category.")
    }

    const page = req.query?.page

    if (page <= 0) {
        return generalError(res, "Page cannot be less than 1")
    }
    const offset = (Number(page) - 1) * FETCH_LIMIT

    const data = await getProductsByCategory(category_id, FETCH_LIMIT, offset)

    return success(res, data, "Fetched")



})

exports.getSpecificProduct = catchAsync(async (req, res) => {
    const product_id = req.params?.product_id

    const data = await getspecificProduct(product_id)

    return success(res, data, "Fetched")

})

exports.deleteProducts = catchAsync(async (req, res) => {
    const product_id = req.query.product_id

    if (!product_id) {
        return generalError(res, "Kindly select product to delete")
    }

    const q = await deleteProductQuery(product_id)

    console.log(q)

    return success(res, {}, "deleted")
    
})

// for search
exports.getAllProductsWithFilter = catchAsync(async (req, res) => {
    const { category, search, max_price, min_price, page } = req.query

    if (page <= 0 || !page) {
        return generalError(res, "Page cannot be less than 1")
    }

    const offset = (Number(page) - 1) * FETCH_LIMIT
    let actual_query = {}
    const query_list = []
    let sub = {}

    if (search) {
        query_list.push(Sequelize.literal(`MATCH (${PARAMS.name}) AGAINST("${search}" IN BOOLEAN MODE)`),)
        actual_query[PARAMS.name] = {
            [Op.like]: `%${search}%`
        }

    }
    if (category) {
        actual_query[PARAMS.categoryId] = category
    }
    if (max_price && min_price) {
        actual_query[PARAMS.price] = {
            [Op.between]: [Number(min_price), Number(max_price)]
        }
    }

    const data = await searchProduct(actual_query, offset, FETCH_LIMIT)

    return success(res, data, "testing")

})


// merge these 2 items into 1 for the home page.
exports.getPopularProducts = catchAsync(async (req, res) => {

})

exports.getNewArrivals = catchAsync(async (req, res) => {

})