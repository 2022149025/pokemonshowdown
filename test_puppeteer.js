const puppeteer = require('puppeteer');
(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('http://localhost:8081/testclient-ko.html');
        await page.waitForSelector('button[value="teambuilder"]');
        await page.click('button[value="teambuilder"]');
        await page.waitForSelector('button[name="newTop"]');
        await page.click('button[name="newTop"]');
        await page.waitForSelector('button[name="addPokemon"]');
        await page.click('button[name="addPokemon"]');
        await page.waitForSelector('input[name="pokemon"]');
        await page.type('input[name="pokemon"]', '망나뇽');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
        const html = await page.evaluate(() => document.querySelector('.setchart').outerHTML);
        console.log("HTML:", html);
        await browser.close();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
