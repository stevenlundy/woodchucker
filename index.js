const loadWords = require('./load-words');
const sentenceFormatter = require('./sentence-formatter');
const utils = require('./utils');

async function getWoodChuckQAndAPairs(word) {
    let nounVerbPairs = await loadWords.checkWordForNounVerbPairs(word);
    let fullWord = utils.makeSingular(word);
    return nounVerbPairs.map(function(nounVerbPair) {
        return [
            sentenceFormatter.makeQuestion(fullWord, nounVerbPair[0], nounVerbPair[1]),
            sentenceFormatter.makeAnswer(fullWord, nounVerbPair[0], nounVerbPair[1])
        ];
    });
}

if (require.main === module) {
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
}
