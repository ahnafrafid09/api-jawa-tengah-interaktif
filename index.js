const Hapi = require('@hapi/hapi');
const articleRoute = require('./routes/article-route.js');
const traditionRoute = require('./routes/tradition-route.js');
const dictionaryRoute = require('./routes/dictionary-route.js');
const folkloreRoute = require('./routes/folklore-route.js');
require("dotenv").config();

const init = async () => {

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
                headers: ['Accept', 'Content-Type', 'Authorization'],
                additionalHeaders: ['X-Requested-With'],
                credentials: true
            }
        }
    });
    server.route([...articleRoute]);
    server.route([...traditionRoute]);
    server.route([...dictionaryRoute]);
    server.route([...folkloreRoute]);

    await server.start();

    console.log("Server berjalan di:", server.info.uri);

};

init();
