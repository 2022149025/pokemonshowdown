/**
 * Test 2: verify species/ability/moves lookups work with Korean names
 */
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false, devtools: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[ERR]', msg.text());
  });

  await page.goto('http://localhost:8080/testclient-ko.html', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 4000));

  const results = await page.evaluate(() => {
    const out = {};

    // 1. Dex.species.get with Korean
    try {
      const sp = window.Dex.species.get('망나뇽');
      out.dragonite_species = { name: sp.name, spriteid: sp.spriteid, exists: sp.exists, types: sp.types, abilities: sp.abilities };
    } catch(e) { out.dragonite_species = { error: e.message }; }

    // 2. Dex.abilities.get with Korean
    try {
      const ab = window.Dex.abilities.get('날카로운눈');
      out.innerfocus_ability = { name: ab.name, exists: ab.exists, desc: ab.shortDesc };
    } catch(e) { out.innerfocus_ability = { error: e.message }; }

    // 3. Dex.moves.get with Korean
    try {
      const mv = window.Dex.moves.get('용의춤');
      out.dragondance_move = { name: mv.name, exists: mv.exists, type: mv.type };
    } catch(e) { out.dragondance_move = { error: e.message }; }

    // 4. koPokemon map check (to verify renderSet can use it directly)
    out.renderSet_reliability = {
      koAbilities_innerfocus: typeof koAbilities !== 'undefined' ? 'accessible_global' : 'not_accessible',
      note: 'koAbilities is inside IIFE so not global - renderSet hook accesses via closure'
    };

    // 5. Check BattleAbilities translation status
    if (window.BattleAbilities && window.BattleAbilities['innerfocus']) {
      out.battleabilities_translated = window.BattleAbilities['innerfocus'].name;
    } else {
      out.battleabilities_translated = 'BattleAbilities not loaded or innerfocus missing';
    }

    // 6. Simulate renderSet scenario: species="망나뇽", ability="Inner Focus"
    // After patch, Dex.species.get("망나뇽") should return Dragonite with correct data
    try {
      const sp2 = window.Dex.species.get('망나뇽');
      out.renderSet_species_lookup = {
        name: sp2.name,
        types: sp2.types,
        abilities: sp2.abilities,
        exists: sp2.exists,
        teraType_would_be: sp2.types ? sp2.types[0] : '???'
      };
    } catch(e) { out.renderSet_species_lookup = { error: e.message }; }

    return out;
  });

  console.log('\n=== Test Results ===');
  console.log(JSON.stringify(results, null, 2));
  console.log('\n=== Browser open for manual testing ===');
})();
