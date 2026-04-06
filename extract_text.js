const fs = require('fs');
const https = require('https');

https.get('https://play.pokemonshowdown.com/data/text.js', (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            // The file is of the form `exports.BattleText = { ... };`
            // Instead of parsing it via regex which is extremely fragile,
            // we can evaluate it in a safe context.
            const script = rawData.replace('exports.BattleText =', 'module.exports =');
            fs.writeFileSync('temp_text.js', script);
            const textObj = require('./temp_text.js');
            fs.writeFileSync('data/text.json', JSON.stringify(textObj, null, 2));
            console.log('Successfully extracted text.js to data/text.json');
        } catch (e) {
            console.error(e.message);
        }
    });
});
