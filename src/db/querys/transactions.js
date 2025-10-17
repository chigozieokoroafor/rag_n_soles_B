const { PARAMS } = require("../../util/consts");
const { transaction } = require("../models/relationships");

exports.uploadTransaction = async (data )=>{
    return await transaction.create(data)
}

exports.fetchTransactions = async(limit, offset) =>{
    return transaction.findAll(
        {
            limit,
            offset
        }
    )
}

exports.updateTransaction = async(update, orderId) =>{
    await transaction.update(update, {
        where:{
            [PARAMS.orderId]:orderId
        }
    })
}
