const Joi =require("joi");

exports.locUpload = Joi.object(
    {
        location,
        price,
        delivery_time:Joi.string
    }
).required().messages(
    {
        "any.required":"location data required"
    }
)