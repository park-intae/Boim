const fs = require('fs');
const content = fs.readFileSync('docs/design/Design&Wireframe.svg', 'utf8');

const texts = [...content.matchAll(/<tspan[^>]*>(.*?)<\/tspan>/g)].map(m => m[1]);
console.log('Tspans:', texts);

const regularTexts = [...content.matchAll(/<text[^>]*>(.*?)<\/text>/g)].map(m => m[1]);
console.log('Texts:', regularTexts);
