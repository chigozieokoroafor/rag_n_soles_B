const Joi = require("joi");

exports.categoryCreationSchema = Joi.object(
    {
        name: Joi.string().required().messages(
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