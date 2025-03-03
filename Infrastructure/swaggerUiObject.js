


const swaggerUiObject = {
    routePrefix: '/documentation',
    uiConfig: {
        docExpansion: 'full',
        deepLinking: false
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
    transformSpecificationClone: true
}

module.exports = swaggerUiObject