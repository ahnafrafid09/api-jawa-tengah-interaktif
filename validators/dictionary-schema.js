const Joi = require("joi");

const dictionaryCreateSchema = Joi.object({
    bahasa_indonesia: Joi.string().min(3).max(100).required(),
    ngoko: Joi.string().min(3).max(100).required(),
    kramaMadya: Joi.string().min(3).max(100).required(),
    kramaInggil: Joi.string().min(3).max(10).required(),
});



const dictionaryUpdateSchema = Joi.object({
    bahasa_indonesia: Joi.string().min(3).max(100),
    ngoko: Joi.string().min(3).max(100),
    kramaMadya: Joi.string().min(3).max(100),
    kramaInggil: Joi.string().min(3).max(100)
});


module.exports = {
    dictionaryCreateSchema,
    dictionaryUpdateSchema,
};
