/**
 * ko_battle_text.json에서 잘못된 이름을 ko-desc.js 기준으로 수정
 * 각 섹션의 메시지에서 틀린 이름 → 올바른 한글명으로 치환
 */

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// ── 1. ko-desc.js에서 id → 한글명 추출 ─────────────────────────────
const koDescContent = fs.readFileSync(path.join(ROOT, 'js/ko-desc.js'), 'utf8');
const nameMap = {};
const re1 = /"([a-z0-9]+)":\s*\{[^{}]*?"name":\s*"([^"]+)"/gs;
let m;
while ((m = re1.exec(koDescContent)) !== null) {
    if (!nameMap[m[1]]) nameMap[m[1]] = m[2];
}

// ── 2. 수정 규칙: { 섹션ID: { 잘못된표현: null(nameMap에서 자동), ... } } ──
// null이면 nameMap[section]으로 대체
// 문자열이면 해당 문자열로 대체
const fixRules = {
    // 영문 스펠링 그대로 쓰인 경우
    'encore':         { '앵콜': null },          // 앙코르
    'torment':        { '괴롭히기': null },       // 트집
    'teatime':        { '티타임': null },         // 다과회
    'disguise':       { '변장': null },           // 탈
    'telekinesis':    { '염동력에서': '텔레키네시스에서' },
    'illusion':       { '환상': null },           // 일루전
    'commander':      { '지휘관': null },         // 사령탑
    'instruct':       { '지시를 따랐다': '지휘를 따랐다' },
    'grudge':         { '원한': null },           // 원념
};

// ── 3. 적용 ────────────────────────────────────────────────────────
const koJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ko_battle_text.json'), 'utf8'));
const changes = [];

for (const [section, rules] of Object.entries(fixRules)) {
    if (!koJson[section]) continue;
    const koName = nameMap[section];

    for (const [msgKey, msgVal] of Object.entries(koJson[section])) {
        if (typeof msgVal !== 'string' || msgVal.startsWith('#')) continue;
        if (msgKey.startsWith('desc') || msgKey.startsWith('short')) continue;

        let text = msgVal;
        for (const [wrong, rightOrNull] of Object.entries(rules)) {
            const right = rightOrNull === null ? koName : rightOrNull;
            if (!right) continue;
            if (text.includes(wrong)) {
                text = text.split(wrong).join(right);
            }
        }
        if (text !== msgVal) {
            changes.push({ section, msgKey, before: msgVal.trim(), after: text.trim() });
            koJson[section][msgKey] = text;
        }
    }
}

// ── 4. 결과 출력 ───────────────────────────────────────────────────
console.log(`수정된 항목: ${changes.length}개\n`);
changes.forEach(c => {
    console.log(`[${c.section}] ${c.msgKey}`);
    console.log(`  전: ${c.before}`);
    console.log(`  후: ${c.after}`);
    console.log();
});

// ── 5. 저장 ───────────────────────────────────────────────────────
if (changes.length > 0) {
    fs.writeFileSync(
        path.join(ROOT, 'data/ko_battle_text.json'),
        JSON.stringify(koJson, null, 2),
        'utf8'
    );
    fs.writeFileSync(
        path.join(ROOT, 'data/ko_battle_text.js'),
        'var KoBattleText = ' + JSON.stringify(koJson) + ';',
        'utf8'
    );
    console.log('저장 완료!');
}
