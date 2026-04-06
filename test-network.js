const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const networkLog = [];
  page.on('response', resp => {
    const url = resp.url();
    if (url.includes('psim.us') || url.includes('sim3') || url.includes('sockjs')) {
      networkLog.push(resp.status() + ' ' + url.substring(0, 100));
    }
  });
  page.on('requestfailed', req => {
    const url = req.url();
    if (url.includes('psim.us') || url.includes('sim3') || url.includes('sockjs')) {
      networkLog.push('FAIL ' + req.failure().errorText + ' ' + url.substring(0, 100));
    }
  });

  await page.goto('https://2022149025.github.io/pokemonshowdown/', {
    waitUntil: 'networkidle0',
    timeout: 45000
  });
  await new Promise(r => setTimeout(r, 15000));

  console.log('Network to psim/sim3:', networkLog);

  const socketState = await page.evaluate(function() {
    return {
      hasSocket: typeof app !== 'undefined' && !!app.socket,
      socketType: typeof app !== 'undefined' && app.socket ? app.socket.constructor.name : 'none',
      down: typeof app !== 'undefined' ? app.down : 'N/A',
      configServer: Config ? Config.server.host : 'none',
      connected: typeof app !== 'undefined' ? app.connected : 'N/A'
    };
  });
  console.log('Socket state:', JSON.stringify(socketState, null, 2));

  await browser.close();
})();
