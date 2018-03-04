const Hypher = require('hypher'),
    english = require('hyphenation.en-us'),
    h = new Hypher(english);
const Inflectors = require("en-inflectors").Inflectors;

module.exports.makeSingular = word => new Inflectors(word).toSingular();

module.exports.getSyllables = function(words) {
    return words.split(" ").reduce(function(syllables, word) {
        return syllables.concat(h.hyphenate(word));
    }, []);
};
