const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const iframeRequests = [];
  page.on('response', resp => {
    const url = resp.url();
    if (url.includes('crossdomain') || url.includes('crossprotocol') || url.includes('pokemonshowdown.com')) {
      iframeRequests.push(resp.status() + ' ' + url.substring(0, 150));
    }
  });

  await page.goto('https://2022149025.github.io/pokemonshowdown/', {
    waitUntil: 'networkidle0',
    timeout: 45000
  });
  await new Promise(r => setTimeout(r, 10000));

  const iframes = await page.evaluate(function() {
    var frames = document.querySelectorAll('iframe');
    return Array.from(frames).map(function(f) { return f.src; });
  });
  console.log('Iframes in DOM:', iframes);
  console.log('Iframe requests:', iframeRequests);

  const storageState = await page.evaluate(function() {
    return {
      whenPrefsLoaded: Storage.whenPrefsLoaded ? Storage.whenPrefsLoaded.isLoaded : 'N/A',
      crossOriginFrame: Storage.crossOriginFrame ? 'set' : 'null',
      origin: Storage.origin
    };
  });
  console.log('Storage state:', JSON.stringify(storageState, null, 2));

  await browser.close();
})();
