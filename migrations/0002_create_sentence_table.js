
exports.up = function(knex) {
    return knex.schema.createTable('sentence', function (table) {
        table.increments('id').primary();
        table.integer('word_id').unsigned().notNullable();
        table.integer('noun_id').unsigned().notNullable();
        table.integer('verb_id').unsigned().notNullable();
        table.unique('word_id', 'noun_id', 'verb_id');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('sentence');
};
