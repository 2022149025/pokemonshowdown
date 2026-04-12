import json
import os
import google.generativeai as genai
import time

# Read API key from .env file or environment (gitignored)
def _load_dotenv():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if not os.path.exists(env_path):
        return
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
_load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    print("API KEY NOT FOUND: set the GEMINI_API_KEY environment variable")
    exit(1)

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})

with open('data/text.json', 'r', encoding='utf-8') as f:
    text_data = json.load(f)

texts_to_translate = []
paths = []

def extract_strings(obj, current_path=[]):
    if isinstance(obj, dict):
        for k, v in obj.items():
            extract_strings(v, current_path + [k])
    elif isinstance(obj, str):
        # Ignore strings that are just #references or basic punctuation
        if obj.strip() and not any('\u3131' <= c <= '\u318E' or '\uAC00' <= c <= '\uD7A3' for c in obj):
            if not (obj.startswith('#') and len(obj.split()) == 1):
                texts_to_translate.append(obj)
                paths.append(current_path)

extract_strings(text_data)
print(f"Total strings to translate: {len(texts_to_translate)}")

CHUNK_SIZE = 80
translated_dict = {}

try:
    with open('data/ko_battle_text_cache.json', 'r', encoding='utf-8') as f:
        translated_dict = json.load(f)
except FileNotFoundError:
    pass

def apply_translation(obj, path, translated_str):
    for key in path[:-1]:
        obj = obj[key]
    obj[path[-1]] = translated_str

for i in range(0, len(texts_to_translate), CHUNK_SIZE):
    chunk_texts = texts_to_translate[i:i+CHUNK_SIZE]
    chunk_paths = paths[i:i+CHUNK_SIZE]
    
    untranslated_indexes = [idx for idx, txt in enumerate(chunk_texts) if txt not in translated_dict]
    
    if untranslated_indexes:
        prompt_texts = {str(idx): chunk_texts[idx] for idx in untranslated_indexes}
        prompt = f"""
Translate the following Pokemon Showdown battle log messages into Korean.
Preserve ALL bracketed variables EXACTLY as they are without translating them (e.g., [POKEMON], [TRAINER], [MOVE], [ITEM], [ABILITY], [STAT], [EFFECT], [NICKNAME], [FULLNAME], [TARGET], [SOURCE], [TEAM], [NUMBER], [PERCENTAGE]).
Preserve all formatting like asterisks (**[TRAINER]**), newlines, and leading/trailing spaces exactly.
Output as a valid JSON object with the exact same numerical keys as the input.

Input JSON:
{json.dumps(prompt_texts, ensure_ascii=False, indent=2)}
"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                print(f"Translating chunk {i//CHUNK_SIZE + 1} / {len(texts_to_translate)//CHUNK_SIZE + 1}...")
                response = model.generate_content(prompt)
                result = json.loads(response.text)
                for k, v in result.items():
                    translated_dict[chunk_texts[int(k)]] = v
                
                with open('data/ko_battle_text_cache.json', 'w', encoding='utf-8') as f:
                    json.dump(translated_dict, f, ensure_ascii=False, indent=2)
                time.sleep(1)
                break
            except Exception as e:
                print(f"Error on chunk (attempt {attempt+1}): {e}")
                time.sleep(3)

for txt, path in zip(texts_to_translate, paths):
    if txt in translated_dict:
        apply_translation(text_data, path, translated_dict[txt])

with open('data/ko_battle_text.json', 'w', encoding='utf-8') as f:
    json.dump(text_data, f, ensure_ascii=False, indent=2)

# Generate a small JS patch file
js_out = f"window.koBattleTextFull = {json.dumps(text_data, ensure_ascii=False, indent=2)};\n"
with open('play.pokemonshowdown.com/js/ko-battle-text.js', 'w', encoding='utf-8') as f:
    f.write(js_out)

print("Translation complete. Saved to data/ko_battle_text.json and js/ko-battle-text.js")
