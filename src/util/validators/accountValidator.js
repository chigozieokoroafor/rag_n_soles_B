const Joi = require("joi");
const { PARAMS } = require("../consts");

exports.createAccountSchema = Joi.object(
    {
        email: Joi.string().email().required().messages({
            "any.required": "Email required",
            "string.empty": "Email Cannot be empty",
            "string.email.base": "Kindly provide a valid email",
        }),
        password: Joi.string().min(3).required().messages({
            "any.required": "Password required",
            "string.min.base": "Password can not be less than 3 characters.",
            "string.empty": "Password can not be empty"
        }),
        name: Joi.string().required().messages({
            "any.required": "Name required",
            "string.empty": "Name can not be empty"
        }),
        phone_no: Joi.string().required().messages({
            "any.required": "Phone number required",
            "string.empty": "Phone number can not be empty"
        }),
        [PARAMS.billing_address]: Joi.string().required().messages({
            "any.required": "Address required",
            "string.empty": "Address can not be empty"
        }),
        business_name: Joi.string().required().messages({
            "any.required": "Business name required.",
            "string.empty": "Business name can not be empty"
        }),

        // username:Joi.string().messages({
        //     "string.base":"kindly enter a prefered username",
        //     "string.empty":"Username should not be empty."
        // })
    }
).required().messages({
    "any.required": "Account required."
})

exports.loginValidator = Joi.object(
    {
        email: Joi.string().email().required().messages(
            {
                "any.required": "email required",
                "string.empty": "email cannot be empty",
                "string.emall.base": "kindly provide a valid email"
            }
        ),
        password: Joi.string().required().messages(
            {
                "any.required": "Password required",
                "string.empty": "Password cannot be empty."
            }
        )


    }
).required().messages(
    {
        "any.required": "Kindly provide an email and password before proceeding."
    }
)


exports.createAdminSchema = Joi.object(
    {
        [PARAMS.email]: Joi.string().email().required( ).messages(
            {
                "any.required":"Email required.",
                "string.empty":"Email not required to be empty",
                "string.email":"Provide a valid email"
            }
        ),
        [PARAMS.name]: Joi.string().required( ).messages(
            {
                "any.required":"Name required.",
                "string.base":"Provide a valid Name"
            }
        ),
        [PARAMS.phone_no]: Joi.string().required( ).messages(
            {
                "any.required":"phone number required.",
                "string.base":"Provide a valid phone number"
            }
        ),
        [PARAMS.role]: Joi.string().required( ).messages(
            {
                "any.required":"Role required.",
                "string.base":"Provide a valid role"
            }
        ),
    }
).required().messages(
    {
        "any.required":"Kindly provide admin details to proceed"
    }
)


exports.adminSchema = Joi.object(
    {
        [PARAMS.email]: Joi.string().email().messages(
            {
                
                "string.empty":"Email not required to be empty",
                "string.email":"Provide a valid email"
            }
        ),
        [PARAMS.name]: Joi.string().messages(
            {
                
                "string.base":"Provide a valid Name"
            }
        ),
        [PARAMS.phone_no]: Joi.string().messages(
            {
                
                "string.base":"Provide a valid phone number"
            }
        ),
        [PARAMS.role]: Joi.string().messages(
            {
                "string.base":"Provide a valid role"
            }
        ),
        [PARAMS.status]: Joi.string().messages(
            {
                "string.base":"Provide a valid status"
            }
        ),
        [PARAMS.billing_address]:Joi.string().messages(
            {
                "string.base":"Provide address of company"
            }
        ),
        [PARAMS.business_name]: Joi.string().messages(
            {
                "string.base":"Provide address of company"
            }
        )


    }
).required().messages(
    {
        "any.required":"Kindly provide details to proceed"
    }
)