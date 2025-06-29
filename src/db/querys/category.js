
const { Op } = require("sequelize");
const { PARAMS } = require("../../util/consts");
const { category } = require("../models/category");
const { coupon } = require("../models/product");

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
    return coupon.findAll(
        {
            where:query,
            limit,
            offset
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