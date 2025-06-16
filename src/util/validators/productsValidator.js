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
            "object.base":"kindly provide the details of the specifications name and unit."
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