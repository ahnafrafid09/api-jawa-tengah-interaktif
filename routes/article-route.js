const articleController = require("../controllers/article-controller.js");
const { articleCreateSchema, articleUpdateSchema } = require("../validators/article-schema.js");

const articleRoute = [
    { method: "GET", path: "/artikel", handler: articleController.getAllArticles },
    { method: "GET", path: "/artikel/{id}", handler: articleController.getArticleById },
    {
        method: "POST",
        path: "/artikel",
        handler: articleController.createArticle,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                output: 'stream',
                parse: true,
                maxBytes: 2 * 1024 * 1024
            },
            validate: {
                payload: articleCreateSchema,
                failAction: (request, h, error) => {
                    return h.response({ error: error.details[0].message }).code(400).takeover();
                },
            },
        },
    },
    {
        method: "PUT",
        path: "/artikel/{id}",
        handler: articleController.updateArticle,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                output: 'stream',
                parse: true,
                maxBytes: 2 * 1024 * 1024
            },
            validate: {
                payload: articleUpdateSchema,
                failAction: (request, h, error) => {
                    return h.response({ error: error.details[0].message }).code(400).takeover();
                },
            },
        },
    },
    {
        method: "DELETE",
        path: "/artikel/{id}",
        handler: articleController.deleteArticle,
    },
];

module.exports = articleRoute;