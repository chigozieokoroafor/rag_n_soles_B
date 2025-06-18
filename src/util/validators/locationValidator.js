const Joi =require("joi");

exports.locUpload = Joi.object(
    {
        location: Joi.string().required().messages(
            {
                "any.required":"Delivery location required",
                "string.base":"Delivery location required"
            }
        ),
        price: Joi.number().required().messages(
            {
                "any.required":"Delivery price required.",
                "number.empty":"delivery price cannot be 0"
            }
        ),
        period:Joi.string().required().messages(
            {
                "any.required":"Delivery period range required"
            }
        )
    }
).required().messages(
    {
        "any.required":"location data required"
    }
)


exports.locUpdate = Joi.object(
    {
        location: Joi.string().messages(
            {
                "any.required":"Delivery location required",
                "string.base":"Delivery location required"
            }
        ),
        price: Joi.number().messages(
            {
                "any.required":"Delivery price required.",
                "number.empty":"delivery price cannot be 0"
            }
        ),
        period:Joi.string().messages(
            {
                "any.required":"Delivery period range required"
            }
        )
    }
).required().messages(
    {
        "any.required":"location data required"
    }
)