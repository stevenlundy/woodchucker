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

let fullWord = new Inflectors('woodchuck');
let words = h.hyphenate(fullWord.toSingular()); // ['wood', 'chuck']

let noun = new Inflectors(words[0]);
let verb = new Inflectors(words[1]);

console.log(makeQuestion(fullWord, noun, verb));
console.log(makeAnswer(fullWord, noun, verb));
