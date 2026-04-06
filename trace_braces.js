var fs = require('fs');
var c = fs.readFileSync('js/ko-translation.js', 'utf8');
var lines = c.split('\n');

var braces = 0, parens = 0;
var inString = false, strChar = '';
var inLineComment = false, inBlockComment = false;

// Show brace counts at key lines
var keyLines = [];
for (var i = 0; i < lines.length; i++) {
    var prevBraces = braces;
    var line = lines[i];

    for (var j = 0; j < line.length; j++) {
        var ch = line[j];
        if (inLineComment) break; // rest of line is comment
        if (inBlockComment) {
            if (ch === '*' && line[j+1] === '/') { inBlockComment = false; j++; }
            continue;
        }
        if (inString) {
            if (ch === '\\') { j++; continue; }
            if (ch === strChar) inString = false;
            continue;
        }
        if (ch === '/' && line[j+1] === '/') { inLineComment = true; break; }
        if (ch === '/' && line[j+1] === '*') { inBlockComment = true; j++; continue; }
        if (ch === '"' || ch === "'" || ch === '`') { inString = true; strChar = ch; continue; }
        if (ch === '{') braces++;
        else if (ch === '}') braces--;
        else if (ch === '(') parens++;
        else if (ch === ')') parens--;
    }
    inLineComment = false;

    // Show whenever braces change significantly or we're at key lines
    if (braces !== prevBraces || i < 15 || i > lines.length - 20) {
        keyLines.push({ line: i+1, braces: braces, parens: parens, text: line.trim().slice(0, 60) });
    }
}

console.log('Total lines:', lines.length);
console.log('Final: braces=', braces, 'parens=', parens);
console.log('\nLines where brace count changes:');
keyLines.forEach(function(k) {
    if (k.braces !== 0 || k.parens !== 0) {
        // show only non-zero or interesting lines
    }
    console.log('L' + k.line + ' [b=' + k.braces + ' p=' + k.parens + '] ' + k.text);
});
