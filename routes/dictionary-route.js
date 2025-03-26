const dictionaryController = require("../controllers/dictionary-controller.js");
const { dictionaryCreateSchema, dictionaryUpdateSchema } = require("../validators/dictionary-schema.js");

const dictionaryRoute = [
    { method: "GET", path: "/kamus", handler: dictionaryController.getAllDictionary },
    { method: "GET", path: "/kamus/{id}", handler: dictionaryController.getDictionaryById },
    {
        method: "POST",
        path: "/kamus",
        handler: dictionaryController.createDictionary,
        options: {
            validate: {
                payload: dictionaryCreateSchema,
                failAction: (request, h, error) => {
                    return h.response({ error: error.details[0].message }).code(400).takeover();
                },
            },
        },
    },
    {
        method: "PUT",
        path: "/kamus/{id}",
        handler: dictionaryController.updateDictionary,
        options: {
            validate: {
                payload: dictionaryUpdateSchema,
                failAction: (request, h, error) => {
                    return h.response({ error: error.details[0].message }).code(400).takeover();
                },
            },
        },
    },
    {
        method: "DELETE",
        path: "/kamus/{id}",
        handler: dictionaryController.deleteDictionary,
    },
]

module.exports = dictionaryRoute;