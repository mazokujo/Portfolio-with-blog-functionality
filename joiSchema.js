// require joi to verify no error is present in our model before it goes to mongodb
const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');
//extension to prevent cross site scripting
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.blogSchema = Joi.object({
    blog: Joi.object({
        title: Joi.string().required().escapeHTML(),
        content: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
        date: Joi.date().required(),
        thumbnail: Joi.object({
            url: Joi.string().required(),
            filename: Joi.string().required(),
        }).required()
    }).required(),
    deleteImages: Joi.object()
})
module.exports.projectSchema = Joi.object({
    project: Joi.object({
        title: Joi.string().required().escapeHTML(),
        content: Joi.string().required().escapeHTML(),
        category: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
        client: Joi.string().required().escapeHTML(),
        date: Joi.date().required()
        // images: Joi.object({
        //     url: Joi.string().required(),
        //     filename: Joi.string().required(),
        // }).required()
    }).required(),
    deleteImages: Joi.array()
})

module.exports.commentSchema = Joi.object({
    comment: Joi.object({
        text: Joi.string().required().escapeHTML(),
    }).required()
})




