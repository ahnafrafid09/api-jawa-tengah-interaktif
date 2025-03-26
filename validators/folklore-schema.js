const Joi = require("joi");

const folkloreCreateSchema = Joi.object({
    judul: Joi.string().min(3).max(100).required(),
    konten: Joi.string().min(10).required(),
    deskripsi: Joi.string().max(300).required(),
    author: Joi.string().min(3).max(50).required(),
    image: Joi.any().required(),
    audio: Joi.any().required(),
});

const folkloreUpdateSchema = Joi.object({
    judul: Joi.string().min(3).max(100),
    konten: Joi.string().min(10),
    deskripsi: Joi.string().max(300),
    author: Joi.string().min(3).max(50),
    image: Joi.any().optional(),
    audio: Joi.any().required(),
});


module.exports = {
    folkloreCreateSchema,
    folkloreUpdateSchema,
};
