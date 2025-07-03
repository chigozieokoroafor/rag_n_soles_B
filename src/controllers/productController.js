const { Sequelize, Op } = require("sequelize");
const { checkCategoryExists, createCategoryQuery, fetchCategoryQuery } = require("../db/querys/category");
const { uploadProduct, getProductsByCategory, getspecificProduct, searchProduct, deleteProductQuery, uploadProductImage, updateProductDetails, countProducts, insertProductspecification, deleteBulkSpecification, updateProductSpecification, deleteProductImages, updateDefaultImage, deleteCategory } = require("../db/querys/products");
const { catchAsync } = require("../errorHandler/allCatch");
const { generalError, success, notFound } = require("../errorHandler/statusCodes");
const { createUUID, sendEmail, processFile, processAllImages } = require("../util/base");
const { FETCH_LIMIT, PARAMS } = require("../util/consts");
const { categoryCreationSchema } = require("../util/validators/categoryValidator");
const { productUploadSchema, productUpdateSchema, productSpecificationUpdateSchema, imageUpdateValidator } = require("../util/validators/productsValidator");


exports.addProducts = catchAsync(async (req, res) => {

    // console.log("files::::", req.files)

    const valid_ = productUploadSchema.validate(req.body)
    if (valid_.error) {
        console.log("error_details::::", valid_.error.details)
        return generalError(res, valid_.error.message)
    }

    const data = new Object()

    data[PARAMS.name] = req.body[PARAMS.name]
    data[PARAMS.categoryId] = req.body[PARAMS.categoryId]
    data[PARAMS.price] = req.body[PARAMS.price]
    data[PARAMS.status] = req.body[PARAMS.status]

    let spec = JSON.parse(req.body[PARAMS.spec])

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

    spec.forEach((item, index) => {
        spec[index].productId = productId
    });

    // console.log(spec)
    await insertProductspecification(spec)

    const images = await processAllImages(req.files, productId)


    await uploadProductImage(images)


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

    const valid_ = productUpdateSchema.validate(req.body)
    if (valid_.error) {
        
        generalError(res, valid_.error.message, {})
        return
    }

    const product = await getspecificProduct(productId)

    if (!product) {
        notFound(res, "Product not found")
        return
    }

    let update = Object(req.body)

    let spec = null

    if (update[PARAMS.spec]) {
        try {
            spec = JSON.parse(update[PARAMS.spec])
        }catch(error){
            spec = update[PARAMS.spec]
        }
        

        const sepc_valid_ = productSpecificationUpdateSchema.validate(spec)

        if (sepc_valid_.error) {
            
            generalError(res, sepc_valid_.error.message, {})
            return
        }

    }

    await updateProductDetails(productId, update)

    success(res, {}, "product updated.")

    if (req.files?.length > 0) {
        const images = await processAllImages(req.files, productId)
        // images.push(...product.images)
        await uploadProductImage(images)
    }

    try {
        // process specifications
        const existing_specifications = []
        const new_spec = []
        const existing_specifications_id = []

        const queries = []

        if (spec) {

            spec.forEach((item) => {
                if (item?.id) {
                    existing_specifications.push(item)
                    existing_specifications_id.push(item.id)
                } else {
                    item.productId = productId
                    new_spec.push(item)
                }
            })


            if (existing_specifications_id.length > 0) {
                await deleteBulkSpecification(existing_specifications_id)
            }

            if (existing_specifications.length > 0) {
                existing_specifications.forEach((item) => {
                    queries.push(
                        updateProductSpecification({ units: item.units }, item.id)
                    )
                })
            }

            if (new_spec.length > 0) {
                queries.push(
                    insertProductspecification(new_spec)
                )
            }

        }
    } catch (error) {
        console.log("error:::: productUpdate :::", error)
    }
})

exports.deleteImages = catchAsync(async (req, res) => {
    const productId = req.params.productId

    const imageId = req.query.imageId

    // await updateProductDetails(productId, { [PARAMS.images]: images })

    await deleteProductImages(productId, imageId)

    return success(res, {}, "Images deleted")

})

exports.updateDefaultImages = catchAsync(async (req, res) =>{
    const productId = req.params.productId

    const valid_ = imageUpdateValidator.validate(req.body)
    if (valid_.error){
        return generalError(res, valid_.error.message, {})
    }
    
    await updateDefaultImage(productId, req.body[PARAMS.id], req.body[PARAMS.isDefault])

    return success(res, {}, "Updated")
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


exports.deleteCategory = catchAsync(async(req, res) =>{
    const categoryId = req.params.categoryId
    await deleteCategory(categoryId)
    return success(res, {}, "Caegory Deleted and linked products set to inactive.")
})