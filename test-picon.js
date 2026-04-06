const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  await page.goto('https://2022149025.github.io/pokemonshowdown/', {
    waitUntil: 'networkidle0', timeout: 45000
  });
  await new Promise(r => setTimeout(r, 8000));

  // Check if BattlePokedex is loaded and how picons work
  const info = await page.evaluate(function() {
    // Check BattlePokedex
    var pdex = window.BattlePokedex;
    var bulbasaur = pdex ? pdex['bulbasaur'] : null;

    // Check injected picon CSS
    var piconCSS = null;
    var sheets = document.styleSheets;
    for (var i = 0; i < sheets.length; i++) {
      try {
        var rules = sheets[i].cssRules || sheets[i].rules;
        for (var j = 0; j < rules.length; j++) {
          var rule = rules[j];
          if (rule.selectorText && rule.selectorText.includes('picon-')) {
            piconCSS = { selector: rule.selectorText, style: rule.style.cssText };
            break;
          }
        }
        if (piconCSS) break;
      } catch(e) {}
    }

    // Check .picon base style
    var piconBase = null;
    for (var i = 0; i < sheets.length; i++) {
      try {
        var rules = sheets[i].cssRules || sheets[i].rules;
        for (var j = 0; j < rules.length; j++) {
          var rule = rules[j];
          if (rule.selectorText === '.picon') {
            piconBase = rule.style.cssText;
            break;
          }
        }
        if (piconBase) break;
      } catch(e) {}
    }

    return {
      bulbasaur: bulbasaur ? { name: bulbasaur.name, spriteid: bulbasaur.spriteid } : null,
      piconCSS: piconCSS,
      piconBase: piconBase,
      BattlePokedexLoaded: !!pdex,
      pokedexSize: pdex ? Object.keys(pdex).length : 0
    };
  });

  console.log('Info:', JSON.stringify(info, null, 2));
  await browser.close();
})();
