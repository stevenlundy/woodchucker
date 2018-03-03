const Hypher = require('hypher');
const english = require('hyphenation.en-us');
const h = new Hypher(english);

const Inflectors = require("en-inflectors").Inflectors;

const indefiniteArticle = require('indefinite-article');

const request = require('request-promise-native');

function getHomophones(word) {
    return request({
        uri: 'https://api.datamuse.com/words',
        qs: {
            sl: word, // sounds like word
            md: 'fp', // include metadata for frequency (f) and part of speech (p)
            max: 50 // limit to 50 responses
        },
        json: true
    });
}

function addMuchOrMany(noun) {
    return noun.isCountable() ? "many " + noun.toPlural() : "much " + noun.toSingular();
}

function addIndefiniteArticle(noun) {
    return indefiniteArticle(noun.toSingular()) + " " + noun.toSingular();
}

function getCondition(fullWord, noun, verb) {
    return `if ${addIndefiniteArticle(fullWord)} could ${verb.toPresent()} ${noun.toPlural()}`;
}

function makeQuestion(fullWord, noun, verb) {
    fullWord = new Inflectors(fullWord);
    noun = new Inflectors(noun);
    verb = new Inflectors(verb);
    return `How ${addMuchOrMany(noun)} would ${addIndefiniteArticle(fullWord)} ${verb.toPresent()} ${getCondition(fullWord, noun, verb)}?`;
}

function makeAnswer(fullWord, noun, verb) {
    fullWord = new Inflectors(fullWord);
    noun = new Inflectors(noun);
    verb = new Inflectors(verb);
    return `${addIndefiniteArticle(fullWord)} would ${verb.toPresent()} lots of ${noun.toPlural()} ${getCondition(fullWord, noun, verb)}.`;
}

const makeSingular = word => new Inflectors(word).toSingular();

function getSyllables(words) {
    return words.split(" ").reduce(function(syllables, word) {
        return syllables.concat(h.hyphenate(word));
    }, []);
}

async function findNounVerbPairs(word1, word2) {
    const getFrequency = function(item) {
        let freqTag = item.tags.find(tag => tag.startsWith("f:"));
        return freqTag ? +freqTag.split(":")[1] : 0;
    };
    const isCloseEnough = item => item.numSyllables == 1 && item.score >= 97 && getFrequency(item) > 1;
    const isNoun = item => item.tags.includes('n');
    const isVerb = item => item.tags.includes('v');

    let word1Homophones = await getHomophones(word1);
    word1Homophones = word1Homophones.filter(isCloseEnough);
    let word2Homophones = await getHomophones(word2);
    word2Homophones = word2Homophones.filter(isCloseEnough);

    let nounVerbPairs = [];
    word1Homophones.filter(isNoun).forEach(function(noun) {
        word2Homophones.filter(isVerb).forEach(function(verb) {
            nounVerbPairs.push([noun.word, verb.word]);
        });
    });
    word2Homophones.filter(isNoun).forEach(function(noun) {
        word1Homophones.filter(isVerb).forEach(function(verb) {
            nounVerbPairs.push([noun.word, verb.word]);
        });
    });
    return nounVerbPairs;
}

async function getWoodChuckQAndAPairs(word) {
    let fullWord = makeSingular(word);
    let words = getSyllables(fullWord);
    nounVerbPairs = await findNounVerbPairs(words[0], words[1]);
    return nounVerbPairs.map(function(nounVerbPair) {
        return [
            makeQuestion(fullWord, nounVerbPair[0], nounVerbPair[1]),
            makeAnswer(fullWord, nounVerbPair[0], nounVerbPair[1])
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
});
