const Joi = require("joi");

exports.categoryCreationSchema = Joi.object(
    {
        name: Joi.string().required().messages(
            {
                "any.required": "Kindly provide a category name",
                "string.empty": "Kindly provide a category name"
            }
        ),
        
        description: Joi.string().messages(
            {
                "any.required": "Kindly provide a category name",
                "string.empty": "Kindly provide a category name"
            }
        ),

        spec: Joi.array().min(1).required().messages(
            {
                "any.required":"Specifications of category required",
                "array.min": "Kindly provide at least one specification"
            }
        )


        // file: Joi.string().regex(/^data:image\/png;base64,/).required().messages(
        //     {
        //         "any.required": "file required",
        //         "string.regex.base": "file required as a base64 string",
        //         "string.empty": "file cannot be empty"
        //     }
        // )
    }
).required().messages(
    {
        "any.required": "Kindly upload a category to continue."
    }
)


exports.categoryUpdateSchema = Joi.object(
    {
        name: Joi.string().messages(
            {
                "any.required": "Kindly provide a category name",
                "string.empty": "Kindly provide a category name"
            }
        ),
        
        description: Joi.string().messages(
            {
                "any.required": "Kindly provide a category name",
                "string.empty": "Kindly provide a category name"
            }
        ),

        spec: Joi.array().min(1).messages(
            {
                "any.required":"Specifications of category required",
                "array.min": "Kindly provide at least one specification"
            }
        )


        // file: Joi.string().regex(/^data:image\/png;base64,/).required().messages(
        //     {
        //         "any.required": "file required",
        //         "string.regex.base": "file required as a base64 string",
        //         "string.empty": "file cannot be empty"
        //     }
        // )
    }
).required().messages(
    {
        "any.required": "Kindly upload a category to continue."
    }
)

exports.couponValidator = Joi.object(
    {
        code: Joi.string().required().messages(
            {
                "any.required": "Coupon code required",
                "string.empty":"Kindly provide  avalid coupon code.",
                
            }
        ),
        type:Joi.string().required().messages(
            {
                "any.required": "Discount type required",
                "string.empty":"Kindly provide  a valid discount type.",
                
            }
        ),

        value: Joi.number().required().messages(
            {
                "any.required": "Discount value required",
                "number.empty":"Kindly provide  a valid discount value.",
                
            }
        ),
        startDate:Joi.string().required().messages(
            {
                "any.required":"Kindly provide a start date.",
                "string.empty":"Kindly provide a start date."
            }
        ),
        
        endDate:Joi.string().required().messages(
            {
                "any.required":"Kindly provide a end date.",
                "string.empty":"Kindly provide a end date."
            }
        ),
        limit:Joi.number().required().messages(
            {
                "any.required": "limit value required",
                "number.empty":"Kindly provide  a valid limit value.",
                
            }
        )

    }
).required().messages(
    {
        "any.required":"Coupon body required."
    }
)

exports.couponUpdateValidator = Joi.object(
    {
        
        type:Joi.string().messages(
            {
                "any.required": "Discount type required",
                "string.empty":"Kindly provide  a valid discount type.",
                
            }
        ),
        status: Joi.string().messages(
            {
                "any.required": "Discount type required",
                "string.empty":"Kindly provide  a valid status: Expired/Active.",
            }
        ),
        value: Joi.number().messages(
            {
                "any.required": "Discount value required",
                "number.empty":"Kindly provide  a valid discount value.",
                
            }
        ),
        startDate:Joi.string().messages(
            {
                "any.required":"Kindly provide a start date.",
                "string.empty":"Kindly provide a start date."
            }
        ),
        
        endDate:Joi.string().messages(
            {
                "any.required":"Kindly provide a end date.",
                "string.empty":"Kindly provide a end date."
            }
        ),
        limit:Joi.number().messages(
            {
                "any.required": "limit value required",
                "number.empty":"Kindly provide  a valid limit value.",
                
            }
        )

    }
).required().messages(
    {
        "any.required":"Coupon body required to mae update."
    }
)