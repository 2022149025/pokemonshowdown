const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const requests404 = [];
  const fallbackLoads = [];

  page.on('response', resp => {
    if (resp.status() === 404) requests404.push(resp.url());
    if (resp.url().includes('play.pokemonshowdown.com/data/') ||
        resp.url().includes('play.pokemonshowdown.com/js/')) {
      fallbackLoads.push(resp.url() + ' -> ' + resp.status());
    }
  });

  await page.goto('https://2022149025.github.io/pokemonshowdown/', {
    waitUntil: 'networkidle0',
    timeout: 45000
  });

  // Wait for app to fully load
  await new Promise(r => setTimeout(r, 8000));

  // Take screenshot
  await page.screenshot({ path: '/tmp/ps-test.png', fullPage: false });

  // Check key UI elements
  const mainmenu = await page.$eval('#mainmenu', el => el.innerHTML.substring(0, 200)).catch(() => 'not found');
  const formatSelect = await page.$eval('select[name=format]', el => ({
    options: el.options.length,
    value: el.value
  })).catch(() => 'not found');

  console.log('=== Fallback loads from PS server ===');
  fallbackLoads.slice(0, 10).forEach(u => console.log(' ', u));
  console.log('  (total:', fallbackLoads.length, ')');

  console.log('\n=== Still 404 (not fixed by fallback) ===');
  const stillBad = requests404.filter(u => !u.includes('play.pokemonshowdown.com'));
  stillBad.forEach(u => console.log(' 404:', u));

  console.log('\n=== UI State ===');
  console.log('Format select:', JSON.stringify(formatSelect));
  console.log('mainmenu excerpt:', mainmenu.substring(0, 150));

  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
})();
