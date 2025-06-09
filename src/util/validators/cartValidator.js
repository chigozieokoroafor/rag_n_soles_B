const Joi = require("joi")
const { PARAMS } = require("../consts")

exports.addToCartSchema = Joi.object(
    {
        [PARAMS.productId]: Joi.string().required().messages(
            {
                "any.required": "Kindly select a product to add to cart.",
                "string.empty": "Kindly select a valid product to add to cart."
            }
        ),
        [PARAMS.units]: Joi.number().required().messages(
            {
                "any.required": "kindly provide the units of products being purchased.",
                "number.empty": "Units to be purchased cannot be less than 1."
            }
        ),
        [PARAMS.unit_price]:Joi.number().required().messages(
            {
                "any.required": "kindly provide the unit price of products being purchased.",
                // "number.empty": "Unit price  of product to be purchased cannot be less than 1."
            }
        ),
        [PARAMS.specifications]: Joi.object(
            // {
            //     "color",
            //     "size"
            // }
        ).required().messages(
            { "any.required": "Kindly provide a product specification." }
        )
    }
).required().messages(
    {
        "any.required": "Cart details required",
        "object.empty": "product to upload cannot be empty"
    }
)


exports.checkoutSchema = Joi.object(

).required().messages(
    {
        "any.required": "Checkout details required",
        "object.empty": "Cart to checkout cannot be empty"
    }
)