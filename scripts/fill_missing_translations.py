"""
캐시에 누락된 번역 항목만 소배치(20개)로 채우는 보완 스크립트.
"""
import json, subprocess, tempfile, os, time, ssl
import threading

ssl._create_default_https_context = ssl._create_unverified_context

try:
    import google.generativeai as genai
except ImportError:
    print("pip install google-generativeai")
    exit(1)

API_KEY = "AIzaSyBpqkRWh2jvHXfV-_XNXgg6_QRz6bFnFGs"
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')
CACHE_FILE = 'data/ko_translation_cache.json'

SYSTEM_PROMPT = """You are an expert Pokemon translator. Translate the given English Pokemon names and descriptions into exact official Korean terminology.
Rules:
1. Names: Must use exact official Korean Pokemon names (e.g. "Charizard" -> "리자몽", "Thunderbolt" -> "10만볼트", "Overgrow" -> "심록", "Choice Scarf" -> "구애스카프").
2. Descriptions: Use official Korean mechanics (e.g. priority -> 선제공격, burn -> 화상, stat stages -> 랭크). Make it sound like official games.
3. Return ONLY a valid JSON object where keys are the exact English inputs and values are the Korean translations.
4. Do NOT wrap the JSON output in markdown. NEVER use ```json markers. Just return the raw JSON text.
5. Keep responses concise. Do not add extra commentary."""

cache_lock = threading.Lock()

def fetch_all_data():
    node_script = """
const https = require('https');
const urls = [
  ['https://play.pokemonshowdown.com/data/pokedex.js', 'BattlePokedex'],
  ['https://play.pokemonshowdown.com/data/moves.js', 'BattleMovedex'],
  ['https://play.pokemonshowdown.com/data/items.js', 'BattleItems'],
  ['https://play.pokemonshowdown.com/data/abilities.js', 'BattleAbilities'],
];
let results = {};
let done = 0;
urls.forEach(([url, key]) => {
  https.get(url, {headers:{"User-Agent":"Mozilla/5.0"}}, r => {
    let d = "";
    r.on("data", c => d += c);
    r.on("end", () => {
      let exports = {}; try { eval(d); } catch(e) {}
      results[key] = exports[key] || {};
      done++;
      if (done === urls.length) process.stdout.write(JSON.stringify(results));
    });
  });
});
"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False, encoding='utf-8') as f:
        f.write(node_script)
        tmp = f.name
    try:
        out = subprocess.check_output(['node', tmp], timeout=60)
        return json.loads(out.decode('utf-8'))
    finally:
        os.unlink(tmp)

def process_batch(batch, batch_index, total_batches, translation_cache):
    print(f"  Batch {batch_index}/{total_batches} ({len(batch)} items)...", flush=True)
    prompt = "Translate these items:\n" + json.dumps(batch, ensure_ascii=False)
    for attempt in range(4):
        try:
            response = model.generate_content(
                [SYSTEM_PROMPT, prompt],
                generation_config=genai.types.GenerationConfig(
                    temperature=0.0,
                    max_output_tokens=16384,
                )
            )
            res_text = response.text.strip()
            if res_text.startswith("```json"): res_text = res_text[7:]
            if res_text.startswith("```"): res_text = res_text[3:]
            if res_text.endswith("```"): res_text = res_text[:-3]
            res_dict = json.loads(res_text.strip())
            # Gemini가 null 반환한 항목은 영어 원문으로 폴백
            for k, v in res_dict.items():
                if v is None:
                    res_dict[k] = k
            with cache_lock:
                translation_cache.update(res_dict)
                with open(CACHE_FILE, 'w', encoding='utf-8') as f:
                    json.dump(translation_cache, f, ensure_ascii=False, indent=2)
            print(f"    > OK Batch {batch_index} ({len(res_dict)} translated)", flush=True)
            time.sleep(1.5)
            return
        except Exception as e:
            print(f"    Batch {batch_index} attempt {attempt+1} fail: {type(e).__name__}: {e}", flush=True)
            time.sleep(8)
    print(f"    >> SKIP Batch {batch_index}", flush=True)

def main():
    print("=== 누락 번역 보완 스크립트 ===", flush=True)

    with open(CACHE_FILE, 'r', encoding='utf-8') as f:
        cache = json.load(f)
    print(f"기존 캐시: {len(cache)}개", flush=True)

    print("PS 데이터 로드 중...", flush=True)
    all_data = fetch_all_data()

    missing = []
    for ds in all_data.values():
        for k, v in ds.items():
            for field in ['name', 'shortDesc', 'desc']:
                text = v.get(field)
                if text and text not in cache and text not in missing:
                    missing.append(text)

    print(f"번역 필요: {len(missing)}개", flush=True)
    if not missing:
        print("모두 번역 완료! ko-desc.js 재빌드 진행...", flush=True)

    # 길이 기준 소배치: 짧은 건 20개, 긴 건(200자+) 5개씩
    short = [t for t in missing if len(t) <= 200]
    long  = [t for t in missing if len(t) > 200]
    print(f"  짧은 항목({len(short)}개, ≤200자): 배치 20개씩", flush=True)
    print(f"  긴 항목({len(long)}개, >200자): 배치 5개씩", flush=True)

    batches = (
        [short[i:i+20] for i in range(0, len(short), 20)] +
        [long[i:i+5]   for i in range(0, len(long),  5)]
    )

    total = len(batches)
    print(f"총 {total}개 배치 처리 시작...", flush=True)

    # 순차 처리 (안정성 우선)
    for i, batch in enumerate(batches, 1):
        process_batch(batch, i, total, cache)

    print(f"\n완료. 캐시 총 {len(cache)}개", flush=True)

    # ko-desc.js 재빌드
    print("ko-desc.js 재빌드 중...", flush=True)

    def build(ds):
        result = {}
        for sid, entry in ds.items():
            ko = {}
            for field in ['name', 'shortDesc', 'desc']:
                val = entry.get(field)
                if val:
                    ko[field] = cache.get(val, val)
            if ko:
                result[sid] = ko
        return result

    koPoke  = build(all_data.get('BattlePokedex', {}))
    koMoves = build(all_data.get('BattleMovedex', {}))
    koItems = build(all_data.get('BattleItems', {}))
    koAbils = build(all_data.get('BattleAbilities', {}))

    out_path = 'play.pokemonshowdown.com/js/ko-desc.js'
    js_out = f"""// Auto-generated by scripts/translate_with_gemini.py
// Using Gemini for 100% accurate official names and descriptions translation
(function () {{
    var koPokedex = {json.dumps(koPoke,  ensure_ascii=False, indent=4)};
    var koMoves = {json.dumps(koMoves, ensure_ascii=False, indent=4)};
    var koItems = {json.dumps(koItems, ensure_ascii=False, indent=4)};
    var koAbilities = {json.dumps(koAbils, ensure_ascii=False, indent=4)};

    function applyDescs() {{
        var toIdLocal = function(text) {{
            return ('' + (text || '')).toLowerCase().replace(/[^a-z0-9]+/g, '');
        }};

        // 포켓몬: 이름 변경 전 영어 spriteid 보존 + BattleAliases에 한글명 등록
        var applyPokedex = function(target, source) {{
            if (!target) return;
            if (typeof window.BattleAliases === 'undefined') window.BattleAliases = {{}};
            for (var id in source) {{
                if (!target[id] || !source[id].name) continue;
                if (!target[id].spriteid) {{
                    var baseId = toIdLocal(target[id].baseSpecies || id);
                    var forme  = toIdLocal(target[id].forme || '');
                    target[id].spriteid = forme ? baseId + '-' + forme : (baseId || id);
                }}
                if (!target[id].baseSpecies) {{
                    target[id].baseSpecies = target[id].name || id;
                }}
                var koId = source[id].name.toLowerCase().replace(/[^a-z0-9\uAC00-\uD7A3\u3131-\u318E\u314F-\u3163]+/g, '');
                if (koId && !window.BattleAliases[koId]) {{
                    window.BattleAliases[koId] = id;
                }}
                target[id].name = source[id].name;
                if (source[id].shortDesc) target[id].shortDesc = source[id].shortDesc;
                if (source[id].desc) target[id].desc = source[id].desc;
            }}
        }};

        var applyOther = function(target, source) {{
            if (!target) return;
            for (var id in source) {{
                if (target[id]) {{
                    if (source[id].name) target[id].name = source[id].name;
                    if (source[id].shortDesc) target[id].shortDesc = source[id].shortDesc;
                    if (source[id].desc) target[id].desc = source[id].desc;
                }}
            }}
        }};

        applyPokedex(window.BattlePokedex, koPokedex);
        applyOther(window.BattleMovedex, koMoves);
        applyOther(window.BattleItems, koItems);
        applyOther(window.BattleAbilities, koAbilities);
    }}

    applyDescs();
    window.addEventListener('load', applyDescs);
    setTimeout(applyDescs, 3000);
}})();
"""
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(js_out)
    print(f"=== {out_path} 저장 완료 ===", flush=True)

if __name__ == '__main__':
    main()
