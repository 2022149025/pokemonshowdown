var fs = require('fs');
var cp = require('child_process');

// Get current HEAD's old version
var old = cp.execSync('git show HEAD~10:play.pokemonshowdown.com/js/ko-translation.js', {encoding: 'utf8', cwd: process.cwd()});
var lines = old.split('\n');
console.log('Old file lines:', lines.length);
console.log('Last 3 lines:', lines.slice(-4).join('\n'));

// Count braces
var braces = 0, parens = 0;
var inString = false, strChar = '';
var inLineComment = false, inBlockComment = false;
for (var i = 0; i < old.length; i++) {
    var ch = old[i];
    if (inLineComment) { if (ch === '\n') inLineComment = false; continue; }
    if (inBlockComment) { if (ch === '*' && old[i+1] === '/') { inBlockComment = false; i++; } continue; }
    if (inString) {
        if (ch === '\\') { i++; continue; }
        if (ch === strChar) inString = false;
        continue;
    }
    if (ch === '/' && old[i+1] === '/') { inLineComment = true; continue; }
    if (ch === '/' && old[i+1] === '*') { inBlockComment = true; i++; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { inString = true; strChar = ch; continue; }
    if (ch === '{') braces++;
    else if (ch === '}') braces--;
    else if (ch === '(') parens++;
    else if (ch === ')') parens--;
}
console.log('Old braces=', braces, 'parens=', parens);
