// Syntax check ko-translation.js
var fs = require('fs');
var path = 'play.pokemonshowdown.com/js/ko-translation.js';
var c = fs.readFileSync(path, 'utf8');

// Check for backslash-exclamation
var count = 0;
for (var i = 0; i < c.length; i++) {
    var ch = c.charCodeAt(i);
    var next = c.charCodeAt(i+1);
    if (ch === 92 && next === 33) { // backslash=92, exclamation=33
        count++;
        console.log('\\! at char', i, 'context:', JSON.stringify(c.slice(Math.max(0,i-20), i+20)));
    }
}
console.log('Total \\! occurrences:', count);

// Try to parse
try {
    new Function(c);
    console.log('Syntax: OK');
} catch(e) {
    console.log('SYNTAX ERROR:', e.message);
}

// Check key functions exist
var checks = ['DexSearch._koFindPatch', 'Dex._koHasAbilityPatch', 'window._KoData', 'patchWhenReady'];
checks.forEach(function(s) {
    console.log(s, ':', c.includes(s) ? 'present' : 'MISSING');
});
