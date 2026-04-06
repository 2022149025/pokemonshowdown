import re
import json
import os

def check_progress():
    file_path = os.path.join('play.pokemonshowdown.com', 'js', 'ko-desc.js')
    
    if not os.path.exists(file_path):
        file_path = os.path.join(os.path.dirname(__file__), '..', 'play.pokemonshowdown.com', 'js', 'ko-desc.js')

    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return

    print(f"Reading {file_path}...\n")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    def extract_dict(var_name):
        match = re.search(rf'var {var_name} = ({{[\s\S]*?}});\n', content)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError as e:
                print(f"Error parsing JSON for {var_name}: {e}")
                return {}
        return {}

    pokedex = extract_dict('koPokedex')
    moves = extract_dict('koMoves')
    items = extract_dict('koItems')
    abilities = extract_dict('koAbilities')

    def analyze(data, label):
        total = len(data)
        if total == 0:
            print(f"No data found for {label}")
            return

        fully_untranslated = []
        partially_translated = []
        fully_translated = 0
        
        ko_pattern = re.compile(r'[가-힣]')
        en_pattern = re.compile(r'[a-zA-Z]{2,}')
        
        whitelist = {
            'HP', 'PP', 'SP', 'ATK', 'DEF', 'SPE', 'SPA', 'SPD', 
            'ZPOWER', 'DYNAMAX', 'GMAX', 'STELLAR', 'TERA', 'TYPE',
            'STAB', 'OHKO', 'IVS', 'EVS', 'KO', 'Z'
        }
        
        for key, entry in data.items():
            # Check name, shortDesc, and desc
            texts = []
            if entry.get('name'): texts.append(entry['name'])
            if entry.get('shortDesc'): texts.append(entry['shortDesc'])
            if entry.get('desc'): texts.append(entry['desc'])
            
            combined_text = " // ".join(texts)
            if not combined_text:
                continue

            has_ko = bool(ko_pattern.search(combined_text))
            en_words = en_pattern.findall(combined_text)
            filtered_en = [w for w in en_words if w.upper() not in whitelist]
            
            if not has_ko:
                fully_untranslated.append((key, combined_text))
            elif filtered_en:
                partially_translated.append((key, combined_text, filtered_en))
            else:
                fully_translated += 1
        
        print(f"{'='*20} {label} Analysis {'='*20}")
        print(f"Total entries: {total}")
        print(f"✅ Fully Translated: {fully_translated} ({fully_translated/total*100:.1f}%)")
        print(f"⚠️  Partially Translated (Mixed English): {len(partially_translated)} ({len(partially_translated)/total*100:.1f}%)")
        print(f"❌ Fully Untranslated (No Korean): {len(fully_untranslated)} ({len(fully_untranslated)/total*100:.1f}%)")
        
        if fully_untranslated:
            print(f"\n[Sample Fully Untranslated {label} (Top 3)]")
            for k, v in fully_untranslated[:3]:
                print(f"  - {k}: {v}")
                
        if partially_translated:
            print(f"\n[Sample Partially Translated {label} (Top 3)]")
            for k, v, en in partially_translated[:3]:
                print(f"  - {k}: {v}")
                print(f"    (Remaining English: {', '.join(en[:5])}...)")
        print("\n")

    analyze(pokedex, "Pokedex (Pokemon)")
    analyze(moves, "Moves")
    analyze(items, "Items")
    analyze(abilities, "Abilities")

if __name__ == "__main__":
    check_progress()