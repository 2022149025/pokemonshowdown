var fs = require('fs');
var vm = require('vm');

function check(path) {
    try {
        var c = fs.readFileSync(path, 'utf8');
        new vm.Script(c, {filename: path});
        console.log('OK:', path);
    } catch(e) {
        console.log('ERROR in', path + ':', e.message);
    }
}

check('play.pokemonshowdown.com/js/ko-desc.js');
check('play.pokemonshowdown.com/js/ko-translation.js');
check('play.pokemonshowdown.com/js/battle-dex.js');
check('play.pokemonshowdown.com/js/battle-dex-search.js');
