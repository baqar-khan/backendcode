
module.exports = async function (fastify, opts) {
    // Yahan apni routes register karein
    const mainRoutes = require('./user.route.js');
    fastify.register(mainRoutes);
};
