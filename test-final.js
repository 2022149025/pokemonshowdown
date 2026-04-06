const puppeteer = require('puppeteer');
(async () => {
  // Wait for Pages to deploy
  await new Promise(r => setTimeout(r, 90000));

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const cdp = await page.createCDPSession();
  await cdp.send('Network.enable');
  const wsEvents = [];
  cdp.on('Network.webSocketCreated', e => wsEvents.push('WS Created: ' + e.url));
  cdp.on('Network.webSocketHandshakeResponseReceived', e => wsEvents.push('WS Handshake: ' + e.response.status));
  cdp.on('Network.webSocketFrameReceived', e => wsEvents.push('WS RX: ' + e.response.payloadData.substring(0, 80)));

  await page.goto('https://2022149025.github.io/pokemonshowdown/', {
    waitUntil: 'networkidle0',
    timeout: 45000
  });
  await new Promise(r => setTimeout(r, 12000));

  await page.screenshot({ path: '/tmp/ps-final.png' });

  const state = await page.evaluate(function() {
    return {
      hasSocket: !!app.socket,
      socketType: app.socket ? app.socket.constructor.name : 'none',
      prefsLoaded: Storage.whenPrefsLoaded.isLoaded,
      teamsLoaded: Storage.whenTeamsLoaded.isLoaded,
      serverHost: Config.server ? Config.server.host : 'none'
    };
  });

  console.log('WS Events:', wsEvents.slice(0, 5));
  console.log('State:', JSON.stringify(state, null, 2));
  await browser.close();
})();
