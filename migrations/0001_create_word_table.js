
exports.up = function(knex) {
    return knex.schema.createTable('word', function (table) {
        table.increments('id').primary();
        table.string('value').unique().notNullable();
        table.float('frequency');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('word');
};
