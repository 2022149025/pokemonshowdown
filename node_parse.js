// Try to actually parse the JS file using node's module system
var fs = require('fs');
var vm = require('vm');

var c = fs.readFileSync('js/ko-translation.js', 'utf8');

try {
    // Use Script to parse (doesn't execute)
    var script = new vm.Script(c, {filename: 'ko-translation.js'});
    console.log('Parse: SUCCESS');
} catch(e) {
    console.log('Parse ERROR:', e.message);
    // Try to find the line
    var match = e.message.match(/(\d+)/);
    if (match) {
        var lineNum = parseInt(match[1]);
        var lines = c.split('\n');
        for (var i = Math.max(0, lineNum-3); i < Math.min(lines.length, lineNum+2); i++) {
            console.log('  L' + (i+1) + ': ' + lines[i]);
        }
    }
}
