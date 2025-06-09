const { PARAMS } = require("../../util/consts");
const { product } = require("../models/product");

exports.uploadProduct = async (data) => {
    return await product.create(data)
}

exports.getProductsByCategory = async (categoryId, limit, offset) => {
    return await product.findAll(
        {
            where: {
                categoryId,
                [PARAMS.isDeleted]:false
            },
            attributes: [
                PARAMS.uid,
                PARAMS.name,
                PARAMS.img_url,
                PARAMS.price,
                PARAMS.discount,
                PARAMS.specifications
            ],
            offset,
            limit
        }
    )
}

exports.getspecificProduct = async (productId) => {
    return await product.findOne(
        {
            where: {
                [PARAMS.uid]: productId,
                [PARAMS.isDeleted]:false
            },
            attributes:[PARAMS.categoryId, PARAMS.colors, PARAMS.description, PARAMS.discount, PARAMS.img_url, PARAMS.name, PARAMS.price, PARAMS.uid, PARAMS.units, PARAMS.specifications],

        }
    )
}

exports.searchProduct = async (query, offset, limit) => {

    query[PARAMS.isDeleted] = false

    return await product.findAll(
        {
            where: query,
            attributes: [PARAMS.categoryId, PARAMS.colors, PARAMS.description, PARAMS.discount, PARAMS.img_url, PARAMS.name, PARAMS.price, PARAMS.uid, PARAMS.units, PARAMS.specifications],
            offset,
            limit
        }

    )
}

exports.deleteProductQuery = async(productId) =>{
    return await product.update({[PARAMS.isDeleted]:true}, {where:{[PARAMS.uid]:productId}})
}