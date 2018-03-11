var fs = require('fs');

const nounVerbPairService = require('./noun-verb-pairs');
const utils = require('./utils');

const UNIX_DICT_PATH = '/usr/share/dict/words';
const OUT_FILE_PATH = 'noun_verb_pairs.csv';


function getLinesFromFile(filePath) {
    return new Promise(function(resolve, reject) {
        fs.readFile(filePath,'utf8', function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data.split(/\r?\n/));
            }
        });
    });
}

function appendFile(filePath, text) {
    return new Promise(function(resolve, reject) {
        fs.appendFile(filePath, text, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

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

async function getNounVerbPairsForWords(words) {
    let nounVerbPairsPerWord = await Promise.all(words.map(async function(word) {
        let nounVerbPairs;
        try {
            nounVerbPairs = await checkWordForNounVerbPairs(word);
        } catch (err) {
            nounVerbPairs = [];
        }
        nounVerbPairs.forEach(pair => pair.push(word));
        return nounVerbPairs;
    }));
    return nounVerbPairsPerWord.reduce(function(allNounVerbPairs, nounVerbPairs) {
        if (nounVerbPairs) {
            allNounVerbPairs = allNounVerbPairs.concat(nounVerbPairs);
        }
        return allNounVerbPairs;
    }, []);
}

function appendNounVerbToCSV(nounVerbPairs) {
    let text = nounVerbPairs.map(pair => pair.toString()).join('\n') + '\n';
    return appendFile(OUT_FILE_PATH, text);
}

async function bulkProcessNounVerbPairs(words, persistData) {
    let chunkSize = 20;
    for (let i = 0; i < words.length; i += chunkSize) {
        let nounVerbPairs = await getNounVerbPairsForWords(words.slice(i, i + chunkSize));
        if (nounVerbPairs.length){
            await persistData(nounVerbPairs);
        }
    };
}

if (require.main === module) {
    let dictionaryPath = process.argv[2] || UNIX_DICT_PATH;
    getLinesFromFile(dictionaryPath)
        .then(function(words) {
            return bulkProcessNounVerbPairs(words, appendNounVerbToCSV);
        }).catch(function(err) {
            console.log(err);
        });
}

module.exports.checkWordForNounVerbPairs = checkWordForNounVerbPairs;
module.exports.getLinesFromFile = getLinesFromFile;
