import re
import json
import urllib.request
import ssl
import subprocess
import tempfile
import os
import time

try:
    import google.generativeai as genai
except ImportError:
    print("Please run: pip install google-generativeai")
    exit(1)

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("API KEY NOT FOUND: set the GEMINI_API_KEY environment variable")
    exit(1)
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

ssl._create_default_https_context = ssl._create_unverified_context
CACHE_FILE = 'data/ko_translation_cache.json'

def extract_data_via_node(url, data_key):
    """Use Node.js to evaluate the data file and extract dictionary."""
    node_script = f"""
const https = require('https');
https.get('{url}', {{headers:{{'User-Agent':'Mozilla/5.0'}}}}, r => {{
    let d = '';
    r.on('data', c => d += c);
    r.on('end', () => {{
        let exports = {{}}; try {{ eval(d); }} catch(e) {{}}
        let data = exports.{data_key} || {{}};
        process.stdout.write(JSON.stringify(data));
    }});
}});
"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False, encoding='utf-8') as f:
        f.write(node_script)
        tmp = f.name
    try:
        out = subprocess.check_output(['node', tmp], timeout=60)
        return json.loads(out.decode('utf-8'))
    finally:
        os.unlink(tmp)

import concurrent.futures
import threading

cache_lock = threading.Lock()

def get_gemini_translation(texts, translation_cache):
    batch_size = 100
    
    system_prompt = """
You are an expert Pokemon translator. Translate the given English Pokemon names and descriptions into exact official Korean terminology.
Rules:
1. Names: Must use exact official Korean Pokemon names (e.g. "Charizard" -> "리자몽", "Thunderbolt" -> "10만볼트", "Overgrow" -> "심록", "Choice Scarf" -> "구애스카프").
2. Descriptions: Use official Korean mechanics (e.g. priority -> 선제공격, burn -> 화상, stat stages -> 랭크). Make it sound like official games.
3. Return ONLY a valid JSON object where keys are the exact English inputs and values are the Korean translations. Example: {"Charizard": "리자몽", "Hits 2-5 times in one turn.": "1턴에 2~5회 연속으로 공격한다."}
4. Do NOT wrap the JSON output in markdown. NEVER use ` ```json ` markers. Just return the raw JSON text.
"""
    
    unique_texts = [t for t in list(set(texts)) if t not in translation_cache]
    if not unique_texts:
        return translation_cache
        
    batches = [unique_texts[i:i+batch_size] for i in range(0, len(unique_texts), batch_size)]
    print(f"Translating {len(unique_texts)} NEW items via {len(batches)} batches using 5 threads...", flush=True)
    
    def process_batch(batch, batch_index):
        print(f"  Starting Batch {batch_index}/{len(batches)} (Items: {len(batch)})...", flush=True)
        prompt = "Translate these items:\n" + json.dumps(batch)
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = model.generate_content(
                    [system_prompt, prompt],
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.0,
                        max_output_tokens=8192,
                    )
                )
                res_text = response.text.strip()
                if res_text.startswith("```json"): res_text = res_text[7:]
                if res_text.endswith("```"): res_text = res_text[:-3]
                
                res_dict = json.loads(res_text.strip())
                
                with cache_lock:
                    translation_cache.update(res_dict)
                    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
                        json.dump(translation_cache, f, ensure_ascii=False, indent=2)
                        
                print(f"    > Success Batch {batch_index}", flush=True)
                time.sleep(2.0)
                return
            except Exception as e:
                print(f"    Batch {batch_index} Attempt {attempt+1} failed ({type(e).__name__}: {e})", flush=True)
                time.sleep(10)
                if attempt == max_retries - 1:
                    print(f"    Skipping Batch {batch_index} due to repeated failures.", flush=True)

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(process_batch, batch, i+1) for i, batch in enumerate(batches)]
        concurrent.futures.wait(futures)
                    
    return translation_cache

def main():
    print("=== Pokemon Showdown 100% Gemini Auto Translator ===", flush=True)
    
    if not os.path.exists('data'): os.makedirs('data')
    
    translation_cache = {}
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            try:
                translation_cache = json.load(f)
                print(f"Loaded {len(translation_cache)} cached translations.", flush=True)
            except: pass

    print("Fetching official Showdown data...", flush=True)
    pokedex = extract_data_via_node("https://play.pokemonshowdown.com/data/pokedex.js", "BattlePokedex")
    moves = extract_data_via_node("https://play.pokemonshowdown.com/data/moves.js", "BattleMovedex")
    items = extract_data_via_node("https://play.pokemonshowdown.com/data/items.js", "BattleItems")
    abils = extract_data_via_node("https://play.pokemonshowdown.com/data/abilities.js", "BattleAbilities")
    
    texts_to_translate = set()
    for ds in [pokedex, moves, items, abils]:
        for k, v in ds.items():
            if v.get('name'): texts_to_translate.add(v['name'])
            if v.get('shortDesc'): texts_to_translate.add(v['shortDesc'])
            if v.get('desc'): texts_to_translate.add(v['desc'])
                
    if texts_to_translate:
        translation_cache = get_gemini_translation(list(texts_to_translate), translation_cache)
    else:
        print("All names and descriptions are already translated and cached!", flush=True)
        
    def build_ko_obj(orig_data):
        ko_obj = {}
        for sid, entry in orig_data.items():
            ko_entry = {}
            if entry.get('name'): ko_entry['name'] = translation_cache.get(entry['name'], entry['name'])
            if entry.get('shortDesc'): ko_entry['shortDesc'] = translation_cache.get(entry['shortDesc'], entry['shortDesc'])
            if entry.get('desc'): ko_entry['desc'] = translation_cache.get(entry['desc'], entry['desc'])
            if ko_entry: ko_obj[sid] = ko_entry
        return ko_obj

    print("Building final localized mappings...", flush=True)
    koPokedex = build_ko_obj(pokedex)
    koMoves = build_ko_obj(moves)
    koItems = build_ko_obj(items)
    koAbils = build_ko_obj(abils)
    
    out_path = 'play.pokemonshowdown.com/js/ko-desc.js'
    js_out = f"""// Auto-generated by scripts/translate_with_gemini.py
// Using Gemini for 100% accurate official names and descriptions translation
(function () {{
    var koPokedex = {json.dumps(koPokedex, ensure_ascii=False, indent=4)};
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
            if (typeof window.BattleAliases === 'undefined') window.BattleAliases = {{}};
            for (var id in source) {{
                if (target[id]) {{
                    if (source[id].name) {{
                        var koId = source[id].name.toLowerCase().replace(/[^a-z0-9\\uAC00-\\uD7A3\\u3131-\\u318E\\u314F-\\u3163]+/g, '');
                        if (koId && !window.BattleAliases[koId]) {{
                            window.BattleAliases[koId] = id;
                        }}
                        target[id].name = source[id].name;
                    }}
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
    print(f"\\n=== Written successfully to {out_path} ===", flush=True)

if __name__ == '__main__':
    main()
