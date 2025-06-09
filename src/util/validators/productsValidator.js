const Joi = require("joi");

exports.productUploadSchema = Joi.object(
    {   
        name: Joi.string().required().messages(
            {
                "any.required": "Name of product required",
                "string.empty": "Kindly provide a name of the product"
            }
        ),
        categoryId:Joi.string().required().messages(
            {
                "any.required": "Kindly select a category the product falls under",
                "string.empty": "Kindly provide a category"
            }
        ),
        discount: Joi.number().messages(
            {
                "number.base": "Discount required as a number.",
                "number.empty": "Discount should be set as zero if none."
            }
        ),
        price: Joi.number().required().messages(
            {   
                "any.required": "Price of product required.",
                "number.base": "Kindly provide the price of the product.",
                "number.empty": "Number cannot be empty."
            }   
        ),
        colors: Joi.array().required().messages(
            {
                "any.required": "Kindly add the colors of the product.",
                "array.empty": "Colors can not be empty."
            }
        ),
        description: Joi.string().messages({"string.base":"Kindly provide a valid description."}),
        units: Joi.number().required().messages(
            {
                "any.required": "Units of product is required.",
                "number.base": "Kindly provide the product units as a number"
            }
        ),
        specifications: Joi.array().items(
            Joi.object({
                ram: Joi.string().messages({
                    "any.required": "RAM is required",
                    "string.empty": "RAM  cannot be empty"
                }),
                rom: Joi.string().messages({
                    "any.required": "ROM is required",
                    "string.empty": "ROM cannot be empty"
                }),
                cost: Joi.number().default(0).messages({
                    "number.base": "Cost for specification must be a number"
                })
            })
        ).messages({
            "array.base": "Specifications must be an array",
            "array.includesRequiredUnknowns": "Specifications items must contain ram, rom and cost."
        }),
        file:Joi.string().regex(/^data:image\/png;base64,/).required().messages(
            {
                "any.required":"file required",
                "string.regex.base":"file required as a base64 string",
                "string.empty":"file cannot be empty"
            }
        )
    }
).required().messages(
    {
        "any.required": "Kindly upload a product to continue."
    }
)