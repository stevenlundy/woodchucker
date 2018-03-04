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
        headers: {'Cache-Control': 'max-age=86400'},
        json: true
    });
}

const makeSingular = word => new Inflectors(word).toSingular();

function getSyllables(words) {
    return words.split(" ").reduce(function(syllables, word) {
        return syllables.concat(h.hyphenate(word));
    }, []);
}

const getFrequency = function(item) {
    let freqTag = item.tags.find(tag => tag.startsWith("f:"));
    return freqTag ? +freqTag.split(":")[1] : 0;
};

const isCloseEnough = item => item.numSyllables == 1 && item.score >= 97 && getFrequency(item) > 1;

async function getNounHomophones(word) {
    const isNoun = item => item.tags.includes('n');
    let homophones = await getHomophones(word);
    homophones = homophones.filter(isCloseEnough);
    let nouns = new Set(homophones.filter(isNoun).map(i => i.word));
    if (await wordPOS.isNoun(word)) {
        nouns.add(word);
    }
    return nouns;
}

async function getVerbHomophones(word) {
    const isVerb = item => item.tags.includes('v');
    let homophones = await getHomophones(word);
    homophones = homophones.filter(isCloseEnough);
    let verbs = new Set(homophones.filter(isVerb).map(i => i.word));
    if (await wordPOS.isVerb(word)) {
        verbs.add(word);
    }
    return verbs;
}

async function findNounVerbPairs(word1, word2) {
    let nounVerbPairs = [];
    await Promise.all([[word1, word2], [word2, word1]].map(async function(words) {
        let nouns = await getNounHomophones(words[0]);
        let verbs = await getVerbHomophones(words[1]);
        nouns.forEach(function(noun) {
            verbs.forEach(function(verb) {
                nounVerbPairs.push([noun, verb]);
            });
        });
    }));
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
