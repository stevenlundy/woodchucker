const knex = require('knex')(require('./knexfile'))


function insertIgnore(knexQuery) {
    // knex doesn't have the functionality to ignore duplicate
    // i.e only insert if data does not exist
    // We convert to a query string, splice in the ignore, and run it
    return knex.raw(knexQuery.toString().replace('insert', 'INSERT IGNORE'));
}

function onDuplicateKey(knexQuery, onDuplicateQuery) {
    // knex doesn't have the functionality to update on duplicate key
    // i.e if data exists, update instead
    // We convert to a query string, concat onDuplicateQuery, and run it
    return knex.raw(
        knexQuery.toString() +
        ' ON DUPLICATE KEY ' +
        onDuplicateQuery.toString().replace(' set ', ' ')
    );
}

module.exports = {

    createWord: function(value, frequency) {
        return onDuplicateKey(knex('word').insert({value, frequency}), knex.update({frequency}));
    },

    getWordByValue: function(value) {
        return knex.select('*').from('word').where({value});
    },

    createSentence: function(word_id, noun_id, verb_id) {
        return knex('sentence').insert({word_id, noun_id, verb_id});
    },

    getSentence: function(id) {
        return knex
            .select('w.value as word', 'n.value as noun', 'v.value as verb')
            .from({s: 'sentence'})
            .leftJoin({w: 'word'}, 's.word_id', 'w.id')
            .leftJoin({n: 'word'}, 's.noun_id', 'n.id')
            .leftJoin({v: 'word'}, 's.verb_id', 'v.id')
            .where({id});
    }

};
