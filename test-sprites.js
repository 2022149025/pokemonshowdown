const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const failed404 = [];
  const spriteRequests = [];

  page.on('response', resp => {
    const url = resp.url();
    if (url.includes('sprite') || url.includes('pokemon-mini') || url.includes('.png') || url.includes('.gif')) {
      spriteRequests.push(resp.status() + ' ' + url.substring(0, 120));
      if (resp.status() === 404) failed404.push(url.substring(0, 120));
    }
  });

  await page.goto('https://2022149025.github.io/pokemonshowdown/', {
    waitUntil: 'networkidle0',
    timeout: 45000
  });
  await new Promise(r => setTimeout(r, 5000));

  // Navigate to teambuilder
  await page.evaluate(function() {
    app.loadRoom('teambuilder');
  });
  await new Promise(r => setTimeout(r, 5000));

  await page.screenshot({ path: '/tmp/ps-teambuilder.png' });

  console.log('=== Sprite/Image 404s ===');
  failed404.forEach(u => console.log(' ', u));

  // Check the CSS for mini sprites
  const spriteCSS = await page.evaluate(function() {
    var sheets = document.styleSheets;
    for (var i = 0; i < sheets.length; i++) {
      try {
        var rules = sheets[i].cssRules;
        if (rules && rules.length > 0) {
          var first = rules[0].cssText || '';
          if (first.includes('pokemon-mini') || first.includes('sprite')) {
            return { sheet: sheets[i].href, firstRule: first.substring(0, 200) };
          }
        }
      } catch(e) {}
    }
    return null;
  });
  console.log('Sprite CSS:', spriteCSS);

  // Check resourcePrefix
  const resPrefix = await page.evaluate(function() {
    return typeof Dex !== 'undefined' ? Dex.resourcePrefix : 'Dex not found';
  });
  console.log('Dex.resourcePrefix:', resPrefix);

  await browser.close();
})();
