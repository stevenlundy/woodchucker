const Hypher = require('hypher');
const english = require('hyphenation.en-us');
const h = new Hypher(english);

const Inflectors = require("en-inflectors").Inflectors;

const indefiniteArticle = require('indefinite-article');


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
    return `How ${addMuchOrMany(noun)} would ${addIndefiniteArticle(fullWord)} ${verb.toPresent()} ${getCondition(fullWord, noun, verb)}?`;
}

function makeAnswer(fullWord, noun, verb) {
    return `${addIndefiniteArticle(fullWord)} would ${verb.toPresent()} lots of ${noun.toPlural()} ${getCondition(fullWord, noun, verb)}.`;
}

function getSyllables(words) {
    return words.split(" ").reduce(function(syllables, word) {
        return syllables.concat(h.hyphenate(word));
    }, []);
}

function getWoodChuckQandA(word) {
    let fullWord = new Inflectors(word);
    let noun, verb, extra;
    let words = getSyllables(fullWord.toSingular()).map(word => new Inflectors(word));
    [noun, verb, ...extra] = words;
    return [
        makeQuestion(fullWord, noun, verb),
        makeAnswer(fullWord, noun, verb)
    ];
}

let question, answer;
[question, answer] = getWoodChuckQandA('woodchuck');

console.log(question);
console.log(answer);
