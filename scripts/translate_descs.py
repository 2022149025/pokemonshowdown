"""
Rule-based Korean translator for Pokemon Showdown move/ability shortDesc strings.
Handles the highly formulaic patterns used in Showdown descriptions.

Usage:
    python scripts/translate_descs.py
Output:
    play.pokemonshowdown.com/js/ko-desc.js  (overwrites previous version)
"""

import re
import json
import urllib.request
import ssl

# SSL 인증서 오류 방지
ssl._create_default_https_context = ssl._create_unverified_context

WIKI_URLS = {
    'moves': 'https://pokemon.fandom.com/ko/wiki/%EA%B8%B0%EC%88%A0_%EB%AA%A9%EB%A1%9D',   # 기술 목록
    'abilities': 'https://pokemon.fandom.com/ko/wiki/%ED%8A%B9%EC%84%B1_%EB%AA%A9%EB%A1%9D', # 특성 목록
}

STAT = {
    'Attack': '공격', 'Defense': '방어', 'Sp. Atk': '특수공격', 'Sp. Def': '특수방어',
    'Speed': '스피드', 'accuracy': '명중률', 'evasiveness': '회피율', 'evasion': '회피율',
    'HP': 'HP', 'all stats': '모든 능력치'
}
SUBJ = {
    'target': '상대', 'the target': '상대', 'user': '사용자', 'the user': '사용자',
    'foe': '상대', 'the foe': '상대', 'foe(s)': '상대들', 'the foe(s)': '상대들',
    'adjacent foes': '인접한 상대들', 'adjacent Pokemon': '인접한 포켓몬',
    'ally': '아군', 'an ally': '아군', 'the ally': '아군'
}
STATUS_VERB = {
    'burn': ('화상을 입힌다', ''), 'freeze': ('얼린다', ''), 'paralyze': ('마비시킨다', ''),
    'poison': ('독 상태로 만든다', ''), 'confuse': ('혼란시킨다', ''), 'flinch': ('풀죽게 만든다', ''),
    'sleep': ('잠들게 한다', ''), 'badly poison': ('맹독 상태로 만든다', '')
}

VOCAB = {
    'burn': '화상', 'freeze': '얼음', 'paralyze': '마비', 'poison': '독',
    'sleep': '수면', 'confuse': '혼란', 'flinch': '풀죽음'
}

def sub_vocab(text):
    for k, v in VOCAB.items():
        text = re.sub(rf'\b{k}\b', v, text, flags=re.IGNORECASE)
    return text

# ── main translation function ───────────────────────────────────────────────

def translate(eng):
    t = eng.strip().rstrip(".")

    # ── 0. trivial ──────────────────────────────────────────────────────────
    TRIVIAL = {
        # ==================================================================
        # 기술 설명 (Move Descriptions)
        # ==================================================================
        # ── basic ──
        "No additional effect": "추가 효과 없음",
        "No additional effect.": "추가 효과 없음.",
        "No additional effect. Hits foe(s).": "추가 효과 없음. 상대들에게 공격.",
        "No competitive use.": "실전에서 효용 없음.",
        "High critical hit ratio": "급소에 맞기 쉽다",
        "High critical hit ratio.": "급소에 맞기 쉽다.",
        "Very high critical hit ratio": "급소에 매우 맞기 쉽다",
        "This move does not check accuracy": "이 기술은 명중률 계산을 하지 않는다.",
        "This move does not check accuracy.": "이 기술은 명중률 계산을 하지 않는다.",
        "Usually goes first": "선제공격",
        "Usually goes first.": "선제공격.",
        "Usually goes last": "반드시 나중에 발동",
        "Nearly always goes first.": "거의 항상 선제공격.",
        "Nearly always goes first. First turn out only.": "처음 나온 턴에만, 거의 항상 선제공격.",
        "Hits first. First turn out only. 100% flinch chance.": "처음 나온 턴에만 선제공격. 100% 풀죽음.",
        "Usually goes first. Fails if target is not attacking.": "선제공격. 상대가 공격 기술을 사용하지 않으면 실패.",
        "Usually goes first. Hits 2-5 times in one turn.": "선제공격. 1턴에 2~5회 연속 공격.",
        "Always leaves the target with at least 1 HP.": "항상 상대를 최소 1 HP로 남긴다.",
        "Always leaves opponent with 1 HP.": "항상 상대를 1 HP로 남긴다.",
        "30% chance to make the target flinch.": "30% 확률로 상대를 풀죽게 만든다.",
        "Power is equal to the base move's Z-Power.": "위력은 베이스 기술의 Z파워와 같다.",
        # ── multi-hit ──
        "Hits 2 times in one turn.": "1턴에 2회 연속으로 공격.",
        "Hits 2-5 times in one turn": "1번의 턴에 2~5회 연속으로 공격",
        "Hits 2-5 times in one turn.": "1턴에 2~5회 연속 공격.",
        "Hits twice": "2회 연속으로 공격",
        "Hits twice.": "2회 연속으로 공격.",
        "Hits twice. Doubles: Tries to hit each foe once.": "2회 연속 공격. 더블배틀: 각 상대를 1회씩 공격 시도.",
        "Hits 5 times": "5회 연속으로 공격",
        "Hits 5 times.": "5회 연속으로 공격.",
        "Hits 3 times": "3회 연속으로 공격",
        "Hits 3 times.": "3회 연속으로 공격.",
        "Hits 2 times": "2회 연속으로 공격",
        "Hits 10 times.": "10회 연속으로 공격.",
        "Hits the foe(s) twice": "상대들을 2회 연속으로 공격",
        # ── HP recovery ──
        "User recovers 50% of the damage dealt": "가한 데미지의 50%를 HP로 회복",
        "User recovers 75% of the damage dealt": "가한 데미지의 75%를 HP로 회복",
        "User recovers 1/2 of the damage dealt": "가한 데미지의 1/2을 HP로 회복",
        "User recovers 3/4 of the damage dealt": "가한 데미지의 3/4을 HP로 회복",
        "User recovers 3/4 of the damage dealt": "가한 데미지의 3/4을 HP로 회복",
        "User recovers 33% of the damage dealt": "가한 데미지의 33%를 HP로 회복",
        "User recovers 1/16 max HP per turn": "매 턴 최대 HP의 1/16을 회복",
        "User gains 1/2 HP inflicted. Sleeping target only.": "잠든 상대에게만 사용 가능. 가한 데미지의 1/2을 HP로 회복.",
        "User sleeps 2 turns and restores HP and status.": "2턴 동안 잠들며 HP와 상태이상을 회복한다.",
        "Heals the user by 50% of its max HP.": "사용자의 최대 HP의 50%를 회복한다.",
        "User and allies: healed 1/4 max HP, status cured.": "사용자와 아군: 최대 HP 1/4 회복, 상태이상 치유.",
        # ── cure/status ──
        "Cures the user's party of all status conditions": "아군 파티의 모든 상태이상을 낫게 한다",
        "Cures the user of its burn, poison, or paralysis": "사용자의 화상·독·마비를 낫게 한다",
        "User cures its burn, poison, or paralysis.": "사용자의 화상·독·마비를 낫게 한다.",
        "Cures target's status; heals user 1/2 max HP if so.": "상대의 상태이상을 치료. 치료했으면 사용자 최대 HP 1/2 회복.",
        "Cures the user's status.": "사용자의 상태이상을 회복한다.",
        "The target is cured of its burn.": "상대의 화상을 낫게 한다.",
        # ── power doubles ──
        "Power doubles if the user has no held item": "도구를 소지하지 않을 때 위력 2배",
        "Power doubles if the user is burned, poisoned, or paralyzed": "사용자가 화상·독·마비 상태일 때 위력 2배",
        "Power doubles during Bounce, Fly, and Sky Drop.": "바운스·비행·스카이드롭 중인 상대에게 위력 2배.",
        "Power doubles and type varies in each weather.": "날씨에 따라 타입과 위력이 2배로 변한다.",
        "Power doubles if target was damaged this turn.": "이 턴에 상대가 데미지를 받았으면 위력 2배.",
        "Power doubles with each hit, up to 160.": "맞을 때마다 위력이 2배씩 증가, 최대 160.",
        "Power doubles with each hit. Repeats for 5 turns.": "맞을 때마다 위력 2배. 5턴간 반복.",
        "Power doubles with each hit.": "맞을 때마다 위력이 2배가 된다.",
        "Power increases when used on consecutive turns.": "연속 사용 시 위력 증가.",
        "Power is equal to the base move's Z-Power.": "기본 기술의 Z위력과 동일.",
        "Has a 30% chance this move's power is doubled.": "30% 확률로 이 기술의 위력이 2배.",
        "During Sunny Day: 1.5x damage instead of half.": "맑음 날씨: 위력 절반 대신 1.5배.",
        "During Electric Terrain: 1.5x power.": "일렉트릭 필드 중: 위력 1.5배.",
        "2x power if target is grounded in Electric Terrain.": "전기 필드 중 지상에 있는 상대에게 위력 2배.",
        "2x power if the user had a stat lowered this turn.": "이 턴에 사용자의 능력치가 낮아졌으면 위력 2배.",
        "1.5x damage if foe holds an item. Removes item.": "상대가 도구를 소지 중이면 1.5배 데미지. 도구 박탈.",
        "1/8 of target's HP is restored to user every turn.": "매 턴 상대 최대 HP의 1/8을 흡수.",
        "A sleeping target is hurt by 1/4 max HP per turn.": "잠든 상대에게 매 턴 최대 HP 1/4의 데미지.",
        "Deals 1.3333x damage with supereffective hits.": "효과가 굉장한 공격 시 1.333배 데미지.",
        "Deals 1/8 max HP each turn; 1/4 on Steel, Water.": "매 턴 최대 HP 1/8의 데미지. 강철·물 타입에는 1/4.",
        "Always 160 power. Ignores Abilities.": "위력 항상 160. 특성 무시.",
        "Always does 20 HP of damage.": "항상 20의 데미지를 준다.",
        "Always results in a critical hit.": "반드시 급소에 맞는다.",
        "Always results in a critical hit. Hits foe(s).": "반드시 급소에 맞는다. 상대들에게 공격.",
        # ── stat changes (multi-stat) ──
        "Raises the user's Attack, Sp. Atk, and Speed by 2": "사용자의 공격·특공·스피드를 2랭크 올린다",
        "Raises the user's Attack, Defense, Sp. Atk, Sp. Def, and Speed by 1": "사용자의 모든 능력치를 1랭크 올린다",
        "Raises the user's Sp. Atk and Sp. Def by 1": "사용자의 특공·특방을 1랭크 올린다",
        "Raises the user's Attack and Speed by 1": "사용자의 공격·스피드를 1랭크 올린다",
        "Raises the user's Attack and Defense by 1": "사용자의 공격·방어를 1랭크 올린다",
        "Raises the user's Defense and Sp. Def by 2": "사용자의 방어·특방을 2랭크 올린다",
        "Raises the user's Attack and Sp. Atk by 1": "사용자의 공격·특공을 1랭크 올린다",
        "Lowers the user's Defense and Sp. Def by 1": "사용자의 방어·특방을 1랭크 낮춘다",
        "Lowers the user's Attack and Defense by 1": "사용자의 공격·방어를 1랭크 낮춘다",
        "Lowers the target's Attack and Sp. Atk by 1": "상대의 공격·특공을 1랭크 낮춘다",
        "Lowers the foe(s) Attack and Sp. Atk by 1": "상대들의 공격·특공을 1랭크 낮춘다",
        "Raises a random stat of the user or an ally by 2.": "사용자 또는 아군의 무작위 능력치를 2랭크 올린다.",
        "Raises a random stat of the user or an ally by 2": "사용자 또는 아군의 무작위 능력치를 2랭크 올린다",
        "+1 SpD, user's next Electric move 2x power.": "특방 1랭크 상승. 다음 전기 기술 위력 2배.",
        "+2 Attack, Sp. Atk, Speed for 1/2 user's max HP.": "최대 HP 1/2 소비. 공격·특공·스피드 2랭크 상승.",
        "+50 power for each of the user's stat boosts.": "사용자의 능력치 상승 1랭크당 위력 +50.",
        "+50 power for each time user was hit. Max 6 hits.": "맞은 횟수당 위력 +50. 최대 6회.",
        "+50 power for each time a party member fainted.": "아군이 쓰러진 횟수당 위력 +50.",
        "-1 evasion; ends user and target hazards/terrain.": "회피율 -1랭크. 사용자·상대 측 장해물·필드 해제.",
        "Eliminates all stat changes.": "모든 능력치 변화를 제거한다.",
        "Steals target's boosts before dealing damage.": "데미지를 주기 전에 상대의 능력치 상승분을 빼앗는다.",
        "Inverts the target's stat stages.": "상대의 능력치 변화를 뒤집는다.",
        "Swaps all stat changes with target.": "상대와 모든 능력치 변화를 교환한다.",
        "Copies target's stats, moves, types, and Ability.": "상대의 능력치·기술·타입·특성을 복사한다.",
        # ── compound status ──
        "10% chance to burn. 10% chance to flinch.": "10% 확률로 화상. 10% 확률로 풀죽음.",
        "10% chance to freeze. 10% chance to flinch.": "10% 확률로 얼음 상태. 10% 확률로 풀죽음.",
        "10% chance to freeze. Super effective on Water.": "10% 확률로 얼음 상태. 물 타입에 효과 특대.",
        "10% chance to frz foe(s). Ramnarok transforms.": "10% 확률로 상대들 얼음 상태. 사용 후 형태 변경.",
        "10% chance to paralyze. 10% chance to flinch.": "10% 확률로 마비. 10% 확률로 풀죽음.",
        "10% chance to raise all stats by 1 (not acc/eva).": "10% 확률로 모든 능력치를 1랭크 올린다.",
        "10% chance to raise all stats by 1 (not acc/eva).": "명중률·회피율 외 모든 능력치를 10% 확률로 1랭크 올린다.",
        "100% burns a target that had a stat rise this turn.": "이 턴에 능력치가 올라간 상대에게 100% 확률로 화상.",
        "100% confuse target that had a stat rise this turn.": "이 턴에 능력치가 올라간 상대를 100% 확률로 혼란.",
        "100% flinch. Fails unless target using priority.": "100% 풀죽음. 상대가 선제 기술 사용 중일 때만 성공.",
        "20% burn. Recovers 50% dmg dealt. Thaws foe(s).": "20% 확률로 화상. 가한 데미지의 50% HP 회복. 상대들 얼음 해제.",
        "20% chance to paralyze or burn or freeze target.": "20% 확률로 마비·화상·얼음 중 하나의 상태이상.",
        "20% psn. Physical+contact if it would be stronger.": "20% 확률로 독. 물리·접촉 기술이 더 강하면 그쪽 사용.",
        "30% chance to lower the foe(s) Sp. Def by 1.": "30% 확률로 상대들의 특방을 1랭크 낮춘다.",
        "30% chance to confuse target. Can't miss in rain.": "30% 확률로 혼란. 비가 올 때 반드시 명중.",
        "30% chance to paralyze. Can't miss in rain.": "30% 확률로 마비. 비가 올 때 반드시 명중.",
        "30% burn. 2x power if target is already statused.": "30% 확률로 화상. 상대가 상태이상이면 위력 2배.",
        "30% confusion. User loses 50% max HP if miss.": "30% 확률로 혼란. 빗나가면 사용자 최대 HP 50% 감소.",
        "20% chance to burn foe(s). Can't miss in rain.": "20% 확률로 상대들에게 화상. 비가 올 때 반드시 명중.",
        "20% chance to paralyze foe(s). Rain: can't miss.": "20% 확률로 상대들 마비. 비가 올 때 반드시 명중.",
        "50% chance to sleep, poison, or paralyze target.": "50% 확률로 잠듦·독·마비 중 하나의 상태이상.",
        "High critical hit ratio. 10% chance to burn.": "급소에 맞기 쉽다. 10% 확률로 화상.",
        "High critical hit ratio. 10% chance to poison.": "급소에 맞기 쉽다. 10% 확률로 독 상태.",
        "High critical hit ratio. Cannot be redirected.": "급소에 맞기 쉽다. 공격 대상 변경 불가.",
        "High critical hit ratio. Hits adjacent foes.": "급소에 맞기 쉽다. 인접한 상대 모두 공격.",
        "High critical hit ratio. Type depends on user's form.": "급소에 맞기 쉽다. 타입은 사용자의 폼에 따라 변한다.",
        "High critical hit ratio. 50% chance to burn.": "급소에 맞기 쉽다. 50% 확률로 화상.",
        "100% chance raise user Speed by 1. High crit.": "100% 확률로 스피드 1랭크 상승. 급소에 맞기 쉽다.",
        # ── gender / attract ──
        "A target of the opposite gender gets infatuated.": "이성의 상대가 헤롱헤롱 상태가 된다.",
        "40, 80, 120 power, or heals target 1/4 max HP.": "40, 80, 120 위력 중 하나, 또는 상대 최대 HP 1/4 회복.",
        # ── terrain / field ──
        "5 turns. Can't status,-Dragon power vs grounded.": "5턴 지속. 상태이상·드래곤 기술 위력 감소 (지상 포켓몬 대상).",
        "5 turns. Grounded: +Electric power, can't sleep.": "5턴 지속. 지상: 전기 기술 위력 증가, 잠들 수 없음.",
        "5 turns. Grounded: +Grass power, +1/16 max HP.": "5턴 지속. 지상: 풀 기술 위력 증가, 매 턴 최대 HP 1/16 회복.",
        "5 turns. Grounded: +Psychic power, priority-safe.": "5턴 지속. 지상: 에스퍼 기술 위력 증가, 선제 기술 무효.",
        "For 5 turns, Electric-type attacks have 1/3 power.": "5턴 동안 전기 타입 기술의 위력이 1/3로 감소.",
        "For 5 turns, Fire-type attacks have 1/3 power.": "5턴 동안 불꽃 타입 기술의 위력이 1/3로 감소.",
        "For 5 turns, a sandstorm rages. Rock: 1.5x SpD.": "5턴 동안 모래바람. 바위 타입: 특방 1.5배.",
        "For 5 turns, all held items have no effect.": "5턴 동안 모든 도구 효과 무효.",
        "For 5 turns, damage to allies halved. Snow only.": "5턴 동안 아군이 받는 데미지 절반 (눈 날씨 중에만).",
        "For 5 turns, hail crashes down.": "5턴 동안 싸라기눈이 내린다.",
        "For 5 turns, heavy rain powers Water moves.": "5턴 동안 폭우. 물 기술 강화.",
        "For 5 turns, intense sunlight powers Fire moves.": "5턴 동안 강한 햇살. 불꽃 기술 강화.",
        "For 5 turns, physical damage to allies is halved.": "5턴 동안 아군이 받는 물리 데미지 절반.",
        "For 5 turns, protects user's party from stat drops.": "5턴 동안 아군 파티의 능력치 감소를 막는다.",
        "For 5 turns, protects user's party from status.": "5턴 동안 아군 파티의 상태이상을 막는다.",
        "For 5 turns, shields user's party from critical hits.": "5턴 동안 아군 파티의 급소를 막는다.",
        "For 5 turns, special damage to allies is halved.": "5턴 동안 아군이 받는 특수 데미지 절반.",
        "Lasts 3 turns. Active Pokemon cannot fall asleep.": "3턴 동안 필드의 포켓몬이 잠들 수 없다.",
        "Ends the effects of terrain.": "필드 효과를 해제한다.",
        "Fails if there is no terrain active. Ends the terrain.": "필드가 없으면 실패. 필드 해제.",
        "Swaps user's field effects with the opposing side.": "사용자 측의 필드 효과를 상대 측과 교환한다.",
        "Destroys screens. Type depends on user's form.": "리플렉터·빛의 장막 해제. 타입은 사용자 폼에 따라 변한다.",
        # ── user effects ──
        "User cannot move next turn": "사용자는 다음 턴에 움직일 수 없다",
        "User cannot move next turn.": "사용자는 다음 턴에 움직일 수 없다.",
        "User switches out.": "사용자가 교체된다.",
        "User switches, passing stat changes and more.": "사용자가 교체되며 능력치 변화 등을 후속 포켓몬에게 넘긴다.",
        "User faints. Next hurt Pokemon is fully healed.": "사용자가 쓰러진다. 다음에 데미지를 받은 포켓몬의 HP가 전부 회복.",
        "User faints. User on Misty Terrain: 1.5x power.": "사용자가 쓰러진다. 미스트 필드 중이면 위력 1.5배.",
        "User loses 1/4 of its max HP.": "사용자의 최대 HP 1/4 감소.",
        "User loses 50% max HP.": "사용자의 최대 HP 50% 감소.",
        "User loses 33% max HP.": "사용자의 최대 HP 33% 감소.",
        "User is hurt by 50% of its max HP if it misses.": "빗나가면 사용자 최대 HP 50% 감소.",
        "User must be asleep. Uses another known move.": "사용자가 잠든 상태여야 한다. 알고 있는 다른 기술을 랜덤으로 사용.",
        "User must be asleep. 30% chance to flinch target.": "사용자가 잠든 상태여야 한다. 30% 확률로 상대 풀죽음.",
        "User must be asleep. Uses another known move.": "사용자가 잠든 상태여야 한다. 알고 있는 다른 기술을 랜덤으로 사용.",
        "User must take physical damage before moving.": "사용자가 물리 데미지를 받아야만 발동.",
        "User on Grassy Terrain: +1 priority.": "그래시 필드 중 사용자: 우선도 +1.",
        "User on Psychic Terrain: 1.5x power, hits foes.": "사이코 필드 중 사용자: 위력 1.5배, 상대들 공격.",
        "User on terrain: power doubles, type varies.": "필드 위: 위력 2배, 타입 변화.",
        "User restores 1/2 its max HP; 2/3 in Sandstorm.": "최대 HP의 1/2 회복. 모래바람 중에는 2/3.",
        "User takes 1/2 its max HP to pass a substitute.": "최대 HP 1/2을 소비해 분신을 넘긴다.",
        "User takes 1/4 its max HP to put in a substitute.": "최대 HP 1/4을 소비해 분신을 만든다.",
        "User takes sure-hit 2x damage until its next turn.": "다음 턴까지 반드시 맞는 2배의 데미지를 받는다.",
        "User's Electric type: typeless; must be Electric.": "사용자가 전기 타입인 경우 노말 타입으로 변환해 사용.",
        "User's Fire type becomes typeless; must be Fire.": "사용자가 불꽃 타입인 경우 노말 타입으로 변환해 사용.",
        "User steals certain support moves to use itself.": "상대의 일부 변화 기술을 빼앗아 사용한다.",
        "User survives attacks this turn with at least 1 HP.": "이 턴에 받는 공격으로 최소 1 HP 이상 남겨 버틴다.",
        "User and ally swap positions; using again can fail.": "사용자와 아군의 위치를 바꾼다. 연속 사용 시 실패할 수 있다.",
        "User and ally's Abilities become target's Ability.": "사용자와 아군의 특성이 상대의 특성으로 변한다.",
        "User and foe fly up turn 1. Damages on turn 2.": "1턴째에 사용자와 상대가 날아오르고, 2턴째에 데미지.",
        "User becomes a copy of the target.": "상대와 똑같이 변신한다.",
        # ── target effects ──
        "Prevents the target from switching out": "상대를 교체 불가 상태로 만든다",
        "Prevents the target from using status moves": "상대의 변화 기술 사용을 봉인한다",
        "Prevents both user and target from switching out.": "사용자와 상대 모두 교체 불가.",
        "Prevents all Pokemon from switching next turn.": "다음 턴에 모든 포켓몬이 교체 불가.",
        "Permanently copies the last move target used.": "상대가 마지막에 사용한 기술을 영구적으로 복사한다.",
        "Permanently copies the last move target used.": "상대가 마지막에 사용한 기술을 영구적으로 복사한다.",
        "Target can't select the same move twice in a row.": "상대는 같은 기술을 연속으로 선택할 수 없다.",
        "Target can't use status moves its next 3 turns.": "상대는 다음 3턴 동안 변화 기술을 사용할 수 없다.",
        "Target repeats its last move for its next 3 turns.": "상대는 다음 3턴 동안 마지막으로 사용한 기술을 반복한다.",
        "Target's foes' moves are redirected to it this turn.": "이 턴에 상대 측의 기술이 이 포켓몬을 향한다.",
        "The target immediately uses its last used move.": "상대가 즉시 마지막으로 사용한 기술을 발동한다.",
        "The target makes its move right after the user.": "상대가 사용자 바로 다음에 행동한다.",
        "The target's Ability becomes Insomnia.": "상대의 특성이 불면이 된다.",
        "The target's Ability becomes Truant.": "상대의 특성이 게으름이 된다.",
        "The target's Ability becomes Simple.": "상대의 특성이 단순이 된다.",
        "For 3 turns, target floats but moves can't miss it.": "3턴 동안 상대가 공중 뜨기 상태가 되며 기술이 반드시 명중.",
        # ── self/type ──
        "Changes user's type by terrain (default Normal).": "필드에 따라 사용자의 타입이 변한다 (기본 노말).",
        "Changes user's type to match its first move.": "사용자의 첫 번째 기술에 맞게 타입이 변한다.",
        "Changes user's type to resist target's last move.": "상대의 마지막 기술에 저항하는 타입으로 변한다.",
        "Normal moves become Electric type this turn.": "이 턴에 노말 타입 기술이 전기 타입이 된다.",
        "Combines Flying in its type effectiveness.": "타입 상성에 비행 타입을 추가.",
        "Type varies based on the held Drive.": "소지한 카세트에 따라 타입이 변한다.",
        "Type varies based on the held Memory.": "소지한 메모리에 따라 타입이 변한다.",
        "Type varies based on the held Plate.": "소지한 플레이트에 따라 타입이 변한다.",
        "Fighting, Normal hit Ghost. Evasiveness ignored.": "격투·노말 타입이 고스트에 효과 있음. 회피율 무시.",
        "Psychic hits Dark. Evasiveness ignored.": "에스퍼 타입이 악 타입에 효과 있음. 회피율 무시.",
        # ── protection ──
        "Bounces back certain non-damaging moves.": "일부 비공격 변화 기술을 되돌린다.",
        "Bounces turn 1. Hits turn 2. 30% paralyze.": "1턴째 튀어 오르고, 2턴째 공격. 30% 확률로 마비.",
        "Bypasses protection without breaking it.": "방어를 무력화하지 않고 통과한다.",
        "Bypasses Substitute.": "분신을 무시한다.",
        "Nullifies Detect, Protect, and Quick/Wide Guard.": "방어·막기·퀵가드·와이드가드를 무효화한다.",
        "Protects allies from Status moves this turn.": "이 턴에 아군을 변화 기술로부터 보호한다.",
        "Protects allies from damaging attacks. Turn 1 only.": "처음 나온 턴에만 아군을 공격 기술로부터 보호한다.",
        "Protects allies from multi-target moves this turn.": "이 턴에 아군을 복수 대상 기술로부터 보호한다.",
        "Protects allies from priority attacks this turn.": "이 턴에 아군을 선제 공격 기술로부터 보호한다.",
        "Protects from damaging attacks. Contact: burn.": "공격 기술로부터 보호. 접촉 기술 사용 시 상대에게 화상.",
        "Protects from moves. Contact: loses 1/8 max HP.": "기술로부터 보호. 접촉 기술: 상대 최대 HP 1/8 감소.",
        "Protects from moves. Contact: poison.": "기술로부터 보호. 접촉 기술: 독 상태.",
        "Protects user from moves & Max Moves this turn.": "이 턴에 사용자를 기술 및 다이맥스 기술로부터 보호.",
        "Protects user from moves & Max Moves. Contact: -2 Atk.": "기술 및 다이맥스 기술로부터 보호. 접촉 기술: 상대 공격 -2랭크.",
        "Bypasses protection without breaking it.": "보호를 파괴하지 않고 통과한다.",
        "If hit by an attack, returns 1.5x damage.": "공격받으면 받은 데미지의 1.5배를 돌려준다.",
        "If hit by physical attack, returns double damage.": "물리 기술에 맞으면 받은 데미지의 2배를 돌려준다.",
        "If hit by physical attack, returns double damage.": "물리 공격을 받으면 2배로 돌려준다.",
        "If hit by special attack, returns double damage.": "특수 기술에 맞으면 받은 데미지의 2배를 돌려준다.",
        # ── hazards / terrain setup ──
        "Sets a layer of Spikes on the opposing side.": "상대 측에 압정 1층을 깔아 놓는다.",
        "Hurts foes on switch-in. Factors Rock weakness.": "상대 포켓몬이 교체될 때 데미지. 바위 타입 약점 반영.",
        "Hurts grounded foes on switch-in. Max 3 layers.": "지상 상대 포켓몬이 교체될 때 데미지. 최대 3층.",
        "Poisons foes, frees user from hazards/bind/leech.": "상대를 독 상태로 만들고, 사용자의 장해물·속박·씨뿌리기 해제.",
        "Poisons grounded foes on switch-in. Max 2 layers.": "지상 상대 포켓몬이 교체될 때 독 상태. 최대 2층.",
        "Summons Leech Seed.": "씨뿌리기 상태로 만든다.",
        "Summons Aurora Veil.": "오로라베일을 친다.",
        "Summons Light Screen.": "빛의 장막을 친다.",
        "Summons Psychic Terrain.": "사이코 필드를 펼친다.",
        "Summons Reflect.": "리플렉터를 친다.",
        "Baddybad.": "반사막을 친다.",
        "Starts Snow. User switches out.": "눈 날씨 시작 후 사용자가 교체된다.",
        # ── misc mechanics ──
        "Flies up on first turn, then strikes the next turn.": "1턴째에 날아오르고, 2턴째에 공격.",
        "Digs underground turn 1, strikes turn 2.": "1턴째에 땅으로 파고들고, 2턴째에 공격.",
        "Dives underwater turn 1, strikes turn 2.": "1턴째에 물 속으로 잠수하고, 2턴째에 공격.",
        "Charges turn 1. Hits turn 2. 30% burn.": "1턴째 충전, 2턴째 공격. 30% 확률로 화상.",
        "Charges turn 1. Hits turn 2. 30% paralyze.": "1턴째 충전, 2턴째 공격. 30% 확률로 마비.",
        "Charges turn 1. Hits turn 2. No charge in sunlight.": "1턴째 충전, 2턴째 공격. 맑은 날씨에는 즉시 발동.",
        "Charges, then hits foe(s) turn 2. High crit ratio.": "충전 후 2턴째에 상대들을 공격. 급소에 맞기 쉽다.",
        "Charges, then hits turn 2. 30% flinch. High crit.": "충전 후 2턴째에 공격. 30% 풀죽음. 급소에 맞기 쉽다.",
        "Disappears turn 1. Hits turn 2. Breaks protection.": "1턴째에 사라지고, 2턴째에 공격. 보호 기술을 무시.",
        "Hits two turns after being used.": "사용 2턴 후에 공격한다.",
        "Can hit Pokemon using Bounce, Fly, or Sky Drop.": "바운스·비행·스카이드롭 사용 중인 포켓몬도 공격 가능.",
        "Copies a foe at 1.5x power. User must be faster.": "상대의 기술을 1.5배 위력으로 복사한다. 사용자가 더 빨라야 한다.",
        "Copies a foe at 1.5x power. User must be faster.": "상대의 기술을 1.5배 위력으로 복사. 사용자가 더 빠른 경우에만.",
        "Cannot be selected the turn after it's used.": "사용 다음 턴에는 선택할 수 없다.",
        "If a foe is switching out, hits it at 2x power.": "상대가 교체 중이면 2배 위력으로 공격.",
        "Goes last. For 5 turns, turn order is reversed.": "나중에 발동. 5턴 동안 행동 순서가 역전된다.",
        "Does damage equal to 1/2 target's current HP.": "상대의 현재 HP의 1/2의 데미지.",
        "Does damage equal to 3/4 target's current HP.": "상대의 현재 HP의 3/4의 데미지.",
        "Does damage equal to the user's HP.": "사용자의 남은 HP만큼 데미지.",
        "More power the fewer PP this move has left.": "남은 PP가 적을수록 위력이 높아진다.",
        "More power with more uses of Stockpile.": "저축한 횟수만큼 위력이 높아진다.",
        "Max 102 power at maximum Happiness.": "친밀도가 최대일 때 최고 위력 102.",
        "Max 102 power at minimum Happiness.": "친밀도가 최소일 때 최고 위력 102.",
        "Max happiness: 102 power. Can't miss.": "최대 친밀도 시 위력 102. 반드시 명중.",
        "Random damage equal to 0.5x-1.5x user's level.": "사용자 레벨의 0.5~1.5배의 랜덤 데미지.",
        "All active Pokemon consume held Berries.": "모든 포켓몬이 소지한 나무열매를 즉시 사용한다.",
        "All active Pokemon will faint in 3 turns.": "3턴 후 모든 포켓몬이 쓰러진다.",
        "Ally: Crit ratio +1, or +2 if ally is Dragon type.": "아군의 급소율 +1. 드래곤 타입 아군이면 +2.",
        "One adjacent ally's move power is 1.5x this turn.": "이번 턴에 인접한 아군의 기술 위력이 1.5배가 된다.",
        "One adjacent ally's move power is 1.5x this turn.": "이 턴에 인접한 아군 1마리의 기술 위력이 1.5배.",
        "Until the end of the next turn, user's moves crit.": "다음 턴이 끝날 때까지 사용자의 기술이 급소에 맞는다.",
        "Ignores the Abilities of other Pokemon.": "다른 포켓몬의 특성을 무시한다.",
        "Ignores the target's stat stage changes.": "상대의 능력치 변화를 무시한다.",
        "OHKOs non-Ice targets. Fails if user's lower level.": "얼음 타입 이외의 상대를 일격 기절. 상대가 레벨이 높으면 실패.",
        "Less power as user's HP decreases. Hits foe(s).": "사용자의 HP가 낮을수록 위력이 감소. 상대들에게 공격.",
        "If using a Fire move, target loses 1/4 max HP.": "불꽃 기술 사용 시 상대의 최대 HP 1/4 감소.",
        "Base move affects power. 50% restores Berries.": "기본 기술 위력 반영. 50% 확률로 나무열매 복원.",
        "Base move affects power. Allies: +1/6 max HP.": "기본 기술 위력 반영. 아군: 최대 HP 1/6 회복.",
        "Base move affects power. Allies: Aurora Veil.": "기본 기술 위력 반영. 아군: 오로라베일.",
        "Base move affects power. Allies: Crit Ratio +1.": "기본 기술 위력 반영. 아군: 급소율 +1.",
        "Base move affects power. Allies: status cured.": "기본 기술 위력 반영. 아군: 상태이상 치유.",
        "Base move affects power. Bypasses Max Guard.": "기본 기술 위력 반영. 다이맥스 방어 무시.",
        "Base move affects power. Ends Terrain, hazards.": "기본 기술 위력 반영. 필드·장해물 해제.",
        "Base move affects power. Foes: -1/6 HP, 4 turns.": "기본 기술 위력 반영. 상대들: 4턴간 최대 HP 1/6 감소.",
        "Base move affects power. Foes: Stealth Rock.": "기본 기술 위력 반영. 상대들: 스텔스록.",
        "Base move affects power. Foes: Steel hazard.": "기본 기술 위력 반영. 상대들: 강철 장해물.",
        "Base move affects power. Foes: Tormented.": "기본 기술 위력 반영. 상대들: 도발 상태.",
        "Base move affects power. Foes: bound 4-5 turns.": "기본 기술 위력 반영. 상대들: 4~5턴 속박.",
        "Base move affects power. Foes: confused.": "기본 기술 위력 반영. 상대들: 혼란.",
        "Base move affects power. Foes: infatuated.": "기본 기술 위력 반영. 상대들: 헤롱헤롱.",
        "Base move affects power. Foes: last move -2 PP.": "기본 기술 위력 반영. 상대들: 마지막 기술 PP -2.",
        "Base move affects power. Foes: paralyzed.": "기본 기술 위력 반영. 상대들: 마비.",
        "Base move affects power. Foes: poisoned.": "기본 기술 위력 반영. 상대들: 독 상태.",
        "Base move affects power. Foes: psn or par.": "기본 기술 위력 반영. 상대들: 독 또는 마비.",
        "Base move affects power. Foes: slp or psn or par.": "기본 기술 위력 반영. 상대들: 잠듦·독·마비.",
        "Base move affects power. Foes: trapped.": "기본 기술 위력 반영. 상대들: 속박.",
        "Base move affects power. Starts Electric Terrain.": "기본 기술 위력 반영. 일렉트릭 필드 시작.",
        "Base move affects power. Starts Grassy Terrain.": "기본 기술 위력 반영. 그래시 필드 시작.",
        "Base move affects power. Starts Gravity.": "기본 기술 위력 반영. 중력 시작.",
        "Base move affects power. Starts Hail.": "기본 기술 위력 반영. 싸라기눈 시작.",
        "Base move affects power. Starts Misty Terrain.": "기본 기술 위력 반영. 미스트 필드 시작.",
        "Base move affects power. Starts Psychic Terrain.": "기본 기술 위력 반영. 사이코 필드 시작.",
        "Base move affects power. Starts Rain Dance.": "기본 기술 위력 반영. 빗속의댄스 시작.",
        "Base move affects power. Starts Sandstorm.": "기본 기술 위력 반영. 모래바람 시작.",
        "Base move affects power. Starts Sunny Day.": "기본 기술 위력 반영. 쨍쨍 날씨 시작.",
        "Base move affects power. Target: 50% Yawn.": "기본 기술 위력 반영. 상대: 50% 확률로 하품.",
        "Hits adjacent foes": "인접한 상대 모두에게 공격",
        "Hits adjacent foes. High critical hit ratio": "인접한 상대 모두 공격. 급소에 맞기 쉽다",
        "Hits adjacent Pokemon": "인접한 포켓몬 모두에게 공격",
        "Scatters coins.": "동전을 뿌린다.",
        "Revives a fainted Pokemon to 50% HP.": "쓰러진 포켓몬을 최대 HP 50%로 되살린다.",
        "Shares HP of user and target equally.": "사용자와 상대의 HP를 합산해 절반씩 나눈다.",
        "All active Pokemon consume held Berries.": "모든 포켓몬이 소지한 나무열매를 즉시 사용한다.",
        "Picks a random move.": "무작위 기술을 사용한다.",
        "Picks a random move.": "알고 있는 기술 중 무작위로 사용한다.",
        "Uses a random move known by a team member.": "파티 내 포켓몬이 알고 있는 기술 중 무작위로 사용.",
        "Uses the last move used in the battle.": "배틀에서 가장 마지막에 사용된 기술을 사용한다.",
        "Base move affects power. 50% restores Berries.": "기본 기술 위력 반영. 50% 확률로 나무열매 복원.",
        "Has 1/2 recoil.": "가한 데미지의 1/2의 반동 데미지.",
        "Has 1/4 recoil.": "가한 데미지의 1/4의 반동 데미지.",
        "Has 33% recoil.": "가한 데미지의 33%의 반동 데미지.",
        "Has 33% recoil. 10% chance to burn. Thaws user.": "33% 반동 데미지. 10% 확률로 화상. 사용자의 얼음 해제.",
        "Has 33% recoil. 10% chance to paralyze target.": "33% 반동 데미지. 10% 확률로 상대 마비.",
        "Has 50% recoil.": "가한 데미지의 50%의 반동 데미지.",
        "Heals 50% HP. Flying-type removed 'til turn ends.": "HP 50% 회복. 이 턴이 끝날 때까지 비행 타입 소실.",
        "Use with Grass or Fire Pledge for added effect.": "풀 서약 또는 불꽃 서약과 함께 사용하면 추가 효과.",
        "Use with Grass or Water Pledge for added effect.": "풀 서약 또는 물 서약과 함께 사용하면 추가 효과.",
        "Use with Fire or Water Pledge for added effect.": "불꽃 서약 또는 물 서약과 함께 사용하면 추가 효과.",
        "Traps/grounds user; heals 1/16 max HP per turn.": "사용자를 속박·지상 상태로 만들고 매 턴 최대 HP 1/16 회복.",
        "Waits 2 turns; deals double the damage taken.": "2턴 대기 후 그 동안 받은 데미지의 2배를 돌려준다.",
        "User switches out after damaging target.": "공격 후 사용자가 교체된다.",
        "User switches out after damaging the target.": "공격 후 사용자가 교체된다.",
        "User switches out after damaging the foe.": "공격 후 사용자가 교체된다.",
        "User switches out after damaging the foe(s).": "공격 후 사용자가 교체된다.",
        "User switches out after damaging the target(s).": "공격 후 사용자가 교체된다.",
        "Terapagos-Stellar: Stellar type, hits both foes.": "테라파고스-스텔라: 스텔라 타입으로 양쪽 상대를 공격.",
        # ── ability trivial ──
        "This Pokemon has no Ability.": "이 포켓몬은 특성이 없다.",
        "This Pokemon's moves have 1.5x power.": "기술의 위력이 1.5배가 된다.",
        "This Pokemon's moves have 2x power.": "기술의 위력이 2배가 된다.",
        "This Pokemon's moves have 1.3x power.": "기술의 위력이 1.3배가 된다.",
        "This Pokemon's moves have 1.2x power.": "기술의 위력이 1.2배가 된다.",
        "This Pokemon's moves have 1.1x power.": "기술의 위력이 1.1배가 된다.",
        "This Pokemon's moves have 1.33x power.": "기술의 위력이 1.33배가 된다.",
        "Does nothing.": "효과 없음.",
        "No competitive use.": "실전에서 효용 없음.",
        "This Pokemon cannot be burned. Gaining this Ability while burned cures it.":
            "이 포켓몬은 화상 상태가 되지 않는다. 화상 상태에서 이 특성을 얻으면 치료된다.",
        "This Pokemon cannot be frozen. Gaining this Ability while frozen cures it.":
            "이 포켓몬은 얼음 상태가 되지 않는다. 얼음 상태에서 이 특성을 얻으면 치료된다.",
        "This Pokemon cannot be paralyzed. Gaining this Ability while paralyzed cures it.":
            "이 포켓몬은 마비 상태가 되지 않는다. 마비 상태에서 이 특성을 얻으면 치료된다.",
        "This Pokemon cannot be poisoned. Gaining this Ability while poisoned cures it.":
            "이 포켓몬은 독 상태가 되지 않는다. 독 상태에서 이 특성을 얻으면 치료된다.",
        "This Pokemon cannot fall asleep. Gaining this Ability while asleep cures it.":
            "이 포켓몬은 잠들지 않는다. 잠든 상태에서 이 특성을 얻으면 치료된다.",
        "This Pokemon cannot be confused. Immune to Intimidate.": "이 포켓몬은 혼란에 걸리지 않는다. 위협 효과를 받지 않는다.",
        "This Pokemon cannot be confused. Immune to Intimidate.":
            "이 포켓몬은 혼란 상태가 되지 않는다. 위협 특성 무효.",
        "This Pokemon cannot be infatuated or taunted. Immune to Intimidate.":
            "이 포켓몬은 헤롱헤롱·도발 상태가 되지 않는다. 위협 특성 무효.",
        "This Pokemon cannot be made to flinch. Immune to Intimidate.": "이 포켓몬은 풀죽지 않는다. 위협 효과를 받지 않는다.",
        "This Pokemon cannot be made to flinch. Immune to Intimidate.": "이 포켓몬은 풀죽지 않는다. 위협 효과를 받지 않는다.",
        "This Pokemon cannot be made to flinch. Immune to Intimidate.":
            "이 포켓몬은 풀죽지 않는다. 위협 효과를 받지 않는다.",
        "This Pokemon cannot be made to flinch. Immune to Intimidate.":
            "이 포켓몬은 풀죽지 않는다. 위협 특성 무효.",
        "This Pokemon cannot be statused, and is considered to be asleep.":
            "이 포켓몬은 상태이상이 되지 않으며, 항상 잠든 상태로 간주된다.",
        "This Pokemon cannot be struck by a critical hit.":
            "이 포켓몬은 급소에 맞지 않는다.",
        "This Pokemon cannot be forced to switch out by another Pokemon's attack or item.":
            "다른 포켓몬의 기술이나 도구로 강제 교체당하지 않는다.",
        "This Pokemon cannot lose its held item due to another Pokemon's Ability or attack.":
            "다른 포켓몬의 특성이나 기술로 소지 도구를 잃지 않는다.",
        "This Pokemon and its allies are protected from opposing priority moves.":
            "이 포켓몬과 아군은 상대의 선제 기술로부터 보호된다.",
        "This Pokemon and its allies cannot be poisoned. On switch-in, cures poisoned allies.":
            "이 포켓몬과 아군은 독 상태가 되지 않는다. 등장 시 독 상태의 아군을 치료.",
        "This Pokemon and its allies cannot fall asleep; those already asleep do not wake up.":
            "이 포켓몬과 아군은 잠들지 않는다. 이미 잠든 포켓몬은 깨어나지 않는다.",
        "This Pokemon and its allies' Steel-type moves have their power multiplied by 1.5.": "이 포켓몬과 아군의 강철 타입 기술 위력이 1.5배가 된다.",
        "This Pokemon and its allies' Steel-type moves have their power multiplied by 1.5.":
            "이 포켓몬과 아군의 강철 타입 기술 위력이 1.5배.",
        "This Pokemon appears as the last Pokemon in the party until it takes direct damage.":
            "직접 공격을 받기 전까지 파티의 마지막 포켓몬으로 표시된다.",
        "This Pokemon can only be damaged by direct attacks.":
            "이 포켓몬은 직접 공격으로만 데미지를 받는다.",
        "This Pokemon can only be damaged by supereffective moves and indirect damage.":
            "이 포켓몬은 효과 특대의 기술과 간접 데미지로만 피해를 받는다.",
        "This Pokemon can poison or badly poison a Pokemon regardless of its typing.":
            "타입에 관계없이 어떤 포켓몬에게도 독·맹독 상태를 줄 수 있다.",
        "This Pokemon copies the Ability of an ally that faints.": "아군이 쓰러지면 그 특성을 복사한다.",
        "This Pokemon copies the Ability of an ally that faints.":
            "아군이 쓰러질 때 그 포켓몬의 특성을 복사한다.",
        "This Pokemon damages those draining HP from it for as much as they would heal.":
            "HP를 흡수하는 상대에게 흡수량만큼 데미지를 준다.",
        "This Pokemon does not take damage from attacks made by its allies.":
            "아군의 공격으로 데미지를 받지 않는다.",
        "This Pokemon does not take recoil damage besides Struggle/Life Orb/crash damage.":
            "풀죽음·생명의구슬·충돌 데미지 외의 반동 데미지를 받지 않는다.",
        "This Pokemon eats Berries at 1/2 max HP or less instead of their usual 1/4 max HP.":
            "최대 HP 1/2 이하에서 나무열매를 사용한다 (통상 1/4 기준 대신).",
        "This Pokemon gains the Charge effect when hit by a wind move or Tailwind begins.":
            "바람 기술에 맞거나 순풍이 발동될 때 충전 상태가 된다.",
        "This Pokemon gains the Charge effect when it takes a hit from an attack.": "공격을 받으면 충전 상태가 된다.",
        "This Pokemon gains the Charge effect when it takes a hit from an attack.":
            "공격을 받으면 충전 상태가 된다.",
        "This Pokemon has a 30% chance to move first in its priority bracket with attacking moves.":
            "공격 기술 사용 시 30% 확률로 같은 우선도 내에서 먼저 행동.",
        "This Pokemon has a 33% chance to have its status cured at the end of each turn.":
            "매 턴 끝에 33% 확률로 상태이상이 치유된다.",
        "This Pokemon has its non-volatile status condition cured when it switches out.":
            "교체 시 영구 상태이상이 치유된다.",
        "Fighting, Normal moves hit Ghost. Immune to Intimidate.":
            "격투·노말 기술이 고스트 타입에 효과 있음. 위협 특성 무효.",
        "Moves ignore substitutes and foe's Reflect/Light Screen/Safeguard/Mist/Aurora Veil.": "상대의 대타출동과 리플렉터/빛의장막/신비의부적/안개/오로라베일을 무시한다.",
        "Moves ignore substitutes and foe's Reflect/Light Screen/Safeguard/Mist/Aurora Veil.":
            "기술이 분신 및 리플렉터·빛의장막·신비의베일·안개·오로라베일을 무시한다.",
        "30% chance of infatuating Pokemon of the opposite gender if they make contact.":
            "접촉 시 30% 확률로 이성 포켓몬을 헤롱헤롱 상태로 만든다.",
        "Causes sleeping foes to lose 1/8 of their max HP at the end of each turn.":
            "잠든 상대가 매 턴 끝에 최대 HP 1/8을 잃는다.",
        "Castform's type changes to the current weather condition's type, except Sandstorm.":
            "날씨에 따라 캐스피온의 타입이 변한다 (모래바람 제외).",
        "On switch-in, extremely harsh sunlight begins until this Ability is not active in battle.":
            "등장 시 이 특성이 배틀에서 사라질 때까지 강한 햇살이 지속된다.",
        "On switch-in, heavy rain begins until this Ability is not active in battle.":
            "등장 시 이 특성이 배틀에서 사라질 때까지 폭우가 지속된다.",
        "On switch-in, strong winds begin until this Ability is not active in battle.":
            "등장 시 이 특성이 배틀에서 사라질 때까지 강풍이 지속된다.",
        "On switch-in, the effects of Aurora Veil, Light Screen, and Reflect end for both sides.":
            "등장 시 양측의 오로라베일·빛의장막·리플렉터 효과가 사라진다.",
        "Prevents Explosion/Mind Blown/Misty Explosion/Self-Destruct/Aftermath while active.": "폭발, 깜짝헤드, 안개폭발, 자폭, 유폭을 막는다.",
        "Prevents Explosion/Mind Blown/Misty Explosion/Self-Destruct/Aftermath while active.":
            "폭발·마음의불꽃·안개폭발·자폭·잔상 등의 효과를 막는다.",
        "Prevents foes from choosing to switch unless they also have this Ability.":
            "같은 특성을 가진 포켓몬 외에는 상대가 교체를 선택할 수 없다.",
        "Prevents opposing Pokemon from choosing to switch out unless they are airborne.":
            "공중에 뜬 포켓몬 이외의 상대는 교체를 선택할 수 없다.",
        "Prevents opposing Steel-type Pokemon from choosing to switch out.":
            "상대의 강철 타입 포켓몬은 교체를 선택할 수 없다.",
        "Protects user/allies from Attract, Disable, Encore, Heal Block, Taunt, and Torment.": "자신과 아군을 헤롱헤롱, 사슬묶기, 앙코르, 회복봉인, 도발, 트 트집으로부터 보호한다.",
        "Protects user/allies from Attract, Disable, Encore, Heal Block, Taunt, and Torment.":
            "사용자·아군을 헤롱헤롱·봉인·앙코르·힐블록·도발·토먼트로부터 보호.",
        "Combination of the Unnerve and Chilling Neigh Abilities.":
            "긴장감 특성과 고동치는심장 특성의 조합.",
        "Combination of the Unnerve and Grim Neigh Abilities.":
            "긴장감 특성과 어둠의고동 특성의 조합.",
        "(Mimikyu only) The first hit it takes is blocked, and it takes 1/8 HP damage instead.":
            "(미미큐 전용) 처음 받는 공격을 막고 최대 HP 1/8의 데미지만 받는다.",
        "If Aegislash, changes Forme to Blade before attacks and Shield before King's Shield.":
            "킹실드: 방어 폼으로. 공격 기술 사용 전: 블레이드 폼으로 변환.",
        "If Darmanitan, at end of turn changes Mode to Standard if > 1/2 max HP, else Zen.":
            "다루마카: 매 턴 끝에 최대 HP 1/2 초과 시 통상 폼, 이하 시 달마 폼으로 변환.",
        "If Eiscue, the first physical hit it takes deals 0 damage. Effect is restored in Snow.":
            "유리구슬: 처음 받는 물리 공격 데미지 0. 눈 날씨에서 효과 복원.",
        "If Minior, switch-in/end of turn it changes to Core at 1/2 max HP or less, else Meteor.":
            "메테노: 최대 HP 1/2 이하 시 코어 폼으로, 초과 시 유성 폼으로 변환.",
        "If Morpeko, it changes between Full Belly and Hangry Mode at the end of each turn.":
            "모르페코: 매 턴 끝에 배부름 모드와 배고픔 모드를 교대로 변환.",
        "If Zygarde 10%/50%, changes to Complete if at 1/2 max HP or less at end of turn.":
            "지가르데: HP 1/2 이하 시 퍼펙트 폼으로 변환.",
        "If last item used is a Berry, 50% chance to restore it each end of turn. 100% in Sun.":
            "마지막으로 사용한 도구가 나무열매이면 매 턴 끝에 50% 확률로 복원. 맑은 날씨에는 100%.",
        "If user is Wishiwashi, changes to School Form if it has > 1/4 max HP, else Solo Form.":
            "이슬비: 최대 HP 1/4 초과 시 무리 폼으로, 이하 시 단독 폼으로 변환.",
        "Terapagos: If full HP, attacks taken have 0.5x effectiveness unless naturally immune.":
            "테라파고스: 최대 HP일 때 받는 공격의 효과가 0.5배 (원래 무효인 타입 제외).",
        "Terapagos: Terastallizing ends the effects of weather and terrain. Once per battle.":
            "테라파고스: 테라스탈 시 날씨·필드 효과 종료. 배틀 당 1회.",
        "This Pokemon's same-type attack bonus (STAB) is 2 instead of 1.5.": "자속 보정(STAB)이 1.5배 대신 2배가 된다.",
        # ── more abilities ──
        "This Pokemon is immune to Ground; Gravity/Ingrain/Smack Down/Iron Ball nullify it.": "땅 타입 기술을 받지 않는다. (중력/뿌리박기/떨어뜨리기/검은철구 등에는 무효화)",
        "On switch-in, this Pokemon lowers the Attack of adjacent opponents by 1 stage.": "등장 시 인접한 상대의 공격을 1랭크 낮춘다.",
        "This Pokemon's moves have their accuracy multiplied by 1.3.": "기술의 명중률이 1.3배가 된다.",
        "This Pokemon's Speed is doubled in rain.": "비가 올 때 스피드가 2배가 된다.",
        "This Pokemon's Speed is doubled in Sun.": "맑은 날씨에 스피드가 2배가 된다.",
        "This Pokemon's Speed is doubled in Hail.": "싸라기눈이 내릴 때 스피드가 2배가 된다.",
        "This Pokemon's Speed is doubled in Sandstorm.": "모래바람이 불 때 스피드가 2배가 된다.",
        "This Pokemon's Sp. Atk is doubled.": "특수공격이 2배가 된다.",
        "This Pokemon's Attack is doubled.": "공격이 2배가 된다.",
        "Prevents other Pokemon from lowering this Pokemon's stat stages.": "상대에 의해 능력치가 떨어지지 않는다.",
        "Prevents other Pokemon from lowering this Pokemon's stat stages.": "상대에 의해 능력치가 낮아지지 않는다.",
        "This Pokemon ignores other Pokemon's stat changes when taking or doing damage.": "상대의 능력치 변화를 무시하고 공격하거나 공격받는다.",
        "This Pokemon's attacks do 1.5x damage if it moves before its target.": "상대보다 먼저 행동하면 위력이 1.5배가 된다.",
        "This Pokemon's contact moves have a 30% chance to poison/paralyze/sleep/burn.": "접촉 기술 사용 시 30% 확률로 상태이상을 건다.",
        "If this Pokemon has no item, its stealing moves cannot be redirected.": "도구가 없으면 훔치는 기술의 대상을 변경할 수 없다.",
        "This Pokemon's Normal-type moves become Flying-type and have 1.2x power.": "노말 타입 기술이 비행 타입이 되고 위력이 1.2배가 된다.",
        "This Pokemon's Normal-type moves become Fairy-type and have 1.2x power.": "노말 타입 기술이 페어리 타입이 되고 위력이 1.2배가 된다.",
        "This Pokemon's Normal-type moves become Electric-type and have 1.2x power.": "노말 타입 기술이 전기 타입이 되고 위력이 1.2배가 된다.",
        "This Pokemon's Normal-type moves become Ice-type and have 1.2x power.": "노말 타입 기술이 얼음 타입이 되고 위력이 1.2배가 된다.",
        "This Pokemon's Normal-type moves become Psychic-type and have 1.2x power.": "노말 타입 기술이 에스퍼 타입이 되고 위력이 1.2배가 된다.",
        "This Pokemon's sound-based moves have their power multiplied by 1.3.": "소리 기술의 위력이 1.3배가 된다.",
        "This Pokemon's sound-based moves have their power multiplied by 1.3.": "소리 기술의 위력이 1.3배가 된다.",
        "This Pokemon's biting moves have 1.5x power.": "물기 기술의 위력이 1.5배가 된다.",
        "This Pokemon's slicing moves have 1.5x power.": "베기 기술의 위력이 1.5배가 된다.",
        "This Pokemon's punching moves have 1.2x power.": "펀치 기술의 위력이 1.2배가 된다.",
        "This Pokemon's pulse moves have 1.5x power.": "파동 기술의 위력이 1.5배가 된다.",
        "This Pokemon's recoil moves have 1.2x power.": "반동 기술의 위력이 1.2배가 된다.",
        "This Pokemon's kicking moves have 1.5x power.": "발차기 기술의 위력이 1.5배가 된다.",
        "This Pokemon's healing moves have 1.5x priority.": "회복 기술의 우선도가 +1.5(3) 된다.",
        "Priority of the user's healing moves is increased by 3.": "회복 기술의 우선도가 +3 된다.",
        "This Pokemon's Status moves have priority increased by 1.": "변화 기술의 우선도가 +1 된다.",
        "This Pokemon's Flying-type moves have priority increased by 1.": "비행 타입 기술의 우선도가 +1 된다.",
        "Prevents other Pokemon from lowering this Pokemon's accuracy.": "명중률이 떨어지지 않는다.",
        "Prevents other Pokemon from lowering this Pokemon's accuracy.": "명중률이 낮아지지 않는다.",
        "Prevents other Pokemon from lowering this Pokemon's Attack.": "공격이 낮아지지 않는다.",
        "Prevents other Pokemon from lowering this Pokemon's Defense.": "방어가 낮아지지 않는다.",
        "Prevents other Pokemon from lowering this Pokemon's Sp. Atk.": "특수공격이 낮아지지 않는다.",
        "Prevents other Pokemon from lowering this Pokemon's Sp. Def.": "특수방어가 낮아지지 않는다.",
        "Prevents other Pokemon from lowering this Pokemon's Speed.": "스피드가 낮아지지 않는다.",
        "If this Pokemon is a Ditto, it transforms into the target on switch-in.": "메타몽일 경우 등장 시 상대로 변신한다.",
        "If this Pokemon is a Silvally, its type changes to match its held Memory.": "실버디일 경우 소지한 메모리에 따라 타입이 변한다.",
        "If this Pokemon is an Arceus, its type changes to match its held Plate.": "아르세우스일 경우 소지한 플레이트에 따라 타입이 변한다.",
        "If this Pokemon is a Genesect, its Attack or Sp. Atk is raised by 1 stage.": "게노세크트일 경우 공격 또는 특수공격이 1랭크 상승한다.",
        "On switch-in, this Pokemon copies an ally's stat changes.": "등장 시 아군의 능력치 변화를 복사한다.",
        "On switch-in, this Pokemon summons a sandstorm.": "등장 시 모래바람을 일으킨다.",
        "On switch-in, this Pokemon summons rain.": "등장 시 비를 내리게 한다.",
        "On switch-in, this Pokemon summons sunny day.": "등장 시 햇살을 강하게 한다.",
        "On switch-in, this Pokemon summons hail.": "등장 시 싸라기눈을 내리게 한다.",
        "On switch-in, this Pokemon summons snow.": "등장 시 눈을 내리게 한다.",
        "On switch-in, this Pokemon summons Electric Terrain.": "등장 시 일렉트릭필드를 전개한다.",
        "On switch-in, this Pokemon summons Grassy Terrain.": "등장 시 그래시필드를 전개한다.",
        "On switch-in, this Pokemon summons Misty Terrain.": "등장 시 미스트필드를 전개한다.",
        "On switch-in, this Pokemon summons Psychic Terrain.": "등장 시 사이코필드를 전개한다.",
        "This Pokemon heals 1/4 of its max HP when hit by Water moves; Water immunity.": "물 타입 기술을 받으면 최대 HP의 1/4을 회복한다. 물 기술 무효.",
        "This Pokemon heals 1/4 of its max HP when hit by Electric moves; Electric immunity.": "전기 타입 기술을 받으면 최대 HP의 1/4을 회복한다. 전기 기술 무효.",
        "This Pokemon heals 1/4 of its max HP when hit by Ground moves; Ground immunity.": "땅 타입 기술을 받으면 최대 HP의 1/4을 회복한다. 땅 기술 무효.",
        "This Pokemon's attacks without a chance to flinch gain a 10% chance to flinch.": "풀죽음 효과가 없는 기술에 10% 풀죽음 확률을 부여한다.",
        "This Pokemon's attacks have a 30% chance to flinch.": "공격 기술에 30% 확률로 풀죽음 효과가 부여된다.",
        "This Pokemon's moves have their secondary effect chance doubled.": "기술의 부가 효과 발동 확률이 2배가 된다.",
        "This Pokemon's Sp. Atk is 1.5x, but it can only use the first move it selects.": "특수공격이 1.5배가 되지만, 처음 선택한 기술만 사용할 수 있다.",
        "This Pokemon's Attack is 1.5x, but it can only use the first move it selects.": "공격이 1.5배가 되지만, 처음 선택한 기술만 사용할 수 있다.",
        "This Pokemon's Speed is 1.5x, but it can only use the first move it selects.": "스피드가 1.5배가 되지만, 처음 선택한 기술만 사용할 수 있다.",
        "This Pokemon's same-type attack bonus (STAB) is 2 instead of 1.5.": "자속 보정(STAB)이 1.5배 대신 2배가 된다.",
        "This Pokemon's same-type attack bonus (STAB) is 2 instead of 1.5.": "자속 보정(STAB)이 1.5배 대신 2배가 된다.",
        "This Pokemon receives 1/2 damage from supereffective attacks.": "효과가 굉장한 기술의 데미지를 절반으로 줄인다.",
        "This Pokemon receives 3/4 damage from supereffective attacks.": "효과가 굉장한 기술의 데미지를 3/4으로 줄인다.",
        "This Pokemon ignores the target's Ability if it could hinder the attack.": "공격 시 상대의 특성을 무시한다.",
        "This Pokemon's attacks do 1.3x damage on targets with a status condition.": "상태이상인 상대에게 위력이 1.3배가 된다.",
        "This Pokemon's Defense is doubled.": "방어가 2배가 된다.",
        "This Pokemon's Attack is doubled.": "공격이 2배가 된다.",
        "This Pokemon's Attack is 1.5x.": "공격이 1.5배가 된다.",
        "Prevents other Pokemon from lowering this Pokemon's stats.": "상대에 의해 능력치가 떨어지지 않는다.",
        "Prevents other Pokemon from lowering this Pokemon's stats.": "능력치가 낮아지지 않는다.",
        "This Pokemon cannot be KOed with one hit while at full HP.": "HP가 가득 찰 때 일격에 기절하지 않는다.",
        "This Pokemon's moves cannot be redirected to a different target by any effect.": "기술의 대상을 변경할 수 없다.",
        "This Pokemon's moves ignore the target's Stat stages.": "상대의 능력치 변화를 무시한다.",
        "This Pokemon ignores other Pokemon's Attack/Sp. Atk stat changes when taking damage, and ignores other Pokemon's Defense/Sp. Def stat changes when dealing damage.": "공격받을 때 상대의 공격/특공 변화를, 공격할 때 상대의 방어/특방 변화를 무시한다.",
        "This Pokemon's attacks do 1.25x damage if it moves after its target.": "상대보다 늦게 행동하면 위력이 1.25배가 된다.",
        "This Pokemon's attacks do 1.3x damage if it moves after its target.": "상대보다 늦게 행동하면 위력이 1.3배가 된다.",
        "This Pokemon's attacks have 1.3x power if it is the last to move in a turn.": "턴의 마지막에 행동하면 기술의 위력이 1.3배가 된다.",
        "This Pokemon's attacks do 1.3x damage.": "기술의 위력이 1.3배가 된다.",
        "This Pokemon's contact moves have 1.3x power.": "접촉 기술의 위력이 1.3배가 된다.",
        "This Pokemon's moves have 1.3x power if it moves last in the turn.": "턴의 마지막에 행동하면 위력이 1.3배가 된다.",
        "This Pokemon's moves have 1.3x power against targets that have already moved this turn.": "이미 행동한 상대에게 위력이 1.3배가 된다.",
        "This Pokemon's moves have 1.5x power against targets that have already moved this turn.": "이미 행동한 상대에게 위력이 1.5배가 된다.",
        "This Pokemon's attacks do 2x damage if the target switched in this turn.": "이번 턴에 교체로 나온 상대에게 위력이 2배가 된다.",
        "This Pokemon's attacks do 1.5x damage if the target switched in this turn.": "이번 턴에 교체로 나온 상대에게 위력이 1.5배가 된다.",
        "This Pokemon's critical hit ratio is raised by 1 stage.": "급소율이 1랭크 상승한다.",
        "This Pokemon's moves have their accuracy multiplied by 1.5.": "기술의 명중률이 1.5배가 된다.",
        "This Pokemon and its allies' moves have their accuracy multiplied by 1.1.": "자신과 아군의 명중률이 1.1배가 된다.",
        "This Pokemon's Sp. Atk is raised by 1 stage when it reaches 1/2 or less max HP.": "HP가 1/2 이하가 되면 특수공격이 1랭크 상승한다.",
        "This Pokemon's Speed is raised by 1 stage if it is hit by a Bug-, Dark-, or Ghost-type attack.": "벌레·악·고스트 기술을 맞으면 스피드가 1랭크 상승한다.",
        "This Pokemon's Speed is raised by 1 stage if it is hit by a Fire-, Water-, Electric-, or Ice-type attack.": "불꽃·물·전기·얼음 기술을 맞으면 스피드가 1랭크 상승한다.",
        "This Pokemon's Speed is raised by 6 stages after it is hit by a Fire- or Water-type move.": "불꽃·물 기술을 맞으면 스피드가 6랭크 상승한다.",
        "This Pokemon's Speed is raised by 2 stages after it is hit by a Wind move.": "바람 기술을 맞으면 스피드가 2랭크 상승한다.",
        "This Pokemon is immune to Wind moves and raises its Attack by 1 stage when hit by one.": "바람 기술을 받지 않으며, 맞으면 공격이 1랭크 상승한다.",
        "This Pokemon is immune to Powder moves.": "가루 기술을 받지 않는다.",
        "This Pokemon is immune to powder moves and damage from Sandstorm or Hail.": "가루 기술과 모래바람·싸라기눈 데미지를 받지 않는다.",
        "This Pokemon is immune to status conditions if it hits a target with a contact move.": "접촉 기술을 사용하면 상태이상이 되지 않는다.",
        "This Pokemon's contact moves do not make contact with the target.": "접촉 기술이 비접촉 판정을 받는다.",
        "This Pokemon's Attack is raised by 1 stage if it attacks and knocks out a target.": "공격하여 상대를 쓰러뜨리면 공격이 1랭크 상승한다.",
        "This Pokemon's highest stat is raised by 1 if it attacks and KOes another Pokemon.": "공격하여 상대를 쓰러뜨리면 가장 높은 능력치가 1랭크 상승한다.",
        "This Pokemon's highest stat is raised by 1 stage if it attacks and knocks out a target.": "공격하여 상대를 쓰러뜨리면 가장 높은 능력치가 1랭크 상승한다.",
        "This Pokemon's Sp. Atk is raised by 1 stage when another Pokemon faints.": "다른 포켓몬이 기절할 때마다 특수공격이 1랭크 상승한다.",
        "On switch-in, this Pokemon's Attack or Sp. Atk is raised by 1 stage based on the foes' weaker Defense.": "등장 시 상대의 방어/특방 중 낮은 쪽에 맞춰 공격/특공을 올린다.",
        "On switch-in, this Pokemon copies a random adjacent foe's Ability.": "등장 시 인접한 상대의 특성을 복사한다.",
        "On switch-in, this Pokemon transforms into the opposing Pokemon.": "등장 시 상대로 변신한다.",
        "This Pokemon can only be damaged by supereffective moves and indirect damage.": "효과가 굉장한 기술과 간접 데미지로만 피해를 받는다.",
        "This Pokemon can only be damaged by direct attacks.": "직접 공격으로만 데미지를 받는다.",
        "This Pokemon's moves have 100% accuracy.": "기술이 반드시 명중한다.",
        "This Pokemon's Status moves have priority increased by 1.": "변화 기술의 우선도가 +1 된다.",
        "If this Pokemon is at full HP, its Flying-type moves have their priority increased by 1.": "HP가 가득 찰 때 비행 기술의 우선도가 +1 된다.",
        "This Pokemon's healing moves have their priority increased by 3.": "회복 기술의 우선도가 +3 된다.",
        "This Pokemon has its non-volatile status condition cured when it switches out.": "교체하면 상태이상이 회복된다.",
        "This Pokemon restores 1/3 of its maximum HP, rounded down, when it switches out.": "교체하면 최대 HP의 1/3을 회복한다.",
        "This Pokemon's moves have their secondary effect chance doubled.": "기술의 부가 효과 발동 확률이 2배가 된다.",
        "This Pokemon's attacks with secondary effects have 1.3x power; nullifies the effects.": "부가 효과를 없애고 기술 위력을 1.3배로 만든다.",
        "This Pokemon's same-type attack bonus (STAB) is 2 instead of 1.5.": "자속 보정(STAB)이 1.5배 대신 2배가 된다.",
        "This Pokemon's moves of 60 power or less have 1.5x power, including Struggle.": "위력 60 이하인 기술의 위력이 1.5배가 된다.",
        "This Pokemon's moves of 60 power or less have 1.5x power, including Struggle.": "위력 60 이하인 기술의 위력이 1.5배가 된다.",
        "This Pokemon's multi-hit attacks always hit the maximum number of times.": "연속 기술이 항상 최대 횟수로 맞는다.",
        "If this Pokemon is at full HP, damage taken from attacks is halved.": "HP가 가득 찰 때 받는 데미지가 절반이 된다.",
        "This Pokemon reflects status moves.": "변화 기술을 반사한다.",
        "This Pokemon blocks certain status moves and bounces them back to the user.": "일부 변화 기술을 막고 사용자에게 되돌린다.",
        "This Pokemon's type changes to match the type of the move it is about to use.": "사용하는 기술의 타입으로 변한다.",
        "(Mimikyu only) The first hit it takes is blocked, and it takes 1/8 HP damage instead.": "(미미큐 전용) 처음 받는 공격을 막고 최대 HP 1/8의 데미지만 받는다.",
        "10% chance to lower the target's Sp. Def by 1.": "10% 확률로 상대의 특방을 1랭크 낮춘다.",
        "10% chance to lower the foe(s) Sp. Def by 1.": "10% 확률로 상대들의 특방을 1랭크 낮춘다.",
        "10% chance to lower the target's Speed by 1.": "10% 확률로 상대의 스피드를 1랭크 낮춘다.",
        "10% chance to lower the foe(s) Speed by 1.": "10% 확률로 상대들의 스피드를 1랭크 낮춘다.",
        "10% chance to lower the target's Attack by 1.": "10% 확률로 상대의 공격을 1랭크 낮춘다.",
        "10% chance to lower the foe(s) Attack by 1.": "10% 확률로 상대들의 공격을 1랭크 낮춘다.",
        "10% chance to lower the target's Defense by 1.": "10% 확률로 상대의 방어를 1랭크 낮춘다.",
        "10% chance to lower the foe(s) Defense by 1.": "10% 확률로 상대들의 방어를 1랭크 낮춘다.",
        "10% chance to lower the target's accuracy by 1.": "10% 확률로 상대의 명중률을 1랭크 낮춘다.",
        "10% chance to lower the foe(s) accuracy by 1.": "10% 확률로 상대들의 명중률을 1랭크 낮춘다.",
        "10% chance to raise the user's Attack by 1.": "10% 확률로 사용자의 공격을 1랭크 올린다.",
        "10% chance to raise the user's Defense by 1.": "10% 확률로 사용자의 방어를 1랭크 올린다.",
        "10% chance to raise the user's Sp. Atk by 1.": "10% 확률로 사용자의 특공을 1랭크 올린다.",
        "10% chance to raise the user's Sp. Def by 1.": "10% 확률로 사용자의 특방을 1랭크 올린다.",
        "10% chance to raise the user's Speed by 1.": "10% 확률로 사용자의 스피드를 1랭크 올린다.",
        "10% chance to raise the user's all stats by 1.": "10% 확률로 사용자의 모든 능력치를 1랭크 올린다.",
    }
    if eng in TRIVIAL:
        return TRIVIAL[eng]
    if t in TRIVIAL:
        return TRIVIAL[t] + "."

    result = _try_patterns(t)
    if result:
        return result + "."
    # fallback: vocabulary substitution only
    return sub_vocab(eng)


def _try_patterns(t):
    """Try structured pattern matches. Returns Korean string without trailing period."""

    # ── 1. "X% chance to [status] the [target]" ────────────────────────────
    m = re.match(
        r'(\d+)%\s+chance\s+to\s+(burn|freeze|paralyze|poison|confuse|flinch|sleep|'
        r'badly\s+poison|cause\s+the\s+(?:target|foe)\s+to\s+fall\s+asleep|'
        r'make\s+the\s+(?:target|foe(?:\(s\))?)\s+flinch|'
        r'put\s+the\s+(?:target|foe)\s+to\s+sleep)\s+'
        r'(the\s+target|the\s+foe|foe\(s\)|adjacent\s+Pok[eé]mon)',
        t, re.IGNORECASE)
    if m:
        pct, effect, subj = m.group(1), m.group(2).lower(), m.group(3)
        subj_ko = SUBJ.get(subj, sub_vocab(subj))
        verb_ko = _status_verb(effect)
        return f"{pct}% 확률로 {subj_ko}를 {verb_ko}"

    # ── 2. "X% chance to lower/raise the [target]'s [Stat] by N" ───────────
    m = re.match(
        r'(\d+)%\s+chance\s+to\s+(lower|raise)\s+'
        r'(the\s+(?:target|user|foe|holder)|foe\(s\)|adjacent\s+(?:foes|Pok[eé]mon))\'?s?\s+'
        r'(Sp\.\s+(?:Atk|Def)|Attack|Defense|Speed|accuracy|evasiveness|evasion|HP|all\s+stats(?:[^.]+)?)\s+'
        r'by\s+(\d+)',
        t, re.IGNORECASE)
    if m:
        pct, verb, subj, stat, n = m.groups()
        return _stat_change_ko(f"{pct}% 확률로", subj, stat, n, verb)

    # ── 3. "Raises/Lowers the [subject]'s [Stat] by N" ─────────────────────
    m = re.match(
        r'(Raises|Lowers)\s+'
        r'(the\s+(?:target|user|foe|holder)|foe\(s\)|an?\s+ally)\'?s?\s+'
        r'(Sp\.\s+(?:Atk|Def)|Attack|Defense|Speed|accuracy|evasiveness|evasion|HP|all\s+stats(?:[^.]+)?)\s+'
        r'by\s+(\d+)',
        t, re.IGNORECASE)
    if m:
        verb, subj, stat, n = m.groups()
        return _stat_change_ko("", subj, stat, n, verb.lower())

    # ── 4. "X% chance to lower/raise [Pkmn-type] [Stat] by N" (no apostrophe) ─
    m = re.match(
        r'(\d+)%\s+chance\s+(?:lower|raise)\s+'
        r'(adjacent|all)?\s*(?:Pkmn|foes|Pokemon)?\s*'
        r'(Sp\.\s+(?:Atk|Def)|Attack|Defense|Speed|accuracy|evasiveness|evasion|HP)\s+'
        r'by\s+(\d+)',
        t, re.IGNORECASE)
    if m:
        pct, _, stat, n = m.groups()
        stat_ko = STAT.get(stat.strip(), stat)
        verb_ko = "낮춘다" if "lower" in t.lower() else "올린다"
        return f"{pct}% 확률로 {stat_ko}를 {n}랭크 {verb_ko}"

    # ── 5. Priority ─────────────────────────────────────────────────────────
    m = re.match(r'Has\s+\+(\d+)\s+priority', t)
    if m:
        return f"+{m.group(1)} 선제 기술"
    m = re.match(r'Has\s+(-\d+)\s+priority', t)
    if m:
        return f"{m.group(1)} 후공 기술"

    # ── 6. Hits N times ─────────────────────────────────────────────────────
    m = re.match(r'Hits\s+(\d+)\s+times?', t)
    if m:
        return f"{m.group(1)}회 연속으로 공격"
    m = re.match(r'Hits\s+(\d+)\s+to\s+(\d+)\s+times?', t)
    if m:
        return f"{m.group(1)}~{m.group(2)}회 연속으로 공격"

    # ── 7. Power doubles/triples ────────────────────────────────────────────
    m = re.match(r'Power\s+(doubles|triples|is\s+doubled|is\s+tripled)\s+if', t)
    if m:
        mult = "2배" if "double" in m.group(1).lower() else "3배"
        cond = t[m.end():].strip()
        return f"조건에 따라 위력 {mult} ({sub_vocab(cond)})"

    m = re.match(r'(\d+)x\s+power\s+if', t)
    if m:
        cond = t[m.end():].strip()
        return f"조건에 따라 위력 {m.group(1)}배 ({sub_vocab(cond)})"

    # ── 8. "Paralyzes/Burns/Poisons/etc. the target" ────────────────────────
    for en_base, (verb_ko, _) in STATUS_VERB.items():
        m = re.match(
            rf'({en_base.capitalize()}s?|{en_base.capitalize()})\s+'
            rf'(the\s+target|the\s+foe|foe\(s\)|adjacent\s+Pok[eé]mon)',
            t, re.IGNORECASE)
        if m:
            subj_ko = SUBJ.get(m.group(2), sub_vocab(m.group(2)))
            return f"{subj_ko}를 {verb_ko}"

    # ── 9. Restores HP ──────────────────────────────────────────────────────
    m = re.match(r'Restores?\s+(\d+)%\s+(?:of\s+)?(?:the\s+user\'?s?\s+)?(?:max\s+)?HP', t, re.I)
    if m:
        return f"HP를 {m.group(1)}% 회복"

    m = re.match(r'User\s+recovers\s+(\d+)%\s+of\s+(?:the\s+)?damage\s+dealt', t, re.I)
    if m:
        return f"가한 데미지의 {m.group(1)}%를 HP로 회복"

    # ── 10. "+ N power for each …" ──────────────────────────────────────────
    m = re.match(r'\+(\d+)\s+power\s+for\s+each', t, re.I)
    if m:
        cond = sub_vocab(t[m.end():].strip())
        return f"{cond}마다 위력 +{m.group(1)}"

    # ── 11. Compound: "A. B." ────────────────────────────────────────────────
    parts = re.split(r'\.\s+', t)
    if len(parts) > 1:
        ko_parts = [_try_patterns(p) or sub_vocab(p) for p in parts if p]
        if any(ko_parts):
            return ". ".join(p for p in ko_parts if p)

    return None


def _status_verb(effect):
    effect = effect.lower().strip()
    if "burn" in effect:       return "화상을 입힌다"
    if "freeze" in effect:     return "얼린다"
    if "paralyze" in effect:   return "마비시킨다"
    if "badly poison" in effect: return "맹독 상태로 만든다"
    if "poison" in effect:     return "독 상태로 만든다"
    if "sleep" in effect or "asleep" in effect: return "잠들게 한다"
    if "confuse" in effect:    return "혼란시킨다"
    if "flinch" in effect:     return "풀죽게 만든다"
    return effect


def _stat_change_ko(prefix, subj, stat, n, verb):
    stat = stat.strip()
    stat_ko = STAT.get(stat, stat)
    # particle: 을/를
    last = stat_ko[-1]
    obj = stat_ko + ("를" if last in "이오아에의름스피" else "을")
    subj_ko = SUBJ.get(subj.lower(), SUBJ.get(subj.lower() + "'s", sub_vocab(subj)))
    # fix common cases
    if "user" in subj.lower():   subj_ko = "사용자"
    if "target" in subj.lower(): subj_ko = "상대"
    if "foe" in subj.lower() and "(" in subj: subj_ko = "상대들"
    elif "foe" in subj.lower():  subj_ko = "상대"
    if "ally" in subj.lower():   subj_ko = "아군"
    verb_ko = "올린다" if verb == "raise" or verb == "raises" else "낮춘다"
    parts = [p for p in [prefix, f"{subj_ko}의 {obj} {n}랭크 {verb_ko}"] if p]
    return " ".join(parts)


# ── fetch live data and apply ───────────────────────────────────────────────

def fetch(url):
    print(f"  GET {url.split('/')[-1]} ...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})
    with urllib.request.urlopen(req) as r:
        return r.read().decode('utf-8')

def to_id(text):
    return re.sub(r'[^a-z0-9]', '', str(text).lower())

def fetch_wiki_descs(url):
    print(f"Fetching {url}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})
    try:
        with urllib.request.urlopen(req) as r:
            content = r.read().decode('utf-8')
    except Exception as e:
        print(f"  -> Failed to fetch wiki: {e}")
        return {}
    
    # 위키 테이블에서 (영어 이름, 설명) 쌍 추출
    # 정규식: <td>...English...</td>...<td>...Description...</td>
    # 기술/특성 목록은 보통: 한국어 | 영어 | ... | 설명 구조
    
    mapping = {}
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', content, re.DOTALL)
    
    for row in rows:
        cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL)
        if len(cells) < 3:
            continue
            
        def clean(text):
            return re.sub(r'<[^>]+>', '', text).strip()
            
        cleaned_cells = [clean(c) for c in cells]
        
        # 영어 이름 찾기 (보통 2번째 열)
        en_name = None
        desc = None
        
        # 열 순서가 가변적일 수 있으므로 영어 텍스트와 긴 설명 텍스트를 찾음
        for cell in cleaned_cells:
            if re.match(r'^[A-Za-z0-9\s\-\']+$', cell) and len(cell) > 2:
                if not en_name: en_name = cell
            elif len(cell) > 10 and re.search(r'[가-힣]', cell):
                # 설명은 보통 길고 한글이 포함됨
                desc = cell
        
        if en_name and desc:
            sid = to_id(en_name)
            # 설명 정제 (개행 제거 등)
            desc = re.sub(r'\s+', ' ', desc).strip()
            mapping[sid] = desc
            
    return mapping

def extract_descs_via_node(url, field="shortDesc"):
    """Use Node.js to eval the data file and extract top-level shortDesc values."""
    import subprocess, tempfile, os
    node_script = f"""
const https = require('https');
https.get('{url}', {{headers:{{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}}}}, r => {{
    let d = '';
    r.on('data', c => d += c);
    r.on('end', () => {{
        // Wrap in a scope that captures the exported object
        let exports = {{}}; try {{ eval(d); }} catch(e) {{}}
        // Showdown assigns to exports.BattleMovedex or exports.BattleAbilities
        let data = exports.BattleMovedex || exports.BattleAbilities || {{}};
        const result = {{}};
        for (const [id, entry] of Object.entries(data)) {{
            if (entry && entry.{field}) result[id] = entry.{field};
        }}
        process.stdout.write(JSON.stringify(result));
    }});
}});
"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False, encoding='utf-8') as f:
        f.write(node_script)
        tmp = f.name
    try:
        out = subprocess.check_output(['node', tmp], timeout=30)
        return json.loads(out.decode('utf-8'))
    finally:
        os.unlink(tmp)

def main():
    print("=== Scraping Descriptions from Pokemon Wiki ===")
    wiki_move_descs = fetch_wiki_descs(WIKI_URLS['moves'])
    wiki_abil_descs = fetch_wiki_descs(WIKI_URLS['abilities'])
    
    print("=== Fetching Showdown Data for IDs ===")
    showdown_moves = extract_descs_via_node("https://play.pokemonshowdown.com/data/moves.js")
    showdown_abils = extract_descs_via_node("https://play.pokemonshowdown.com/data/abilities.js")

    # 매핑: Showdown ID -> Wiki Description
    ko_moves = {}
    for sid, desc in showdown_moves.items():
        if sid in wiki_move_descs:
            ko_moves[sid] = wiki_move_descs[sid]
        else:
            ko_moves[sid] = translate(desc)

    ko_abils = {}
    for sid, desc in showdown_abils.items():
        if sid in wiki_abil_descs:
            ko_abils[sid] = wiki_abil_descs[sid]
        else:
            ko_abils[sid] = translate(desc)

    print(f"Mapped {len(ko_moves)} moves and {len(ko_abils)} abilities.")

    out_path = 'play.pokemonshowdown.com/js/ko-desc.js'
    js_out = f"""// Auto-generated by scripts/translate_descs.py (Wiki Scraper + Fallback)
// Korean descriptions from Pokemon Wiki
(function () {{
    var koMoveDescs = {json.dumps(ko_moves, ensure_ascii=False, indent=4)};

    var koAbilityDescs = {json.dumps(ko_abils, ensure_ascii=False, indent=4)};

    function applyDescs() {{
        if (window.BattleMovedex) {{
            for (var id in koMoveDescs) {{
                if (window.BattleMovedex[id]) {{
                    window.BattleMovedex[id].shortDesc = koMoveDescs[id];
                    window.BattleMovedex[id].desc = koMoveDescs[id];
                }}
            }}
        }}
        if (window.BattleAbilities) {{
            for (var id in koAbilityDescs) {{
                if (window.BattleAbilities[id]) {{
                    window.BattleAbilities[id].shortDesc = koAbilityDescs[id];
                    window.BattleAbilities[id].desc = koAbilityDescs[id];
                }}
            }}
        }}
    }}

    applyDescs();
    window.addEventListener('load', applyDescs);
    setTimeout(applyDescs, 3000);
}})();
"""
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(js_out)
    print(f"\n=== Written to {out_path} ===")

if __name__ == '__main__':
    main()
