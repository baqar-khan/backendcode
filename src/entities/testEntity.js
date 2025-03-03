const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    target: 'RateUs',
    name: 'rate-us',
    tableName: 'rate-us',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid',
            default: () => 'uuid_generate_v4()',
        },
        stars: {
            type: 'varchar',
            nullable: false,
        },
        createdAt: {
            type: 'timestamp',
            default: () => 'CURRENT_TIMESTAMP',
        },
        isDeleted: {
            type: 'boolean',
            default: false,
        },
    },

});
