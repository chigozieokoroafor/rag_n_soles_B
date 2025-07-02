const Joi = require("joi");
const { PARAMS } = require("../consts");

exports.productUploadSchema = Joi.object(
    {
        name: Joi.string().required().messages(
            {
                "any.required": "Name of product required",
                "string.empty": "Kindly provide a name of the product"
            }
        ),
        categoryId: Joi.string().required().messages(
            {
                "any.required": "Kindly select a category the product falls under",
                "string.empty": "Kindly provide a category"
            }
        ),

        price: Joi.number().required().messages(
            {
                "any.required": "Price of product required.",
                "number.base": "Kindly provide the price of the product.",
                "number.empty": "Number cannot be empty."
            }
        ),

        spec: Joi.string()
            // .items(
            //     Joi.object({
            //         name: Joi.string().messages({
            //             "any.required": "Name is required",
            //             "string.empty": "Name  cannot be empty"
            //         }),
            //         unit: Joi.number().messages({
            //             "any.required": "Unit is required",
            //             "string.empty": "Unit cannot be empty"
            //         })
            //     }))
            .messages({
                "array.base": "Specifications must be an array",
                "array.includesRequiredUnknowns": "Specifications items must contain name and unit.",
                "object.base": "kindly provide the details of the specifications name and unit."
            }),

        status: Joi.string().required().messages(
            {
                "any.required": "Kindly provide status of product, Active or Inactive",
                "string.base": "Kindly provide status of product, Active or Inactive"
            }
        )

    }
).required().messages(
    {
        "any.required": "Kindly upload a product to continue."
    }
)


exports.productUpdateSchema = Joi.object(
    {
        name: Joi.string().messages(
            {
                "any.required": "Name of product required",
                "string.empty": "Kindly provide a name of the product"
            }
        ),
        categoryId: Joi.string().messages(
            {
                "any.required": "Kindly select a category the product falls under",
                "string.empty": "Kindly provide a category"
            }
        ),

        price: Joi.number().messages(
            {
                "any.required": "Price of product required.",
                "number.base": "Kindly provide the price of the product.",
                "number.empty": "Number cannot be empty."
            }
        ),

        spec: Joi.alternatives().try(
            Joi.string()
                .messages({
                    "array.base": "Specifications must be an array",
                    "array.includesRequiredUnknowns": "Specifications items must contain name and units.",
                    "string.base": "kindly provide the details of the specifications name and units."
                }),
            Joi.array()
        ),
        

        status: Joi.string().messages(
            {
                "any.required": "Kindly provide status of product, Active or Inactive",
                "string.base": "Kindly provide status of product, Active or Inactive"
            }
        )

    }
).required().messages(
    {
        "any.required": "Kindly upload a product to continue."
    }
)

exports.productSpecificationUpdateSchema = Joi.array().items(
    {
        id: Joi.string().messages(
            {
                "any.required": "product specification id required",
                "string.base": "Kindly provide a valid specification id"
            }
        ),

        name: Joi.string().messages(
            {
                "any.required": "product specification name required",
                "string.base": "Kindly provide a valid specification name"
            }
        ),
        units: Joi.number().required().messages(
            {
                "any.required": "Units of product required.",
                "number.base": "Kindly provide units as an number"
            }
        )
    }
).required().messages(
    {
        "any.required": "Product Specification required as an array if passed",

    }
)

exports.imageUpdateValidator = Joi.object(
    {
        id:Joi.string().required().messages(
            {
                "any.required":"Image id required",
                "string.base":"Kindly provide imgae id as a string/integer"
            }
        ),
        [PARAMS.isDefault]:Joi.boolean().required().messages(
            {
                "any.required":"Kindly provide an option if it's default or not",
                "boolean.base": "Provide your selection as true or false"
            }
        )
    }
).required().messages(
    {
        "any.required": "Request body required, id, isDefault"
    }
)