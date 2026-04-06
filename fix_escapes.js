var fs = require('fs');
var c = fs.readFileSync('js/ko-translation.js', 'utf8');
// Count and replace \! with ! (backslash-exclamation in source code is a syntax bug)
var count = 0;
var fixed = c.split('\\!').join(function() { return '!'; });
// Manual approach
var result = '';
for (var i = 0; i < c.length; i++) {
    if (c[i] === '\\' && c[i+1] === '!') {
        result += '!';
        i++; // skip !
        count++;
    } else {
        result += c[i];
    }
}
console.log('Replaced', count, 'occurrences of \\! with !');
fs.writeFileSync('js/ko-translation.js', result, 'utf8');
console.log('Done.');
