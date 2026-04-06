var fs = require('fs');

function fixFile(path) {
    var c = fs.readFileSync(path, 'utf8');
    var result = '';
    var count = 0;
    for (var i = 0; i < c.length; i++) {
        if (c[i] === '\\' && c[i+1] === '!') {
            result += '!';
            i++;
            count++;
        } else {
            result += c[i];
        }
    }
    if (count > 0) {
        fs.writeFileSync(path, result, 'utf8');
        console.log(path + ': replaced ' + count + ' \\! with !');
    } else {
        console.log(path + ': no \\! found');
    }
}

fixFile('js/ko-translation.js');
fixFile('play.pokemonshowdown.com/js/ko-translation.js');
