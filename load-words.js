const nounVerbPairService = require('./noun-verb-pairs');
const utils = require('./utils');


function checkWordForNounVerbPairs(word) {
    let fullWord = utils.makeSingular(word);
    let words = utils.getSyllablesByNLP(fullWord);
    if (words.length !== 2) {
        words = utils.getSyllablesByHyphenation(fullWord);
    }
    if (words.length !== 2) {
        throw new Error("Input must be exactly two syllables. Word was broken into: " + words);
    }
    return nounVerbPairService.get(words[0], words[1]);
}

module.exports.checkWordForNounVerbPairs = checkWordForNounVerbPairs;
