const folkloreController = require("../controllers/folklore-controller.js");
const { folkloreCreateSchema, folkloreUpdateSchema } = require("../validators/folklore-schema.js");

const folkloreRoute = [
    { method: "GET", path: "/cerita", handler: folkloreController.getAllFolklore },
    { method: "GET", path: "/cerita/{id}", handler: folkloreController.getFolkloreById },
    {
        method: "POST",
        path: "/cerita",
        handler: folkloreController.createFolklore,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                output: 'stream',
                parse: true,
                maxBytes: 10 * 1024 * 1024
            },
            validate: {
                payload: folkloreCreateSchema,
                failAction: (request, h, error) => {
                    return h.response({ error: error.details[0].message }).code(400).takeover();
                },
            },
        },
    },
    {
        method: "PUT",
        path: "/cerita/{id}",
        handler: folkloreController.updateFolklore,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                output: 'stream',
                parse: true,
                maxBytes: 10 * 1024 * 1024
            },
            validate: {
                payload: folkloreUpdateSchema,
                failAction: (request, h, error) => {
                    return h.response({ error: error.details[0].message }).code(400).takeover();
                },
            },
        },
    },
    {
        method: "DELETE",
        path: "/cerita/{id}",
        handler: folkloreController.deleteFolklore,
    },
];

module.exports = folkloreRoute;