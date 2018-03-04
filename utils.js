const Inflectors = require("en-inflectors").Inflectors;
const nlp = require('nlp_compromise'),
    nlpSyllables = require('nlp-syllables');
    nlp.plugin(nlpSyllables);

module.exports.makeSingular = word => new Inflectors(word).toSingular();

module.exports.getSyllables = function(words) {
    return words.split(" ").reduce(function(syllables, word) {
        return syllables.concat(nlp.term(word).syllables());
    }, []);
};
