var fs = require('fs');
var c = fs.readFileSync('play.pokemonshowdown.com/js/ko-translation.js', 'utf8');

// Count braces/parens to find imbalance
var braces = 0, parens = 0, brackets = 0;
var inString = false, strChar = '', inLineComment = false, inBlockComment = false;

for (var i = 0; i < c.length; i++) {
    var ch = c[i];

    if (inLineComment) {
        if (ch === '\n') inLineComment = false;
        continue;
    }
    if (inBlockComment) {
        if (ch === '*' && c[i+1] === '/') { inBlockComment = false; i++; }
        continue;
    }
    if (inString) {
        if (ch === '\\') { i++; continue; }
        if (ch === strChar) inString = false;
        continue;
    }
    if (ch === '/' && c[i+1] === '/') { inLineComment = true; continue; }
    if (ch === '/' && c[i+1] === '*') { inBlockComment = true; i++; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { inString = true; strChar = ch; continue; }

    if (ch === '{') braces++;
    else if (ch === '}') braces--;
    else if (ch === '(') parens++;
    else if (ch === ')') parens--;
    else if (ch === '[') brackets++;
    else if (ch === ']') brackets--;

    if (braces < 0 || parens < 0 || brackets < 0) {
        // Find line number
        var line = c.slice(0, i).split('\n').length;
        console.log('NEGATIVE at char', i, 'line ~', line, ch, 'braces:', braces, 'parens:', parens, 'brackets:', brackets);
        // reset to continue finding more
        if (braces < 0) braces = 0;
        if (parens < 0) parens = 0;
        if (brackets < 0) brackets = 0;
    }
}

console.log('Final: braces=', braces, 'parens=', parens, 'brackets=', brackets);
console.log('Total lines:', c.split('\n').length);

// Show last 20 lines
var lines = c.split('\n');
console.log('\nLast 20 lines:');
lines.slice(-20).forEach(function(l, i) {
    console.log((lines.length - 20 + i + 1) + ': ' + l);
});
