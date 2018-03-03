const indefiniteArticle = require('indefinite-article');
const Inflectors = require("en-inflectors").Inflectors;


function addMuchOrMany(noun) {
    return noun.isCountable() ? "many " + noun.toPlural() : "much " + noun.toSingular();
}

function addIndefiniteArticle(noun) {
    return indefiniteArticle(noun.toSingular()) + " " + noun.toSingular();
}

function getCondition(fullWord, noun, verb) {
    return `if ${addIndefiniteArticle(fullWord)} could ${verb.toPresent()} ${noun.toPlural()}`;
}

module.exports.makeQuestion = function(fullWord, noun, verb) {
    fullWord = new Inflectors(fullWord);
    noun = new Inflectors(noun);
    verb = new Inflectors(verb);
    return `How ${addMuchOrMany(noun)} would ${addIndefiniteArticle(fullWord)} ${verb.toPresent()} ${getCondition(fullWord, noun, verb)}?`;
};

module.exports.makeAnswer = function(fullWord, noun, verb) {
    fullWord = new Inflectors(fullWord);
    noun = new Inflectors(noun);
    verb = new Inflectors(verb);
    return `${addIndefiniteArticle(fullWord)} would ${verb.toPresent()} lots of ${noun.toPlural()} ${getCondition(fullWord, noun, verb)}.`;
};
