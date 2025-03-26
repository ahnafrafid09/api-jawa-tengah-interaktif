const traditionController = require("../controllers/tradition-controller.js");
const { traditionCreateSchema, traditionUpdateSchema } = require("../validators/tradition-schema.js");

const traditionRoute = [
    { method: "GET", path: "/tradisi", handler: traditionController.getAllTraditions },
    { method: "GET", path: "/tradisi/{id}", handler: traditionController.getTraditionById },
    {
        method: "POST",
        path: "/tradisi",
        handler: traditionController.createTradition,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                output: 'stream',
                parse: true,
                maxBytes: 2 * 1024 * 1024
            },
            validate: {
                payload: traditionCreateSchema,
                failAction: (request, h, error) => {
                    return h.response({ error: error.details[0].message }).code(400).takeover();
                },
            },
        },
    },
    {
        method: "PUT",
        path: "/tradisi/{id}",
        handler: traditionController.updateTradition,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                output: 'stream',
                parse: true,
                maxBytes: 2 * 1024 * 1024
            },
            validate: {
                payload: traditionUpdateSchema,
                failAction: (request, h, error) => {
                    return h.response({ error: error.details[0].message }).code(400).takeover();
                },
            },
        },
    },
    {
        method: "DELETE",
        path: "/tradisi/{id}",
        handler: traditionController.deleteTradition,
    },
];

module.exports = traditionRoute;