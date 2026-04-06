/**
 * Puppeteer test: verify Darkrai sprite shows correctly in Korean teambuilder
 */
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();

  // Capture console output from the page
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    const prefix = type === 'error' ? '[PAGE ERROR]' : '[PAGE LOG]';
    console.log(`${prefix} ${text}`);
  });

  page.on('pageerror', err => {
    console.log('[PAGE EXCEPTION]', err.message);
  });

  console.log('Opening http://localhost:8080/testclient-ko.html ...');
  await page.goto('http://localhost:8080/testclient-ko.html', { waitUntil: 'networkidle2', timeout: 30000 });

  // Wait for app to initialize
  await new Promise(r => setTimeout(r, 4000));

  // === Test 1: Check applyTranslations result ===
  const pokedexCheck = await page.evaluate(() => {
    const entry = window.BattlePokedex && window.BattlePokedex['darkrai'];
    if (!entry) return { error: 'BattlePokedex not loaded' };
    return {
      name: entry.name,
      baseSpecies: entry.baseSpecies,
      spriteid: entry.spriteid,
    };
  });
  console.log('\n=== Test 1: BattlePokedex["darkrai"] after applyTranslations ===');
  console.log(JSON.stringify(pokedexCheck, null, 2));

  // === Test 2: Check Dex.species.get("darkrai") ===
  const speciesCheck = await page.evaluate(() => {
    if (!window.Dex) return { error: 'Dex not loaded' };
    try {
      const sp = window.Dex.species.get('darkrai');
      return { name: sp.name, spriteid: sp.spriteid, exists: sp.exists, baseSpecies: sp.baseSpecies };
    } catch (e) {
      return { error: e.message };
    }
  });
  console.log('\n=== Test 2: Dex.species.get("darkrai") ===');
  console.log(JSON.stringify(speciesCheck, null, 2));

  // === Test 3: Check Dex.species.get("다크라이") ===
  const speciesKoCheck = await page.evaluate(() => {
    if (!window.Dex) return { error: 'Dex not loaded' };
    try {
      const sp = window.Dex.species.get('다크라이');
      return { name: sp.name, spriteid: sp.spriteid, exists: sp.exists };
    } catch (e) {
      return { error: e.message };
    }
  });
  console.log('\n=== Test 3: Dex.species.get("다크라이") ===');
  console.log(JSON.stringify(speciesKoCheck, null, 2));

  // === Test 4: Check getTeambuilderSprite with Korean name ===
  const spriteCheck = await page.evaluate(() => {
    if (!window.Dex) return { error: 'Dex not loaded' };
    try {
      const result1 = window.Dex.getTeambuilderSprite({ species: '다크라이', name: '' });
      const result2 = window.Dex.getTeambuilderSprite({ species: 'darkrai', name: '' });
      const result3 = window.Dex.getTeambuilderSprite('다크라이');
      return {
        koreanSpecies: result1,
        englishSpecies: result2,
        koreanString: result3,
      };
    } catch (e) {
      return { error: e.message };
    }
  });
  console.log('\n=== Test 4: getTeambuilderSprite results ===');
  console.log(JSON.stringify(spriteCheck, null, 2));

  // === Test 5: Check korToEngPokemon is accessible (via BattleAliases) ===
  const aliasCheck = await page.evaluate(() => {
    const ba = window.BattleAliases;
    if (!ba) return { error: 'BattleAliases not loaded' };
    return {
      '다크라이_alias': ba['다크라이'],
      '드래곤나이트_alias': ba['드래곤나이트'],
    };
  });
  console.log('\n=== Test 5: BattleAliases Korean entries ===');
  console.log(JSON.stringify(aliasCheck, null, 2));

  // === Test 6: Simulate setPokemon with Korean name ===
  const setPokeCheck = await page.evaluate(() => {
    if (!window.TeambuilderRoom) return { error: 'TeambuilderRoom not available yet' };
    // Check if setPokemon is patched by looking at its source
    const src = window.TeambuilderRoom.prototype.setPokemon.toString().slice(0, 200);
    return { patchedFn: src };
  });
  console.log('\n=== Test 6: setPokemon function (first 200 chars) ===');
  console.log(JSON.stringify(setPokeCheck, null, 2));

  console.log('\n=== Done. Browser stays open for manual inspection. ===');
  // Keep browser open for manual DevTools inspection
  // await browser.close();
})();
