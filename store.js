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

function createSentence({word_id, noun_id, verb_id}) {
    return knex('sentence').insert({word_id, noun_id, verb_id});
}

module.exports = {

    createWord: function({value, frequency}) {
        return onDuplicateKey(knex('word').insert({value, frequency}), knex.update({frequency}));
    },

    getWordByValue: function({value}) {
        return knex.select('*').from('word').where({value});
    },

    getAllWords: function() {
        return knex.select('*').from('word');
    },

    createSentence: createSentence,

    createSentenceByWords: function({word, noun, verb}) {
        return knex
            .first('w.id as word_id', 'n.id as noun_id', 'v.id as verb_id')
            .from({w: 'word', n: 'word', v: 'word'})
            .where({'w.value': word, 'n.value': noun, 'v.value': verb})
            .then(function(row) {
                if (!row || !row.word_id || !row.noun_id || !row.verb_id) {
                    console.log("ERROR for ", word, noun, verb);
                    return;
                }
                return insertIgnore(createSentence(row));
            });
    },

    getSentence: function({id}) {
        return knex
            .select('w.value as word', 'n.value as noun', 'v.value as verb')
            .from({s: 'sentence'})
            .leftJoin({w: 'word'}, 's.word_id', 'w.id')
            .leftJoin({n: 'word'}, 's.noun_id', 'n.id')
            .leftJoin({v: 'word'}, 's.verb_id', 'v.id')
            .where({id});
    }

};
