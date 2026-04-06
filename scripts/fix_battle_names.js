/**
 * ko_battle_text.json의 배틀 메시지에서
 * 영어로 남아있거나 잘못된 특성/기술/도구/포켓몬 이름을
 * ko-desc.js의 공식 한글명으로 자동 치환
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// ─── 1. ko-desc.js에서 id → 한글명 맵 추출 ────────────────────────
const koDescContent = fs.readFileSync(path.join(ROOT, 'js/ko-desc.js'), 'utf8');

function extractNames(content) {
    const map = {};
    // "someid": { "name": "한글명" ... } 패턴
    const re = /"([a-z0-9]+)":\s*\{[^}]*"name":\s*"([^"]+)"/g;
    let m;
    while ((m = re.exec(content)) !== null) {
        if (!map[m[1]]) map[m[1]] = m[2];
    }
    return map;
}

const koNames = extractNames(koDescContent);
console.log('추출된 한글명 수:', Object.keys(koNames).length);

// ─── 2. 영어 name 맵 구성 (text.json 섹션키의 영어 표시명) ──────────
// text.json에서 섹션명에 해당하는 영어 이름을 추출하기 위해
// 섹션 키 자체(camelCase)로부터 영어 표시명을 생성

function sectionToEnglish(id) {
    // camelCase → Title Case words (예: lightscreen → Light Screen)
    return id
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/^./, c => c.toUpperCase());
}

// ─── 3. text.json 로드 ──────────────────────────────────────────────
const textJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/text.json'), 'utf8'));
const koJson   = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ko_battle_text.json'), 'utf8'));

// ─── 4. 각 섹션의 메시지에서 영어 이름 치환 ─────────────────────────
let totalReplaced = 0;
const changes = [];

for (const section in koJson) {
    const msgs = koJson[section];
    if (typeof msgs !== 'object') continue;

    // 이 섹션이 어떤 이름에 해당하는지
    const koName = koNames[section];   // 한글명 (있으면)
    if (!koName) continue;             // 한글명 없으면 스킵

    // 영어로 쓰일 수 있는 형태들
    const enDisplayName = sectionToEnglish(section);  // 예: "Light Screen"
    const enId = section;                              // 예: "lightscreen"

    for (const key in msgs) {
        let text = msgs[key];
        if (typeof text !== 'string') continue;
        if (text.startsWith('#')) continue;  // 참조 링크 스킵

        const original = text;

        // 영어 표시명 치환 (예: "Light Screen" → "빛의장막")
        if (text.includes(enDisplayName) && enDisplayName.length > 3) {
            text = text.split(enDisplayName).join(koName);
        }

        // 소문자 ID 치환 (예: "leechseed" → "씨뿌리기") - 단 플레이스홀더 아닐 때
        if (text.toLowerCase().includes(enId) && enId.length > 3) {
            // 대소문자 혼합 매칭
            const re = new RegExp(enId, 'gi');
            text = text.replace(re, koName);
        }

        if (text !== original) {
            changes.push({ section, key, before: original, after: text });
            koJson[section][key] = text;
            totalReplaced++;
        }
    }
}

// ─── 5. 결과 출력 ────────────────────────────────────────────────────
console.log('\n변경된 항목 수:', totalReplaced);
changes.forEach(c => {
    console.log('\n[' + c.section + '] ' + c.key);
    console.log('  전: ' + c.before.trim());
    console.log('  후: ' + c.after.trim());
});

// ─── 6. 저장 ────────────────────────────────────────────────────────
if (totalReplaced > 0) {
    fs.writeFileSync(
        path.join(ROOT, 'data/ko_battle_text.json'),
        JSON.stringify(koJson, null, 2),
        'utf8'
    );
    console.log('\nko_battle_text.json 저장 완료');

    // JS 파일도 재생성
    fs.writeFileSync(
        path.join(ROOT, 'data/ko_battle_text.js'),
        'var KoBattleText = ' + JSON.stringify(koJson) + ';',
        'utf8'
    );
    console.log('ko_battle_text.js 재생성 완료');
} else {
    console.log('\n변경 없음');
}
