const Hypher = require('hypher');
const english = require('hyphenation.en-us');
const h = new Hypher(english);

const Inflectors = require("en-inflectors").Inflectors;

const indefiniteArticle = require('indefinite-article');

let fullWord = new Inflectors('woodchuck');
let words = h.hyphenate(fullWord.toSingular()); // ['wood', 'chuck']

let noun = new Inflectors(words[0]);
let verb = new Inflectors(words[1]);

console.log(`How ${noun.isCountable() ? 'many '+noun.toPlural() : 'much '+noun.toSingular()} would \
${indefiniteArticle(fullWord.toSingular())} ${fullWord.toSingular()} ${verb.toPresent()} if ${indefiniteArticle(fullWord.toSingular())} ${fullWord.toSingular()} could ${verb.toPresent()} \
${noun.isCountable ? noun.toPlural() : noun.toSingular()}?`)
