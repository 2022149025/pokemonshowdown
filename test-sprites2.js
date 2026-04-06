const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const failed404 = [];
  page.on('response', resp => {
    if (resp.status() === 404) failed404.push(resp.url().substring(0, 120));
  });

  await page.goto('https://2022149025.github.io/pokemonshowdown/', {
    waitUntil: 'networkidle0',
    timeout: 45000
  });
  await new Promise(r => setTimeout(r, 5000));

  // Click teambuilder button
  await page.evaluate(function() {
    var btns = document.querySelectorAll('button');
    for (var b of btns) {
      if (b.textContent.trim() === '팀빌더') { b.click(); break; }
    }
  });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: '/tmp/ps-teambuilder.png' });

  const resPrefix = await page.evaluate(function() {
    return {
      resourcePrefix: typeof Dex !== 'undefined' ? Dex.resourcePrefix : 'N/A',
      spritePrefix: typeof Dex !== 'undefined' && Dex.prefs ? Dex.prefs('nopastgens') : 'N/A'
    };
  });

  console.log('404s:', failed404.filter(u => !u.includes('.js')));
  console.log('Dex info:', resPrefix);
  await browser.close();
})();
