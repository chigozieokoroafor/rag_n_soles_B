const { Sequelize, Op } = require("sequelize");
const { checkCategoryExists, createCategoryQuery, fetchCategoryQuery } = require("../db/querys/category");
const { uploadProduct, getProductsByCategory, getspecificProduct, searchProduct, deleteProductQuery, uploadProductImage, updateProductDetails, countProducts } = require("../db/querys/products");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, success, notFound } = require("../errorHandler/statusCodes");
const { createUUID, sendEmail, processFile, processAllImages } = require("../util/base");
const { FETCH_LIMIT, PARAMS } = require("../util/consts");
const { categoryCreationSchema } = require("../util/validators/categoryValidator");
const { productUploadSchema } = require("../util/validators/productsValidator");




exports.addProducts = catchAsync(async (req, res) => {
    const valid_ = productUploadSchema.validate(req.body)
    if (valid_.error) {
        console.log("error_details::::", valid_.error.details)
        return generalError(res, valid_.error.message)
    }

    const data = new Object()

    data[PARAMS.name] = req.body[PARAMS.name]
    data[PARAMS.categoryId] = req.body[PARAMS.categoryId]
    data[PARAMS.price] = req.body[PARAMS.price]
    data[PARAMS.spec] = JSON.parse(req.body[PARAMS.spec])

    let product

    try {
        product = await uploadProduct(data)
    } catch (error) {
        // console.log("product::: error::::",error)
        sendEmail("Error on product upload", "okoroaforc14@gmail.com", error)
        return generalError(res, "Unable to add product at current time.", {})
    }
    success(res, {}, "Product uploaded successfully")

    const productId = product.uid

    const images = await processAllImages(req.files)


    await uploadProductImage(productId, images)

    // console.log(img_list)

})

exports.createCategory = catchAsync(async (req, res) => {
    const valid_ = categoryCreationSchema.validate(req.body)
    if (valid_.error) {
        return generalError(res, valid_.error.message)
    }

    const data = new Object(req.body)

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
    const product_id = req.params.productId

    if (!product_id) {
        return generalError(res, "Kindly select product to delete")
    }

    const q = await deleteProductQuery(product_id)

    return success(res, {}, "deleted")

})

exports.updateProducts = catchAsync(async (req, res) => {
    const productId = req.params.productId

    const product = getspecificProduct(productId)

    if (!product) {
        return notFound(res, "Product not found")
    }

    let update = Object(req.body)

    if (update[PARAMS.spec]) {
        update[PARAMS.spec] = JSON.parse(update[PARAMS.spec])

    }

    await updateProductDetails(productId, update)

    if (req.files) {
        const images = await processAllImages(req.files)
        await uploadProductImage(productId, images)
    }
})

// for search
exports.getAllProductsWithFilter = catchAsync(async (req, res) => {
    const { category, search, max_price, min_price, page } = req.query

    if (page <= 0 || !page) {
        return generalError(res, "Page cannot be less than 1")
    }

    const offset = (Number(page) - 1) * FETCH_LIMIT
    let actual_query = {}
    // const query_list = []
    let sub = {}

    if (search) {
        // query_list.push(Sequelize.literal(`MATCH (${PARAMS.name}) AGAINST("${search}" IN BOOLEAN MODE)`),)
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

    const promises = await Promise.allSettled([searchProduct(actual_query, offset, FETCH_LIMIT), countProducts(actual_query)])

    const data = promises[0].value
    const count = promises[1].value
    const total_pages = Math.ceil(count / FETCH_LIMIT)






    return success(res, {
        products: data,
        pages: total_pages
    }, "testing")

})
