const knex = require('knex')(require('./knexfile'))


module.exports = {

    createWord: function(value, frequency) {
        return knex('word').insert({value, frequency});
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
