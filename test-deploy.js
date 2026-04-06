const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const errors = [];
  const requests404 = [];

  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  page.on('response', resp => {
    if (resp.status() === 404) {
      requests404.push(resp.url());
    }
  });

  console.log('Navigating...');
  await page.goto('https://2022149025.github.io/pokemonshowdown/', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  await new Promise(r => setTimeout(r, 5000));

  const title = await page.title();
  console.log('Title:', title);

  const loadingMsg = await page.$eval('#loading-message', el => el.textContent).catch(() => 'not found');
  console.log('Loading message:', loadingMsg);

  console.log('\n=== 404 errors ===');
  requests404.forEach(u => console.log(' 404:', u));

  console.log('\n=== JS Console Errors ===');
  errors.forEach(e => console.log(' ERR:', e));

  const colorsOk = requests404.filter(u => u.includes('colors.json') || u.includes('coil.json'));
  if (colorsOk.length === 0) {
    console.log('\ncolors.json/coil.json: OK');
  } else {
    console.log('\nSTILL 404:', colorsOk);
  }

  await browser.close();
})();
