const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const logs = [];
  page.on('console', msg => logs.push(msg.type() + ': ' + msg.text()));
  page.on('pageerror', err => logs.push('PAGEERROR: ' + err.message));

  await page.goto('https://2022149025.github.io/pokemonshowdown/', {
    waitUntil: 'networkidle0',
    timeout: 45000
  });
  await new Promise(r => setTimeout(r, 10000));

  const state = await page.evaluate(function() {
    if (typeof app === 'undefined') return { error: 'app undefined' };
    return {
      down: app.down,
      isDisconnected: app.isDisconnected,
      connected: app.connected,
      socket: app.socket ? app.socket.constructor.name : null,
      rooms: Object.keys(app.rooms || {}),
      configServer: Config.server ? Config.server.host : null,
      storageLoaded: typeof Storage !== 'undefined' ? Storage.prefsLoaded : 'N/A'
    };
  });
  console.log('App state:', JSON.stringify(state, null, 2));

  // Check for any console errors (non-404)
  const realErrors = logs.filter(function(l) {
    return (l.startsWith('error') || l.startsWith('PAGEERROR')) && !l.includes('404');
  });
  console.log('Real errors:', realErrors);
  await browser.close();
})();
