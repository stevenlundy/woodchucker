const request = require('request-promise-native');
const WordPOS = require('wordpos'),
    wordPOS = new WordPOS();


const SIMILARITY_THRESHOLD = 97;
const FREQUENCY_THRESHOLD = 1;

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

const getFrequency = function(item) {
    let freqTag = item.tags.find(tag => tag.startsWith("f:"));
    return freqTag ? +freqTag.split(":")[1] : 0;
};
const isCloseEnough = item => item.numSyllables == 1 && item.score >= SIMILARITY_THRESHOLD && getFrequency(item) > FREQUENCY_THRESHOLD;
const isNoun = item => item.tags.includes('n');
const isVerb = item => item.tags.includes('v');

async function getNounHomophones(word) {
    let homophones = await getHomophones(word);
    homophones = homophones.filter(isCloseEnough);
    let nouns = new Set(homophones.filter(isNoun).map(i => i.word));
    if (await wordPOS.isNoun(word)) {
        nouns.add(word);
    }
    return nouns;
}

async function getVerbHomophones(word) {
    let homophones = await getHomophones(word);
    homophones = homophones.filter(isCloseEnough);
    let verbs = new Set(homophones.filter(isVerb).map(i => i.word));
    if (await wordPOS.isVerb(word)) {
        verbs.add(word);
    }
    return verbs;
}

module.exports.get = async function(word1, word2) {
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
};
