var fs = require('fs');

function checkFile(path) {
    var c = fs.readFileSync(path, 'utf8');
    var braces = 0, parens = 0;
    var inString = false, strChar = '', inLineComment = false, inBlockComment = false;
    var lines = c.split('\n');

    // Track brace balance by line
    var lineBalance = []; // [lineNum, braces, parens, char]

    for (var i = 0; i < c.length; i++) {
        var ch = c[i];
        if (inLineComment) { if (ch === '\n') inLineComment = false; continue; }
        if (inBlockComment) { if (ch === '*' && c[i+1] === '/') { inBlockComment = false; i++; } continue; }
        if (inString) {
            if (ch === '\\') { i++; continue; }
            if (ch === strChar) inString = false;
            continue;
        }
        if (ch === '/' && c[i+1] === '/') { inLineComment = true; continue; }
        if (ch === '/' && c[i+1] === '*') { inBlockComment = true; i++; continue; }
        if (ch === '"' || ch === "'" || ch === '`') { inString = true; strChar = ch; continue; }
        if (ch === '{') braces++;
        else if (ch === '}') { braces--; }
        else if (ch === '(') parens++;
        else if (ch === ')') { parens--; }
    }

    var lineNum = c.slice(0, c.length).split('\n').length;
    console.log(path + ': braces=' + braces + ' parens=' + parens);

    // Find where imbalance starts - scan from end
    braces = 0; parens = 0; inString = false; inLineComment = false; inBlockComment = false;
    var checkPoints = [];
    var lineIdx = 0;
    var col = 0;
    for (var i = 0; i < c.length; i++) {
        var ch = c[i];
        if (ch === '\n') { lineIdx++; col = 0; continue; }
        col++;
        if (inLineComment) { continue; }
        if (inBlockComment) { if (ch === '*' && c[i+1] === '/') { inBlockComment = false; i++; } continue; }
        if (inString) {
            if (ch === '\\') { i++; continue; }
            if (ch === strChar) inString = false;
            continue;
        }
        if (ch === '/' && c[i+1] === '/') { inLineComment = true; continue; }
        if (ch === '/' && c[i+1] === '*') { inBlockComment = true; i++; continue; }
        if (ch === '"' || ch === "'" || ch === '`') { inString = true; strChar = ch; continue; }
        if (ch === '{') { braces++; checkPoints.push([lineIdx+1, braces, parens, '{']); }
        else if (ch === '}') { braces--; checkPoints.push([lineIdx+1, braces, parens, '}']); }
        else if (ch === '(') { parens++; checkPoints.push([lineIdx+1, braces, parens, '(']); }
        else if (ch === ')') { parens--; checkPoints.push([lineIdx+1, braces, parens, ')']); }
    }

    // Find last point where braces/parens were at 0 then went up
    var lastZeroBrace = 0, lastZeroParen = 0;
    for (var j = 0; j < checkPoints.length; j++) {
        var cp = checkPoints[j];
        if (cp[1] === 0 && cp[3] === '}') lastZeroBrace = cp[0];
        if (cp[2] === 0 && cp[3] === ')') lastZeroParen = cp[0];
        if (cp[1] === 1 && cp[3] === '{') lastZeroBrace = cp[0]; // re-opened after zero
        if (cp[2] === 1 && cp[3] === '(') lastZeroParen = cp[0];
    }

    // Show lines around the imbalance
    console.log('Lines around possible unclosed brace (last opened):', lastZeroBrace);
    for (var l = Math.max(0, lastZeroBrace-2); l < Math.min(lines.length, lastZeroBrace+3); l++) {
        console.log('  ' + (l+1) + ': ' + lines[l]);
    }
}

checkFile('js/ko-translation.js');
console.log('---');
checkFile('play.pokemonshowdown.com/js/ko-translation.js');
