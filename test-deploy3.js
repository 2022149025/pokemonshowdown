const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  await page.goto('https://2022149025.github.io/pokemonshowdown/', {
    waitUntil: 'networkidle0',
    timeout: 45000
  });

  // Wait for server connection
  await new Promise(r => setTimeout(r, 12000));

  await page.screenshot({ path: '/tmp/ps-test2.png' });

  // Check all select elements
  const selects = await page.$$eval('select', els => els.map(el => ({
    name: el.name || el.id,
    options: el.options.length,
    firstOption: el.options[0]?.text
  })));
  console.log('Selects:', JSON.stringify(selects, null, 2));

  // Check button states
  const buttons = await page.$$eval('button, .button', els =>
    els.slice(0, 10).map(el => el.textContent.trim())
  );
  console.log('Buttons:', buttons);

  // Check connect status
  const statusText = await page.evaluate(() => {
    const el = document.querySelector('.statusbar, .mainmessage, [class*="status"]');
    return el ? el.textContent : 'not found';
  });
  console.log('Status:', statusText);

  await browser.close();
})();
