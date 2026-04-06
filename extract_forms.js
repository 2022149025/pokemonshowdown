const fs = require('fs');
const data = fs.readFileSync('play.pokemonshowdown.com/js/ko-desc.js', 'utf8');
const rx = /"([a-z0-9]+)":\s*\{\s*"name":\s*"(.*?\([^\)]+\).*?)"/g;
let m;
let out = '';
while(m = rx.exec(data)) {
    out += m[1] + ': ' + m[2] + '\n';
}
fs.writeFileSync('forms2.txt', out, 'utf8');
