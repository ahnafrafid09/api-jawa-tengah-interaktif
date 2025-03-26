const Joi = require("joi");

const articleCreateSchema = Joi.object({
    judul: Joi.string().min(3).max(100).required(),
    konten: Joi.string().min(10).required(),
    deskripsi: Joi.string().max(300).required(),
    author: Joi.string().min(3).max(50).required(),
    image: Joi.any().required(),
});



const articleUpdateSchema = Joi.object({
    title: Joi.string().min(3).max(100),
    content: Joi.string().min(10),
    deskripsi: Joi.string().max(300),
    author: Joi.string().min(3).max(50),
    image: Joi.any().optional(),
});


module.exports = {
    articleCreateSchema,
    articleUpdateSchema,
};
