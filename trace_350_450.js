var fs = require('fs');
var c = fs.readFileSync('js/ko-translation.js', 'utf8');
var lines = c.split('\n');

var braces = 0, parens = 0;
var inString = false, strChar = '';
var inLineComment = false, inBlockComment = false;

for (var i = 0; i < lines.length; i++) {
    var line = lines[i];

    for (var j = 0; j < line.length; j++) {
        var ch = line[j];
        if (inLineComment) break;
        if (inBlockComment) { if (ch === '*' && line[j+1] === '/') { inBlockComment = false; j++; } continue; }
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

    if (i >= 349 && i <= 455) {
        console.log('L' + (i+1) + ' [b=' + braces + ' p=' + parens + '] ' + line.trim().slice(0, 80));
    }
}
