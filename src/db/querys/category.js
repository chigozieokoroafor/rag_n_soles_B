
const { Op } = require("sequelize");
const { PARAMS } = require("../../util/consts");
const { category } = require("../models/category");

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
            attributes:[PARAMS.uid, PARAMS.img_url, PARAMS.name]
        }
    )
}