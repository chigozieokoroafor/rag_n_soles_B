
const { Op } = require("sequelize");
const { PARAMS } = require("../../util/consts");
const { coupon, product, category } = require("../models/relationships");

exports.createCategoryQuery = async(data) =>{
    return await category.create(
        data
        // {name, img_blob}
    )
}

exports.checkCategoryExists = async(searchKeyword) =>{
    return await category.findOne(
        {
            where:{ 
                [PARAMS.name]: {
                    [Op.like]: `%${searchKeyword}%`
                }
            }
        }
    )
}

exports.fetchCategoryQuery = async() =>{
    return await category.findAll(
        {
            attributes:[PARAMS.uid, PARAMS.spec, PARAMS.name, PARAMS.description]
        }
    )
}

exports.insertCoupon = async(data) =>{
    return await coupon.create(data)
}

exports.getCoupons = async(query,limit, offset) =>{
    return await coupon.findAll(
        {
            where:query,
            limit,
            offset
        }
    )
}

exports.countCoupons = async(query) =>{
    return await coupon.count(
        {
            where:query,
        }
    )
}


exports.fetchSingleCoupon = async(code) =>{
    return await coupon.findOne({where:{code, status: "Active"}})
}

exports.deleteCoupon = async(id) =>{
    return await coupon.destroy({where: {id}})
}

exports.updateCoupon = async(update, id) =>{
    return await coupon.update(update, {where: {id}})
}

exports.getSingleCategory = async(categoryId) =>{
    return await category.findOne({where:{uid: categoryId}})
}

exports.deleteCategory = async (catId) =>{
    await category.destroy({where: {uid: catId}})
    await product.update({status: "Inactive"}, {where: {categoryId: catId}})
}

exports.updateCategory = async(categoryId, update) =>{
    await category.update(update, {where:{uid: categoryId}})
}