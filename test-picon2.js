const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const failed = [];
  page.on('response', resp => {
    if (resp.status() >= 400) failed.push(resp.status() + ' ' + resp.url().substring(0, 100));
  });

  await page.goto('https://2022149025.github.io/pokemonshowdown/', {
    waitUntil: 'networkidle0', timeout: 45000
  });
  await new Promise(r => setTimeout(r, 8000));

  // Click teambuilder
  await page.evaluate(function() {
    var btns = document.querySelectorAll('button');
    for (var b of btns) {
      if (b.textContent.trim().includes('빌더') || b.textContent.trim().includes('builder')) {
        b.click(); break;
      }
    }
  });
  await new Promise(r => setTimeout(r, 3000));

  // Check for picon elements and their styles
  const piconInfo = await page.evaluate(function() {
    var picons = document.querySelectorAll('.picon');
    if (!picons.length) return { count: 0 };
    var first = picons[0];
    return {
      count: picons.length,
      firstClass: first.className,
      firstStyle: first.getAttribute('style'),
      firstComputedBg: window.getComputedStyle(first).backgroundImage,
      innerHTML: first.innerHTML.substring(0, 100)
    };
  });
  console.log('Picon info:', JSON.stringify(piconInfo, null, 2));

  // Check what data/pokedex-mini.js defines
  const miniData = await page.evaluate(function() {
    return {
      hasBattlePokedexMini: typeof window.BattlePokedexMini !== 'undefined',
      hasTeambuilderTable: typeof window.BattleTeambuilderTable !== 'undefined',
      miniType: typeof window.BattlePokedexMini
    };
  });
  console.log('Mini data:', JSON.stringify(miniData, null, 2));

  console.log('Failures:', failed.filter(u => !u.includes('.js')));
  await browser.close();
})();
