const loadWordsService = require('./load-words');
const nounVerbPairService = require('./noun-verb-pairs');
const store = require('./store');
const utils = require('./utils');


const UNIX_DICT_PATH = '/usr/share/dict/words';

async function addWordToDatabase(word) {
    let syllables = utils.getSyllablesByNLP(word);
    if (syllables.length > 2) {
        syllables = utils.getSyllablesByHyphenation(word);
    }
    if (syllables.length > 2) {
        return;
    }
    let matches = await nounVerbPairService.getHomophones(word);
    let match = matches.find(w => w.word.toLowerCase() === word.toLowerCase());
    if (!match) {
        return;
    }
    let frequency = nounVerbPairService.getFrequency(match);
    await store.createWord(word, frequency);
    console.log(word + ' inserted');
}

async function addWordsToDatabase(words) {
    for (var i = 0; i < words.length; i++) {
        await addWordToDatabase(words[i]);
    }
}

if (require.main === module) {
    let dictionaryPath = process.argv[2] || UNIX_DICT_PATH;
    loadWordsService.getLinesFromFile(dictionaryPath)
        .then(addWordsToDatabase)
        .then(function() {
            console.log("Done!");
            process.exit();
        })
        .catch(function(err) {
            console.log(err);
        });
}
