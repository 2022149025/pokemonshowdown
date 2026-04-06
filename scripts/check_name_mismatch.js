const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// ko-desc.js에서 id → 한글명 추출
const koDescContent = fs.readFileSync(path.join(ROOT, 'js/ko-desc.js'), 'utf8');
const nameMap = {};
// "someid": { "name": "한글명" } 패턴 - 중괄호 내에 다른 key가 올 수 있으므로 느슨하게
const re1 = /"([a-z0-9]+)":\s*\{[^{}]*?"name":\s*"([^"]+)"/gs;
let m;
while ((m = re1.exec(koDescContent)) !== null) {
    if (!nameMap[m[1]]) nameMap[m[1]] = m[2];
}
console.log('추출된 한글명 수:', Object.keys(nameMap).length);
// 샘플
['leechseed','lightscreen','safeguard','spikes','stealthrock','substitute','taunt','reflect'].forEach(k => {
    console.log(' ', k, '->', nameMap[k]);
});

const koJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ko_battle_text.json'), 'utf8'));
const textJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/text.json'), 'utf8'));

// 각 섹션에서 불일치 확인
const mismatches = [];
for (const section of Object.keys(koJson)) {
    const koName = nameMap[section];
    if (!koName) continue;
    const msgs = koJson[section];
    const enMsgs = textJson[section] || {};
    for (const key of Object.keys(msgs)) {
        const koText = msgs[key];
        const enText = enMsgs[key] || '';
        if (typeof koText !== 'string' || koText.startsWith('#')) continue;
        if (key.startsWith('desc') || key.startsWith('short')) continue;
        // 영어 텍스트에 섹션ID가 포함되면 → 하드코딩된 이름
        const enLower = enText.toLowerCase();
        if (enLower.includes(section) && section.length > 4) {
            if (!koText.includes(koName)) {
                mismatches.push({ section, key, koName, enText: enText.trim(), koText: koText.trim() });
            }
        }
    }
}

console.log('\n불일치 케이스:', mismatches.length);
mismatches.forEach(c => {
    console.log(`\n[${c.section}] ${c.key} (올바른명: ${c.koName})`);
    console.log('  EN:', c.enText);
    console.log('  KO:', c.koText);
});
