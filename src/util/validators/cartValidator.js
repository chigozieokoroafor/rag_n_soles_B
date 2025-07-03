const Joi = require("joi")
const { PARAMS } = require("../consts")


exports.specItems = Joi.object(
    {
        "id": Joi.number().required().messages(
            {
                "any.required": "Kindly the id of specification.",
                "number.empty": "Kindly select precification."
            }
        ),

        "size": Joi.string().required().messages(
            {
                "any.required": "Kindly select a size of product to be purchased.",
                "string.empty": "Kindly select a valid size of product."
            }
        ),
        "count": Joi.number().min(1).required().messages(
            {
                "any.required": "Kindly provide the number of items being purchased for the specification.",
                "number.empty": "Kindly select a how much of the specific size to be purchased.",
                "number.min":"minimus is 1"
            }
        )
    }
)


exports.addToCartSchema = Joi.object(
    {
        [PARAMS.productId]: Joi.string().required().messages(
            {
                "any.required": "Kindly select a product to add to cart.",
                "string.empty": "Kindly select a valid product to add to cart."
            }
        ),
        [PARAMS.specifications]: Joi.array().items(this.specItems).required().messages(
            {
                "any.required": "Kindly provide product specification.",
                "array.base": "Kindly provide a list of prefered sizes.",
                'array.includesRequiredUnknowns': "Kindly select at least one size"
            }
        )
    }
).required().messages(
    {
        "any.required": "Cart details required",
        "object.empty": "product to upload cannot be empty"
    }
)


exports.checkoutSchema = Joi.object(
    {
        products: Joi.array().items(this.addToCartSchema).required().messages(
            {
                "any.required": "Products required to checkout",
                "array.base": "Kindly provide a list of products.",
                'array.includesRequiredUnknowns': "Kindly select at least one product"
            }
        ),

        coupon :Joi.string().messages(
            {
                "string.empty": "Kindly provide a valid  coupon code."
            }
        ),
        isDeliveryFree: Joi.boolean().required().messages(
            {
                "any.required": "Kindly select your delivery option"
            }
        ),
        locationId: Joi.number().messages(
            {
                "number.base":"Kindly select a valid location for delivery"
            }
        )
       

    }
).required().messages(
    {
        "any.required": "Checkout details required",
        "object.empty": "Cart to checkout cannot be empty"
    }
)