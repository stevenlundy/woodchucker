const sentenceFormatter = require('./sentence-formatter');

const Hypher = require('hypher'),
    english = require('hyphenation.en-us'),
    h = new Hypher(english);
const Inflectors = require("en-inflectors").Inflectors;
const request = require('request-promise-native');
const WordPOS = require('wordpos'),
    wordPOS = new WordPOS();


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
    word1Nouns = new Set(word1Homophones.filter(isNoun).map(i => i.word));
    if (await wordPOS.isNoun(word1)) {
        word1Nouns.add(word1);
    }
    word1Verbs = new Set(word1Homophones.filter(isVerb).map(i => i.word));
    if (await wordPOS.isVerb(word1)) {
        word1Verbs.add(word1);
    }
    let word2Homophones = await getHomophones(word2);
    word2Homophones = word2Homophones.filter(isCloseEnough);
    word2Nouns = new Set(word2Homophones.filter(isNoun).map(i => i.word));
    if (await wordPOS.isNoun(word2)) {
        word2Nouns.add(word2);
    }
    word2Verbs = new Set(word2Homophones.filter(isVerb).map(i => i.word));
    if (await wordPOS.isVerb(word2)) {
        word2Verbs.add(word2);
    }

    let nounVerbPairs = [];
    word1Nouns.forEach(function(noun) {
        word2Verbs.forEach(function(verb) {
            nounVerbPairs.push([noun, verb]);
        });
    });
    word2Nouns.forEach(function(noun) {
        word1Verbs.forEach(function(verb) {
            nounVerbPairs.push([noun, verb]);
        });
    });
    return nounVerbPairs;
}

async function getWoodChuckQAndAPairs(word) {
    let fullWord = makeSingular(word);
    let words = getSyllables(fullWord);
    let nounVerbPairs = await findNounVerbPairs(words[0], words[1]);
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
});
