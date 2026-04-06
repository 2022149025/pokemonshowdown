// Simulate the Korean search logic in Node.js to verify it works

// Mock window/global environment
global.window = global;
global.BattlePokedex = {};
global.BattleAbilities = {};
global.BattleAliases = {};
global.toID = function(s) { return s ? s.toLowerCase().replace(/[^a-z0-9]+/g, '') : ''; };

// Load ko-desc.js to set up _KoData
console.log('Loading ko-desc.js...');
require('./js/ko-desc.js');
console.log('_KoData set:', !!global._KoData);
console.log('_KoData.abilities type:', typeof global._KoData.abilities);

// Check if '천진' is in koAbilities
var kd = global._KoData;
if (kd && kd.abilities) {
    var found = null;
    for (var id in kd.abilities) {
        if (kd.abilities[id] && kd.abilities[id].name === '천진') {
            found = id;
            break;
        }
    }
    console.log('천진 ability ID in _KoData:', found);

    // Check partial match for '천'
    var partials = [];
    for (var id in kd.abilities) {
        var name = kd.abilities[id] && kd.abilities[id].name;
        if (name && name.includes('천')) partials.push({id: id, name: name});
    }
    console.log('Abilities containing 천:', partials.slice(0, 5));
}

// Simulate find patch logic for '천진'
var q = '천진';
var KO_RE = /[가-힣ㄱ-ㆎㅏ-ㅣ]/;
console.log('\nKO_RE.test(q):', KO_RE.test(q));

var results = [];
if (kd && kd.abilities) {
    var abilRows = [];
    for (var abId in kd.abilities) {
        var abName = kd.abilities[abId] && kd.abilities[abId].name;
        if (!abName || !abName.includes(q)) continue;
        abilRows.push(['ability', abId, abName.indexOf(q), q.length]);
    }
    console.log('Ability rows for 천진:', abilRows);
    if (abilRows.length) {
        results.push(['header', '특성']);
        results = results.concat(abilRows);
    }
}
console.log('Results for 천진:', results);

// Check BattleAliases
console.log('\nBattleAliases 천진:', global.BattleAliases['천진']);
console.log('BattleAbilities unaware name:', global.BattleAbilities['unaware'] && global.BattleAbilities['unaware'].name);
