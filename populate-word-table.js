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
        throw new Error("too many syllables");
    }
    let matches = await nounVerbPairService.getHomophones(word);
    let match = matches.find(w => w.word.toLowerCase() === word.toLowerCase());
    if (!match) {
        throw new Error("match not found");
    }
    let frequency = nounVerbPairService.getFrequency(match);
    await store.createWord(word, frequency);
}

async function addWordsToDatabase(words) {
    let existingWords = await store.getAllWords();
    existingWords = existingWords.reduce(function(allWords, word) {
        allWords[word.value] = true;
        return allWords;
    }, {});
    for (var i = 0; i < words.length; i++) {
        let message = `${i}/${words.length} "${words[i]}": `;
        if (!existingWords[words[i]]) {
            try {
                await addWordToDatabase(words[i]);
                message += `inserted`;
            } catch (err) {
                message += `skipped (${err})`;
            }
        } else {
            message += `skipped (already in database)`;
        }
        console.log(message);
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
