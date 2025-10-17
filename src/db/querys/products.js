const { Op } = require("sequelize");
const { PARAMS } = require("../../util/consts");
const { product, specifications, category, images } = require("../models/relationships");

exports.uploadProduct = async (data) => {
    return await product.create(data)
}

exports.getProductsByCategory = async (categoryId, limit, offset) => {
    return await product.findAll(
        {
            where: {
                categoryId,
                [PARAMS.isDeleted]: false
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
                [PARAMS.isDeleted]: false
            },
            attributes: [PARAMS.categoryId, PARAMS.name, PARAMS.price, PARAMS.uid, PARAMS.status],
            include: [
                {
                    model: specifications
                },
                {
                    model: category,
                    as: "Category"
                },
                {
                    model: images
                }
            ]

        }
    )
}

exports.searchProduct = async (query, offset, limit) => {

    query[PARAMS.isDeleted] = false

    return await product.findAll(
        {
            where: query,
            attributes: [PARAMS.categoryId, PARAMS.name, PARAMS.price, PARAMS.uid, PARAMS.status],
            include: [
                {
                    model: category,
                    attributes: [PARAMS.uid, PARAMS.name],
                    as: "Category"
                },
                {
                    model: specifications,
                    attributes: [PARAMS.id, PARAMS.name, PARAMS.units]
                },
                {
                    model: images,
                    attributes: [PARAMS.id, PARAMS.url, PARAMS.isDefault]
                }
            ],
            offset,
            limit
        }

    )
}


exports.countProducts = async (query) => {

    query[PARAMS.isDeleted] = false

    return await product.count(
        {
            where: query,
        }

    )
}

exports.deleteProductQuery = async (productId) => {
    return await product.update({ [PARAMS.isDeleted]: true }, { where: { [PARAMS.uid]: productId } })
}

exports.uploadProductImage = async (data) => {

    await images.bulkCreate(data)
    // return await product.update({
    //     images: images
    // }, {
    //     where: { uid: productId }
    // })
}

exports.updateProductDetails = async (productId, update) => {
    return await product.update(
        update,
        {
            where: {
                uid: productId
            }
        }
    )
}

exports.countAllproducts = async (
    query
) => {
    query[PARAMS.isDeleted] = false

    return await product.count(
        {
            where: query
        }
    )
}

exports.getUniqueProductsWithLowUnitsAlt = async () => {
  const count = await specifications.count({
    distinct: true,
    col: PARAMS.productId,
    where: {
      [PARAMS.units]: {
        [Op.lt]: 5
      }
    }
  });
  
  return count;
};

exports.reduceProductCount = async (count, id) => {
    await specifications.decrement(PARAMS.units, { by: count, where: { id } })
}

exports.insertProductspecification = async (data) => {
    return await specifications.bulkCreate(data)
}

exports.updateProductSpecification = async (update, specId) => {
    await specifications.update(update, { where: { id: specId } })
}

exports.deleteBulkSpecification = async (productId, ids) => {
    await specifications.destroy(
        {
            where: {
                productId: productId,
                id: {
                    [Op.notIn]: ids
                }
            }
        }
    )
}

exports.deleteProductImages = async (productId, imageId) => {
    return await images.destroy(
        {
            where: {
                id: imageId,
                productId: productId
            }
        }
    )
}

exports.updateDefaultImage = async (productId, imageId, isDefault) => {
    await images.update({ [PARAMS.isDefault]: isDefault }, {
        where: {
            id: imageId,
            [PARAMS.productId]: productId
        }
    })
}

exports.getProductsByIds = async(ids) =>{
    

    return await product.findAll(
        {
            where: {
                uid: {
                    [Op.in]: ids
                },
                isDeleted: false
            },
            attributes: [PARAMS.categoryId, PARAMS.name, PARAMS.price, PARAMS.uid, PARAMS.status],
            include: [
                {
                    model: category,
                    attributes: [PARAMS.uid, PARAMS.name],
                    as: "Category"
                },
                {
                    model: specifications,
                    attributes: [PARAMS.id, PARAMS.name, PARAMS.units]
                },
                {
                    model: images,
                    attributes: [PARAMS.id, PARAMS.url, PARAMS.isDefault]
                }
            ],
        }

    )
}
