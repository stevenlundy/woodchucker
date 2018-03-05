const sentenceFormatter = require('./sentence-formatter');
const utils = require('./utils');
const nounVerbPairService = require('./noun-verb-pairs');


async function getWoodChuckQAndAPairs(word) {
    let fullWord = utils.makeSingular(word);
    let words = utils.getSyllablesByNLP(fullWord);
    if (words.length !== 2) {
        words = utils.getSyllablesByHyphenation(fullWord);
    }
    if (words.length !== 2) {
        throw new Error("Input must be exactly two syllables. Word was broken into: " + words);
    }
    let nounVerbPairs = await nounVerbPairService.get(words[0], words[1]);
    return nounVerbPairs.map(function(nounVerbPair) {
        return [
            sentenceFormatter.makeQuestion(fullWord, nounVerbPair[0], nounVerbPair[1]),
            sentenceFormatter.makeAnswer(fullWord, nounVerbPair[0], nounVerbPair[1])
        ];
    });
}

let word = process.argv[2];

getWoodChuckQAndAPairs(word).then(function(qAndAPairs) {
    console.log("===================");
    qAndAPairs.forEach(function(qAndA) {
        console.log(qAndA[0]);
        console.log(qAndA[1]);
        console.log("===================");
    });
}).catch(function(e) {
    console.error(e);
});
