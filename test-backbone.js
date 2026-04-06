const puppeteer = require('puppeteer');
(async () => {
  await new Promise(r => setTimeout(r, 90000));

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const popups = [];
  page.on('console', msg => {
    if (msg.text().includes('does not exist') || msg.text().includes('popup') || msg.type() === 'warning') {
      popups.push(msg.text());
    }
  });

  await page.goto('https://2022149025.github.io/pokemonshowdown/', {
    waitUntil: 'networkidle0',
    timeout: 45000
  });
  await new Promise(r => setTimeout(r, 10000));

  await page.screenshot({ path: '/tmp/ps-backbone.png' });

  // Check for popup dialogs in DOM
  const popupEls = await page.$$eval('.ps-popup, .popup, [class*="popup"]', els =>
    els.map(el => el.textContent.trim().substring(0, 100))
  );

  const cdp = await page.createCDPSession();
  await cdp.send('Network.enable');

  console.log('DOM Popups:', popupEls);
  console.log('Console warnings:', popups);

  const state = await page.evaluate(function() {
    return {
      connected: !!app.socket,
      historyRoot: Backbone.history.options ? Backbone.history.options.root : 'N/A',
      currentFragment: Backbone.history.fragment
    };
  });
  console.log('State:', JSON.stringify(state, null, 2));

  await browser.close();
})();
