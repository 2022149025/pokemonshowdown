const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Intercept WebSocket and console
  const wsEvents = [];
  const jsErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') jsErrors.push(msg.text());
    if (msg.text().includes('connect') || msg.text().includes('socket') ||
        msg.text().includes('server') || msg.text().includes('서버')) {
      jsErrors.push('[INFO] ' + msg.text());
    }
  });

  // Monitor CDP for WebSocket frames
  const cdp = await page.createCDPSession();
  await cdp.send('Network.enable');
  cdp.on('Network.webSocketCreated', e => wsEvents.push('WS Created: ' + e.url));
  cdp.on('Network.webSocketHandshakeResponseReceived', e =>
    wsEvents.push('WS Handshake OK: ' + e.response?.status));
  cdp.on('Network.webSocketFrameReceived', e =>
    wsEvents.push('WS Frame: ' + e.response?.payloadData?.substring(0, 100)));
  cdp.on('Network.webSocketClosed', e => wsEvents.push('WS Closed'));
  cdp.on('Network.webSocketFrameError', e => wsEvents.push('WS Error: ' + e.errorMessage));

  await page.goto('https://2022149025.github.io/pokemonshowdown/', {
    waitUntil: 'networkidle0',
    timeout: 45000
  });

  await new Promise(r => setTimeout(r, 15000));

  console.log('=== WebSocket Events ===');
  wsEvents.forEach(e => console.log(' ', e));

  console.log('\n=== JS Errors/Info ===');
  jsErrors.forEach(e => console.log(' ', e));

  // Check client state via JS
  const appState = await page.evaluate(() => {
    if (!window.app) return 'app not initialized';
    return {
      connected: app.connected,
      serverConnected: app.serverConnected,
      server: app.server ? (app.server.host + ':' + app.server.port) : 'none'
    };
  });
  console.log('\n=== App State ===');
  console.log(JSON.stringify(appState, null, 2));

  await browser.close();
})();
