const fs = require('fs');
const content = fs.readFileSync('docs/design/Color Palette.svg', 'utf8');
const fills = [...content.matchAll(/fill="#([0-9a-fA-F]{6})"/g)].map(m => m[1]);
console.log('Fills:', [...new Set(fills)]);

const strokes = [...content.matchAll(/stroke="#([0-9a-fA-F]{6})"/g)].map(m => m[1]);
console.log('Strokes:', [...new Set(strokes)]);

const texts = [...content.matchAll(/<text[^>]*>(.*?)<\/text>/g)].map(m => m[1]);
console.log('Texts:', texts.slice(0, 20));

const tspans = [...content.matchAll(/<tspan[^>]*>(.*?)<\/tspan>/g)].map(m => m[1]);
console.log('Tspans:', tspans.slice(0, 20));
