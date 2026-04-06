import urllib.request
import json
import re
import ssl
import subprocess
import tempfile
import os

# SSL 인증서 오류 방지
ssl._create_default_https_context = ssl._create_unverified_context

WIKI_URLS = {
    'pokemon': 'https://pokemon.fandom.com/ko/wiki/%EC%A0%84%EA%B5%AD%EB%8F%84%EA%B0%90', # 전국도감
    'moves': 'https://pokemon.fandom.com/ko/wiki/%EA%B8%B0%EC%88%A0_%EB%AA%A9%EB%A1%9D',   # 기술 목록
    'abilities': 'https://pokemon.fandom.com/ko/wiki/%ED%8A%B9%EC%84%B1_%EB%AA%A9%EB%A1%9D', # 특성 목록
    'items': 'https://pokemon.fandom.com/ko/wiki/%EB%8F%84%EA%B5%AC_%EB%AA%A9%EB%A1%9D'      # 도구 목록
}

# 폼(Form) 변환 맵
FORM_MAP = {
    'Alola': '알로라의 모습',
    'Galar': '가라르의 모습',
    'Hisui': '히스이의 모습',
    'Paldea': '팔데아의 모습',
    'Mega': '메가진화',
    'Mega-X': '메가진화 X',
    'Mega-Y': '메가진화 Y',
    'Primal': '원시회귀',
    'Therian': '영물폼',
    'Incarnate': '화신폼',
    'Speed': '스피드폼',
    'Attack': '공격폼',
    'Defense': '방어폼',
    'Normal': '', # 기본 폼은 보통 표기 안 함
    'Plant': '초목도롱',
    'Sandy': '모래땅도롱',
    'Trash': '슈레도롱',
    'Sunshine': '포지폼',
    'East': '동쪽바다',
    'West': '서쪽바다',
    'Origin': '오리진폼',
    'Sky': '스카이폼',
    'Zen': '달마모드',
    'Galar-Zen': '달마모드',
    'Resolute': '평상심의 모습',
    'Pirouette': '스텝폼',
    'Aria': '보이스폼',
    'Ash': '지우개굴닌자',
    'School': '군집의 모습',
    'Blade': '블레이드폼',
    'Shield': '실드폼',
    '10%': '10%폼',
    '50%': '50%폼',
    'Complete': '퍼펙트폼',
    'Dusk': '황혼의 모습',
    'Dawn': '새벽의 날개',
    'Dusk-Mane': '황혼의 갈기',
    'Ultra': '울트라네크로즈마',
    'Low-Key': '로우키',
    'Eternamax': '무한다이맥스',
    'Rapid-Strike': '연격의 태세',
    'Single-Strike': '일격의 태세',
    'Ice': '백마 탄 모습',
    'Shadow': '흑마 탄 모습',
    'Paldea-Combat': '컴뱃종',
    'Paldea-Blaze': '브레이즈종',
    'Paldea-Aqua': '워터종',
    'Hero': '마이티폼',
    'Bloodmoon': '다투곰-붉은달',
    'Three-Segment': '세마디',
    'Two-Segment': '두마디',
    'Roaming': '도보폼',
    'Chest': '상자폼',
    'Stellar': '스텔라',
}

TYPE_MAP = {
    'Bug': '벌레', 'Dark': '악', 'Dragon': '드래곤', 'Electric': '전기',
    'Fairy': '페어리', 'Fighting': '격투', 'Fire': '불꽃', 'Flying': '비행',
    'Ghost': '고스트', 'Grass': '풀', 'Ground': '땅', 'Ice': '얼음',
    'Normal': '노말', 'Poison': '독', 'Psychic': '에스퍼', 'Rock': '바위',
    'Steel': '강철', 'Water': '물', 'Stellar': '스텔라'
}

GENESECT_DRIVES = {
    'Douse': '아쿠아카세트', 'Shock': '번개카세트', 'Burn': '블레이즈카세트', 'Chill': '프리즈카세트'
}

# 위키에 없거나 매핑이 안되는 최신/특수 항목 수동 번역
MANUAL_TRANSLATIONS = {
    # 9세대 및 최신 기술
    'Chilling Water': '찬물끼얹기',
    'Pounce': '덤벼들기',
    'Trailblaze': '개척하기',
    'Snowscape': '설경',
    'Lumina Crash': '루미나콜리전',
    'Order Up': '한판내기',
    'Spicy Extract': '매운관장',
    'Spin Out': '휠스핀',
    'Population Bomb': '찍찍베기',
    'Ice Spinner': '아이스스피너',
    'Glaive Rush': '거대검돌격',
    'Revival Blessing': '회생의기도',
    'Salt Cure': '소금절이',
    'Triple Dive': '트리플다이브',
    'Mortal Spin': '킬러스핀',
    'Doodle': '베끼기',
    'Fillet Away': '살점깎기',
    'Kowtow Cleave': '도게자',
    'Flower Trick': '트릭플라워',
    'Torch Song': '플레어송',
    'Aqua Step': '아쿠아스텝',
    'Raging Bull': '레이징불',
    'Make It Rain': '골드러시',
    'Ruination': '카타스트로피',
    'Collision Course': '엑셀브레이크',
    'Electro Drift': '라이트닝드라이브',
    'Shed Tail': '꼬리자르기',
    'Chilly Reception': '썰렁개그',
    'Tidy Up': '정리정돈',
    'Comeuppance': '복수',
    'Aqua Cutter': '아쿠아커터',
    'Blazing Torque': '버닝액셀',
    'Wicked Torque': '다크액셀',
    'Noxious Torque': '포이즌액셀',
    'Combat Torque': '파이트액셀',
    'Magical Torque': '매지컬액셀',
    'Psyblade': '사이코블레이드',
    'Hydro Steam': '하이드로스팀',
    'Chloroblast': '클로로블라스트',
    'Mountain Gale': '빙산의바람',
    'Victory Dance': '승리의춤',
    'Headlong Rush': '부딪치기',
    'Barb Barrage': '독침천발',
    'Esper Wing': '에스퍼윙',
    'Bitter Malice': '원한의찬서리',
    'Shelter': '농성',
    'Triple Arrows': '3연화살',
    'Infernal Parade': '백귀야행',
    'Ceaseless Edge': '비검천중파',
    'Stone Axe': '암석엑스',
}

def to_id(text):
    return re.sub(r'[^a-z0-9]', '', str(text).lower())

def fetch_wiki_table(url):
    print(f"Fetching {url}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        content = response.read().decode('utf-8')
    
    # 위키 테이블 파싱 (정규식 사용)
    # <td><a ...>한국어</a></td> ... <td><a ...>English</a></td> 패턴 찾기
    # 포켓몬 위키의 테이블 구조에 맞춰 유연하게 매칭
    mapping = {}
    
    # 일반적인 테이블 행 매칭
    # 1. 한국어 이름이 먼저 나오고 영어가 나중에 나오는 경우 (대부분의 목록)
    # 2. 영어가 먼저 나오는 경우도 고려
    
    # 정규식: <td>...한국어...</td>...<td>...English...</td>
    # 태그 제거 후 텍스트 추출
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', content, re.DOTALL)
    
    for row in rows:
        cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL)
        if len(cells) < 2:
            continue
            
        # 태그 제거 함수
        def clean(text):
            return re.sub(r'<[^>]+>', '', text).strip()
            
        # 셀 데이터 정제
        cleaned_cells = [clean(c) for c in cells]
        
        # 한국어/영어 찾기 (한글 포함 여부로 판단)
        ko_name = None
        en_name = None
        
        for cell in cleaned_cells:
            if re.search(r'[가-힣]', cell) and not ko_name:
                ko_name = cell
            elif re.search(r'[a-zA-Z]', cell) and not en_name:
                en_name = cell
        
        if ko_name and en_name:
            # 괄호 제거 (예: "리자몽 (거다이맥스)" -> "리자몽") - 기본 이름만 추출
            # ko_base = re.sub(r'\s*\(.*\)', '', ko_name)
            # en_base = re.sub(r'\s*\(.*\)', '', en_name)
            
            sid = to_id(en_name)
            if sid:
                mapping[sid] = ko_name
                
    return mapping

def get_showdown_pokedex():
    # Node.js를 사용하여 Showdown의 pokedex.js 데이터를 가져옴
    url = "https://play.pokemonshowdown.com/data/pokedex.js"
    script = f"""
const https = require('https');
https.get('{url}', r => {{
    let d = ''; r.on('data', c => d += c);
    r.on('end', () => {{
        let exports = {{}};
        try {{ eval(d); }} catch(e) {{}}
        console.log(JSON.stringify(exports.BattlePokedex || {{}}));
    }});
}});
"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False, encoding='utf-8') as f:
        f.write(script)
        tmp = f.name
    try:
        out = subprocess.check_output(['node', tmp], timeout=30)
        return json.loads(out.decode('utf-8'))
    finally:
        os.unlink(tmp)

def resolve_form_name(dex_entry, base_ko_name):
    if not dex_entry.get('forme'):
        return base_ko_name
        
    forme = dex_entry['forme']
    base = dex_entry.get('baseSpecies', '')
    
    # 아르세우스
    if base == 'Arceus':
        plate = TYPE_MAP.get(forme, forme)
        return f"아르세우스({plate}플레이트)"
    
    # 실버디
    if base == 'Silvally':
        memory = TYPE_MAP.get(forme, forme)
        return f"실버디({memory}메모리)"
        
    # 게노세크트
    if base == 'Genesect' and forme in GENESECT_DRIVES:
        return f"게노세크트({GENESECT_DRIVES[forme]})"
        
    # 일반적인 폼 변환
    suffix_ko = FORM_MAP.get(forme)
    if not suffix_ko:
        # 매핑되지 않은 폼은 괄호 안에 그대로 넣거나 처리
        # 예: "Minior-Meteor" -> "메테노(Meteor)" (fallback)
        return f"{base_ko_name}({forme})"
        
    return f"{base_ko_name}({suffix_ko})"

def main():
    print("=== Scraping from Pokemon Wiki ===")
    wiki_pokemon = fetch_wiki_table(WIKI_URLS['pokemon'])
    wiki_moves = fetch_wiki_table(WIKI_URLS['moves'])
    wiki_abilities = fetch_wiki_table(WIKI_URLS['abilities'])
    wiki_items = fetch_wiki_table(WIKI_URLS['items'])
    
    print("=== Fetching Showdown Pokedex Data ===")
    showdown_dex = get_showdown_pokedex()
    
    print("=== Processing Pokemon Names & Forms ===")
    final_pokemon = {}
    
    for pid, entry in showdown_dex.items():
        base_species = entry.get('baseSpecies', entry.get('name', ''))
        base_id = to_id(base_species)
        
        # 기본 이름의 한국어 명칭 찾기
        base_ko = wiki_pokemon.get(base_id)
        
        if not base_ko:
            # 위키에 없는 경우 (최신 포켓몬 등), 영어 이름 그대로 사용하거나 fallback
            # print(f"Warning: No Korean name for {base_species}")
            continue
            
        # 폼 처리
        final_name = resolve_form_name(entry, base_ko)
        final_pokemon[pid] = final_name
        
        # 코스메틱 폼 등 Showdown ID로 직접 매핑된 경우도 처리
        if entry.get('name') and to_id(entry['name']) != pid:
             final_pokemon[to_id(entry['name'])] = final_name

    # 수동 번역 병합 (기술)
    for en, ko in MANUAL_TRANSLATIONS.items():
        wiki_moves[to_id(en)] = ko

    js_content = f"""// Auto-generated from PokeAPI
(function() {{
    const koPokemon = {json.dumps(final_pokemon, ensure_ascii=False, indent=4)};
    const koMoves = {json.dumps(wiki_moves, ensure_ascii=False, indent=4)};
    const koAbilities = {json.dumps(wiki_abilities, ensure_ascii=False, indent=4)};
    const koItems = {json.dumps(wiki_items, ensure_ascii=False, indent=4)};

    function applyTranslations(target, source) {{
        if (!target) return;
        for (const [id, name] of Object.entries(source)) {{
            if (target[id]) {{
                if (target === window.BattlePokedex && !target[id].spriteid) {{
                    let toIdLocal = (text) => ('' + (text || '')).toLowerCase().replace(/[^a-z0-9]+/g, '');
                    target[id].spriteid = toIdLocal(target[id].baseSpecies || '') + ((target[id].baseSpecies || '') !== (target[id].name || '') ? '-' + toIdLocal(target[id].forme || '') : '');
                }}
                target[id].name = name;
            }}
        }}
    }}

    function toIdForKo(text) {{
        if (text && text.id) {{
            text = text.id;
        }} else if (text && text.userid) {{
            text = text.userid;
        }} else if (text && text.roomid) {{
            text = text.roomid;
        }}
        if (typeof text !== 'string' && typeof text !== 'number') return '';
        return ('' + text).toLowerCase().replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ]+/g, '');
    }}

    function wrapSearchRender() {{
        // 1. Override toID to support Korean words globally
        if (window.toID) {{
            window.origToID = window.toID;
            window.toID = toIdForKo;
            if (window.Dex && window.Dex.toID) window.Dex.toID = window.toID;
            if (window.toId) window.toId = window.toID;
        }}

        // 2. Add Korean words to BattleAliases so search engine can find them
        if (typeof window.BattleAliases === 'undefined') window.BattleAliases = {{}};
        function addAliases(source) {{
            for (const [id, name] of Object.entries(source)) {{
                let koId = toIdForKo(name);
                if (koId && !window.BattleAliases[koId]) {{
                    window.BattleAliases[koId] = id;
                }}
            }}
        }}
        addAliases(koPokemon);
        addAliases(koMoves);
        addAliases(koAbilities);
        addAliases(koItems);

        // 3. Create reverse maps for packTeam and icon generation
        const korToEngPokemon = {{}};
        for (const [id, name] of Object.entries(koPokemon)) korToEngPokemon[name] = id;
        const korToEngMoves = {{}};
        for (const [id, name] of Object.entries(koMoves)) korToEngMoves[name] = id;
        const korToEngAbilities = {{}};
        for (const [id, name] of Object.entries(koAbilities)) korToEngAbilities[name] = id;
        const korToEngItems = {{}};
        for (const [id, name] of Object.entries(koItems)) korToEngItems[name] = id;

        // 4. Override Dex.getPokemonIcon and Dex.getTeambuilderSprite to map Korean names back to English ID
        if (window.Dex) {{
            if (window.Dex.getPokemonIcon) {{
                const origGetIcon = window.Dex.getPokemonIcon;
                window.Dex.getPokemonIcon = function(pokemon, facingLeft) {{
                    let p = pokemon;
                    let id = '';
                    if (typeof pokemon === 'string') {{
                        id = pokemon;
                    }} else if (pokemon && (pokemon.name || pokemon.species)) {{
                        id = pokemon.name || pokemon.species;
                    }}
                    
                    if (id && korToEngPokemon[id]) {{
                        if (typeof pokemon === 'string') {{
                            p = korToEngPokemon[id];
                        }} else {{
                            p = Object.assign({{}}, pokemon);
                            p.name = korToEngPokemon[id];
                            p.species = korToEngPokemon[id];
                            if (p.baseSpecies) p.baseSpecies = korToEngPokemon[id];
                        }}
                    }}
                    return origGetIcon.call(this, p, facingLeft);
                }};
            }}
            if (window.Dex.getTeambuilderSprite) {{
                const origGetTbs = window.Dex.getTeambuilderSprite;
                window.Dex.getTeambuilderSprite = function(pokemon, dex, xOffset, yOffset) {{
                    let p = pokemon;
                    let id = '';
                    if (typeof pokemon === 'string') {{
                        id = pokemon;
                    }} else if (pokemon && (pokemon.name || pokemon.species)) {{
                        id = pokemon.name || pokemon.species;
                    }}
                    
                    if (id && korToEngPokemon[id]) {{
                        if (typeof pokemon === 'string') {{
                            p = korToEngPokemon[id];
                        }} else {{
                            p = Object.assign({{}}, pokemon);
                            p.name = korToEngPokemon[id];
                            p.species = korToEngPokemon[id];
                            if (p.baseSpecies) p.baseSpecies = korToEngPokemon[id];
                        }}
                    }}
                    return origGetTbs.call(this, p, dex, xOffset, yOffset);
                }};
            }}
        }}

        // 5. Override Storage.packTeam to map Korean back to English
        if (window.Storage && window.Storage.packTeam) {{
            const origPackTeam = window.Storage.packTeam;
            window.Storage.packTeam = function(team) {{
                if (team && Array.isArray(team)) {{
                    let engTeam = $.extend(true, [], team);
                    engTeam.forEach(pokemon => {{
                        if (pokemon.name && korToEngPokemon[pokemon.name]) {{
                            pokemon.name = korToEngPokemon[pokemon.name];
                        }}
                        if (pokemon.species && korToEngPokemon[pokemon.species]) {{
                            pokemon.species = korToEngPokemon[pokemon.species];
                        }}
                        if (pokemon.item && korToEngItems[pokemon.item]) {{
                            pokemon.item = korToEngItems[pokemon.item];
                        }}
                        if (pokemon.ability && korToEngAbilities[pokemon.ability]) {{
                            pokemon.ability = korToEngAbilities[pokemon.ability];
                        }}
                        if (pokemon.moves && Array.isArray(pokemon.moves)) {{
                            pokemon.moves = pokemon.moves.map(m => korToEngMoves[m] || m);
                        }}
                    }});
                    return origPackTeam.call(this, engTeam);
                }}
                return origPackTeam.call(this, team);
            }};
        }}

        // 6. Override TeambuilderRoom.prototype.renderSet and updatePokemonSprite to dynamically translate English names in state to Korean for UI
        if (window.TeambuilderRoom && window.TeambuilderRoom.prototype) {{
            if (window.TeambuilderRoom.prototype.renderSet) {{
                const origRenderSet = window.TeambuilderRoom.prototype.renderSet;
                window.TeambuilderRoom.prototype.renderSet = function(set, i) {{
                    if (set) {{
                        const toId = window.toID;
                        if (set.ability) {{
                            let id = toId(set.ability);
                            if (window.BattleAbilities && window.BattleAbilities[id] && window.BattleAbilities[id].name) {{
                                set.ability = window.BattleAbilities[id].name;
                            }}
                        }}
                        if (set.item) {{
                            let id = toId(set.item);
                            if (window.BattleItems && window.BattleItems[id] && window.BattleItems[id].name) {{
                                set.item = window.BattleItems[id].name;
                            }}
                        }}
                        if (set.species) {{
                            let id = toId(set.species);
                            if (window.BattlePokedex && window.BattlePokedex[id] && window.BattlePokedex[id].name) {{
                                set.species = window.BattlePokedex[id].name;
                            }}
                        }}
                        if (set.moves && Array.isArray(set.moves)) {{
                            for (let j=0; j<set.moves.length; j++) {{
                                if (set.moves[j]) {{
                                    let id = toId(set.moves[j]);
                                    if (window.BattleMovedex && window.BattleMovedex[id] && window.BattleMovedex[id].name) {{
                                        set.moves[j] = window.BattleMovedex[id].name;
                                    }}
                                }}
                            }}
                        }}
                    }}
                    return origRenderSet.call(this, set, i);
                }};
            }}
            
            if (window.TeambuilderRoom.prototype.updatePokemonSprite) {{
                // 포켓몬 썸네일 업데이트 가로채기
                const originalUpdatePokemonSprite = window.TeambuilderRoom.prototype.updatePokemonSprite;
                window.TeambuilderRoom.prototype.updatePokemonSprite = function() {{
                    let set = this.curSet;
                    if (!set) return originalUpdatePokemonSprite.call(this);

                    let origSpecies = set.species;
                    let origName = set.name;

                    let engId = korToEngPokemon[origSpecies] || korToEngPokemon[origName] || (Object.values(korToEngPokemon).includes(window.toID(origSpecies)) ? window.toID(origSpecies) : null);
                    if (engId) {{
                        set.species = engId;
                        if (origName === origSpecies) set.name = engId;
                    }}

                    let ret = originalUpdatePokemonSprite.call(this);

                    set.species = origSpecies;
                    set.name = origName;

                    const toId = window.toID;
                    if (set.ability && window.BattleAbilities) {{
                        let k_ab = window.BattleAbilities[toId(set.ability)];
                        if (k_ab && k_ab.name) this.$('input[name=ability]').val(k_ab.name);
                    }}
                    if (set.item && window.BattleItems) {{
                        let k_it = window.BattleItems[toId(set.item)];
                        if (k_it && k_it.name) this.$('input[name=item]').val(k_it.name);
                    }}
                    if (set.species && window.BattlePokedex) {{
                        let k_poke = window.BattlePokedex[toId(origSpecies)];
                        if (k_poke && k_poke.name) this.$('input[name=pokemon]').val(k_poke.name);
                    }}
                    if (set.moves && window.BattleMovedex) {{
                        for (let j=0; j<Math.max(4, set.moves.length); j++) {{
                            if (set.moves[j]) {{
                                let k_mv = window.BattleMovedex[toId(set.moves[j])];
                                if (k_mv && k_mv.name) this.$(`input[name=move${{j+1}}]`).val(k_mv.name);
                            }}
                        }}
                    }}
                    return ret;
                }};
            }}
        }}

        if (!window.BattleSearch || !window.BattleSearch.prototype) return;
        
        const origPokemon = window.BattleSearch.prototype.renderPokemonRow;
        window.BattleSearch.prototype.renderPokemonRow = function(pokemon, ...args) {{
            let origAbils = null;
            if (pokemon && pokemon.abilities) {{
                origAbils = Object.assign({{}}, pokemon.abilities);
                for (let k in pokemon.abilities) {{
                    let id = toIdForKo(pokemon.abilities[k]);
                    if (koAbilities[id]) pokemon.abilities[k] = koAbilities[id];
                }}
            }}
            let res = origPokemon.apply(this, [pokemon, ...args]);
            if (origAbils) pokemon.abilities = origAbils;
            return res;
        }};

        const origTagged = window.BattleSearch.prototype.renderTaggedPokemonRowInner;
        window.BattleSearch.prototype.renderTaggedPokemonRowInner = function(pokemon, ...args) {{
            let origAbils = null;
            if (pokemon && pokemon.abilities) {{
                origAbils = Object.assign({{}}, pokemon.abilities);
                for (let k in pokemon.abilities) {{
                    let id = toIdForKo(pokemon.abilities[k]);
                    if (koAbilities[id]) pokemon.abilities[k] = koAbilities[id];
                }}
            }}
            let res = origTagged.apply(this, [pokemon, ...args]);
            if (origAbils) pokemon.abilities = origAbils;
            return res;
        }};
    }}

    // Try to apply when loaded
    function initTranslations() {{
        applyTranslations(window.BattlePokedex, koPokemon);
        applyTranslations(window.BattleMovedex, koMoves);
        applyTranslations(window.BattleAbilities, koAbilities);
        applyTranslations(window.BattleItems, koItems);
        wrapSearchRender();
    }}

    // If already loaded
    if (window.BattlePokedex) {{
        initTranslations();
    }} else {{
        // Or wait for load
        window.addEventListener('load', initTranslations);
    }}
}})();
"""
    with open('play.pokemonshowdown.com/js/ko-data.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print("Successfully generated play.pokemonshowdown.com/js/ko-data.js")

if __name__ == "__main__":
    main()
