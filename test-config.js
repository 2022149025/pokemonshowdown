const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const consoleMessages = [];
  page.on('console', msg => consoleMessages.push(msg.type() + ': ' + msg.text()));
  page.on('pageerror', err => consoleMessages.push('PAGEERROR: ' + err.message));

  await page.goto('https://2022149025.github.io/pokemonshowdown/', {
    waitUntil: 'networkidle0',
    timeout: 45000
  });
  await new Promise(r => setTimeout(r, 10000));

  const config = await page.evaluate(function() {
    return {
      server: window.Config ? JSON.stringify(Config.server) : 'Config not found',
      defaultserver: window.Config ? JSON.stringify(Config.defaultserver) : 'N/A',
      appExists: typeof window.app !== 'undefined',
      appConnected: window.app ? app.connected : 'N/A',
      AppDefined: typeof App
    };
  });
  console.log('Config state:', JSON.stringify(config, null, 2));
  console.log('\nConsole errors:');
  consoleMessages.filter(function(m) { return m.startsWith('error') || m.startsWith('PAGEERROR'); })
    .forEach(function(m) { console.log(' ', m); });
  await browser.close();
})();
