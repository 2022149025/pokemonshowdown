const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const cdp = await page.createCDPSession();
  await cdp.send('Network.enable');
  const wsEvents = [];
  cdp.on('Network.webSocketCreated', e => wsEvents.push('Created: ' + e.url));
  cdp.on('Network.webSocketHandshakeResponseReceived', e => wsEvents.push('Handshake: ' + e.response.status));
  cdp.on('Network.webSocketClosed', e => wsEvents.push('Closed at: ' + e.timestamp));
  cdp.on('Network.webSocketFrameError', e => wsEvents.push('WS Error: ' + e.errorMessage));
  cdp.on('Network.webSocketFrameReceived', e => {
    const data = e.response.payloadData;
    wsEvents.push('RX: ' + data.substring(0, 100));
  });

  await page.goto('https://2022149025.github.io/pokemonshowdown/', {
    waitUntil: 'networkidle0',
    timeout: 45000
  });
  await new Promise(r => setTimeout(r, 15000));

  await page.screenshot({ path: '/tmp/ps-test4.png' });

  const appInfo = await page.evaluate(function() {
    if (!window.app) return { error: 'no app' };
    var sock = app.socket || app.conn;
    return {
      serverHost: app.server ? app.server.host : 'none',
      socketExists: typeof sock !== 'undefined',
      socketType: sock ? sock.constructor.name : 'none',
      socketState: sock ? sock.readyState : 'none',
      connected: app.connected,
      isGuest: app.user ? app.user.get('guest') : 'N/A'
    };
  });
  console.log('App info:', JSON.stringify(appInfo, null, 2));
  console.log('WS Events:', wsEvents);

  await browser.close();
})();
