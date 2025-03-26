const Joi = require("joi");

const traditionCreateSchema = Joi.object({
    judul: Joi.string().min(3).max(100).required(),
    konten: Joi.string().min(10).required(),
    author: Joi.string().min(3).max(50).required(),
    kota: Joi.string().min(3).max(50).required(),
    image: Joi.any().required(),
});

const traditionUpdateSchema = Joi.object({
    judul: Joi.string().min(3).max(100),
    konten: Joi.string().min(10),
    author: Joi.string().min(3).max(50),
    kota: Joi.string().min(3).max(50),
    image: Joi.any().optional(),
});

module.exports = {
    traditionCreateSchema,
    traditionUpdateSchema,
};