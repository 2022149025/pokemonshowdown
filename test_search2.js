// Test _KoData and find logic without loading ko-desc.js (just test logic)

// Simulate what ko-desc.js would set
// Instead, manually load the koAbilities data to test
var fs = require('fs');
var c = fs.readFileSync('js/ko-desc.js', 'utf8');

// Extract koAbilities - find the section
var startIdx = c.indexOf('var koAbilities = {');
var endIdx = c.indexOf(';\n\n    var applyDescs', startIdx);
if (endIdx === -1) endIdx = c.indexOf(';\n    var applyDescs', startIdx);
console.log('koAbilities found:', startIdx !== -1, 'start:', startIdx, 'end:', endIdx);

// Just check that '천진' and '기겁' are in the koAbilities data
var koAbilSection = c.slice(startIdx, endIdx + 1);
console.log('Contains 천진:', koAbilSection.includes('"천진"'));
console.log('Contains 기겁:', koAbilSection.includes('"기겁"'));
console.log('Contains unaware:', koAbilSection.includes('"unaware"'));

// Check where '천진' appears
var idx = c.indexOf('"천진"');
while (idx !== -1 && idx < startIdx) idx = c.indexOf('"천진"', idx + 1);
if (idx !== -1 && idx < endIdx) {
    // Find the ability ID
    var before = c.lastIndexOf('"', idx - 3);
    var abilId = c.slice(before + 1, idx - 3);
    console.log('천진 ability ID:', abilId);
}

// Check where '기겁' (unaware Korean name) appears
var idx2 = c.indexOf('"기겁"');
if (idx2 !== -1) {
    var before2 = c.lastIndexOf('"', idx2 - 3);
    var abilId2 = c.slice(before2 + 1, idx2 - 3);
    console.log('기겁 ability:', abilId2.slice(-20));
}

// Now test the find logic by evaluating a minimal subset
var koAbilTest = {};
// eval the koAbilities section
try {
    eval('koAbilTest = ' + koAbilSection.replace('var koAbilities = ', ''));
    var q = '천진';
    var rows = [];
    for (var id in koAbilTest) {
        var name = koAbilTest[id] && koAbilTest[id].name;
        if (name && name.includes(q)) rows.push([id, name]);
    }
    console.log('\nSearch results for 천진:', rows);

    q = '천';
    rows = [];
    for (var id in koAbilTest) {
        var name = koAbilTest[id] && koAbilTest[id].name;
        if (name && name.includes(q)) rows.push([id, name]);
    }
    console.log('Search results for 천 (first 5):', rows.slice(0, 5));
} catch(e) {
    console.log('Error evaluating koAbilities:', e.message.slice(0, 100));
}
