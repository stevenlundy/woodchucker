const Hypher = require('hypher'),
    english = require('hyphenation.en-us'),
    h = new Hypher(english);
const Inflectors = require("en-inflectors").Inflectors;
const nlp = require('nlp_compromise'),
    nlpSyllables = require('nlp-syllables');
    nlp.plugin(nlpSyllables);

module.exports.makeSingular = word => new Inflectors(word).toSingular();

module.exports.getSyllablesByHyphenation = function(words) {
    return words.split(" ").reduce(function(syllables, word) {
        return syllables.concat(h.hyphenate(word));
    }, []);
};

module.exports.getSyllablesByNLP = function(words) {
    return words.split(" ").reduce(function(syllables, word) {
        return syllables.concat(nlp.term(word).syllables());
    }, []);
};
