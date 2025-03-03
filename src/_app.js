const fastify = require('fastify');
const fastifySwagger = require('@fastify/swagger');
const fastifyMultipart = require('@fastify/multipart');
const fastifySwaggerUi = require('@fastify/swagger-ui');
const fastifyCookie = require("@fastify/cookie")
const dotenv = require('dotenv');

const swaggerUiObject = require('../Infrastructure/swaggerUiObject.js');
const swaggerObject = require('../Infrastructure/swaggerObject.js');
const mainRoutes = require("./routes/index.js")
const dataSource = require("../Infrastructure/postgres.js")
const { logger } = require("../Infrastructure/logger.js")
dotenv.config();

const serverInitializer = async () => {
    const app = fastify({ logger: true });

    //Middleware Stack
    app.register(fastifyCookie);
    app.register(fastifyMultipart);
    app.register(fastifySwagger, swaggerObject.options);
    app.register(fastifySwaggerUi, swaggerUiObject)

    // Root Routes
    app.get('/', async (req, res) => {
        res.send({
            code: 200,
            status: 'OK',
            message: 'Fastify server is running',
        });
    });

    // Register Routes
    mainRoutes(app)

    // Database Initialization and Server Start

    try {
        await dataSource
            .initialize()
            .then(() => {
                logger.info('Database connection has been established...');

            })
            .catch((error) => {
                logger.error('Database connection error:', {
                    message: error.message,
                    stack: error.stack,
                    details: error, // Log the entire error object for additional context
                });

                process.exit(1);
            });

        app.listen({
            port: process.env.SERVER_PORT,
            host: process.env.SERVER_HOST,
        });
        logger.info(`Server is listening on port ${process.env.SERVER_PORT}`);
    } catch (error) {
        logger.error('Server startup error:', error);
        process.exit(1);
    }
};

module.exports = serverInitializer;