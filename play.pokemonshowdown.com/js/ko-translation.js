/**
 * 포켓몬 쇼다운 한글화 스크립트
 * Pokemon Showdown Korean Translation Overlay
 *
 * 이 스크립트는 포켓몬 쇼다운 클라이언트의 UI 텍스트를
 * 한국어로 번역하는 오버레이 레이어입니다.
 *
 * MutationObserver를 사용하여 동적으로 생성되는 DOM 요소도 번역합니다.
 */

(function() {
	'use strict';

	// ============================================
	// 번역 사전 (Translation Dictionary)
	// ============================================

	var KO = {
		// === 메인 메뉴 ===
		'Battle!': '배틀!',
		'Find a random opponent': '랜덤 상대 찾기',
		'Teambuilder': '팀빌더',
		'Ladder': '래더',
		'Watch a battle': '배틀 관전',
		'Find a user': '유저 찾기',
		'Friends': '친구',
		'Info & Resources': '정보 & 자료',
		'Join chat': '채팅 참가',
		'Join lobby chat': '로비 채팅 참가',
		'Add game': '게임 추가',
		'Games:': '게임:',
		'Latest News': '최신 뉴스',

		// === 상단바 ===
		'Home': '홈',
		'Battles': '배틀',
		'Resources': '자료',
		'Choose name': '로그인',
		'Loading...': '로딩 중...',

		// === 배틀 설정 ===
		'Invite': '초대',
		"Don't allow spectators": '관전자 비허용',

		// === 설정 메뉴 (Options) ===
		'Graphics': '그래픽',
		'Theme: ': '테마: ',
		'Light': '라이트',
		'Dark': '다크',
		'Match system theme': '시스템 테마에 맞추기',
		'Layout: ': '레이아웃: ',
		'◫ Left and right panels': '◫ 좌우 패널',
		'◻ Single panel': '◻ 싱글 패널',
		'Background: ': '배경: ',
		'Change background': '배경 변경',
		'Disable animations': '애니메이션 비활성화',
		'Use 2D sprites instead of 3D models': '3D 모델 대신 2D 스프라이트 사용',
		'Use modern sprites for past generations': '과거 세대에 현대 스프라이트 사용',
		'Disable GIFs for Chrome 64 bug': 'Chrome 64 버그용 GIF 비활성화',

		// === 채팅 설정 ===
		'Chat': '채팅',
		'Block PMs': '개인 메시지 차단',
		'Block Challenges': '대전 신청 차단',
		'Show PMs in chat rooms': '채팅방에 PM 표시',
		'Highlight when your name is said in chat': '채팅에서 이름 멘션 시 하이라이트',
		'Notifications disappear automatically': '알림 자동 사라짐',
		'Confirm before leaving a room': '방 나가기 전 확인',
		'Confirm before refreshing': '새로고침 전 확인',
		'Language: ': '언어: ',
		'Tournaments: ': '토너먼트: ',
		'Notifications': '알림',
		'No Notifications': '알림 없음',
		'Hide': '숨기기',
		'Timestamps in chat rooms: ': '채팅방 타임스탬프: ',
		'Timestamps in PMs: ': 'PM 타임스탬프: ',
		'Off': '꺼짐',
		'Chat preferences: ': '채팅 환경설정: ',
		'Text formatting': '텍스트 서식',
		'Desktop app': '데스크톱 앱',
		'Log chat': '채팅 기록',
		'Open log folder': '기록 폴더 열기',

		// === 계정 관련 ===
		'Avatar...': '아바타...',
		'Status...': '상태...',
		'Password...': '비밀번호...',
		'Register': '가입',
		' Change name': ' 닉네임 변경',
		' Log out': ' 로그아웃',

		// === 사운드 ===
		'Effect volume:': '효과음 볼륨:',
		'Music volume:': '배경음 볼륨:',
		'Notification volume:': '알림 볼륨:',
		'Mute sounds': '음소거',
		'(muted)': '(음소거)',

		// === 배틀 관련 ===
		'Searching...': '검색 중...',
		'Cancel': '취소',
		'Accept': '수락',
		'Reject': '거절',
		'Challenge': '대전 신청',
		' wants to battle!': '님이 대전을 신청했습니다!',
		'Waiting for ': '대기 중: ',
		'Game': '게임',

		// === 대전 중 ===
		'What will you do?': '어떻게 하시겠습니까?',
		'Switch': '교체',
		'Move': '기술 선택',
		'Mega Evolve': '메가진화',
		'Z-Move': 'Z기술',
		'Dynamax': '다이맥스',
		'Terastallize': '테라스탈',
		'Forfeit': '기권',
		'Timer': '타이머',
		'Save replay': '리플레이 저장',
		'Instant replay': '즉시 재생',

		// === 승리/패배 ===
		'You win!': '승리!',
		'You lost!': '패배!',
		'You tied!': '무승부!',

		// === 연결 관련 ===
		'Reconnect': '재접속',
		'You are disconnected and cannot chat.': '연결이 끊겼습니다. 채팅을 할 수 없습니다.',
		'Disconnected': '연결 끊김',
		'You have been disconnected from Pokémon Showdown.': '포켓몬 쇼다운과의 연결이 끊어졌습니다.',

		// === 포맷 카테고리 (영어 유지) ===
		// 포맷명은 공식 명칭이므로 영어 그대로 유지

		// === 팀빌더 ===
		'New Team': '새 팀',
		'Import/Export': '가져오기/내보내기',
		'Import from text': '텍스트에서 가져오기',
		'Upload to server': '서버에 업로드',
		'Download from server': '서버에서 다운로드',
		'Delete': '삭제',
		'Validate': '검증',
		'Add Pokémon': '포켓몬 추가',

		// === 래더 ===
		'Ranking': '랭킹',
		'W': '승',
		'L': '패',
		'D': '무',

		// === 기타 UI ===
		'Close': '닫기',
		'Minimize': '최소화',
		'Done': '완료',
		'Send': '보내기',
		'Search': '검색',
		'Yes': '예',
		'No': '아니요',
		'OK': '확인',
		'Error': '오류',
		'Warning': '주의',
		'(empty room)': '(빈 방)',

		// === 채팅방 목록 (영어 유지) ===
		// 공식 채팅방 이름은 영어 그대로 유지

		// === 풋터 메뉴 ===
		'Pokédex': '포켓몬 도감',
		'Replays': '리플레이',
		'Rules': '규칙',
		'Credits': '크레딧',
		'Forum': '포럼',
		'Privacy policy': '개인정보 처리방침',

		// === 상태이상 ===
		'Paralyzed': '마비',
		'Burned': '화상',
		'Poisoned': '독',
		'Badly poisoned': '맹독',
		'Frozen': '얼음',
		'Asleep': '잠듦',
		'Confused': '혼란',
		'Fainted': '기절',
	};

	// ============================================
	// 텍스트 노드 번역 함수
	// ============================================

	function translateTextNode(node) {
		if (!node || !node.textContent) return;
		var text = node.textContent.trim();
		if (KO[text]) {
			node.textContent = node.textContent.replace(text, KO[text]);
		}
	}

	function translateElement(el) {
		if (!el) return;

		// 번역하면 안 되는 요소 건너뛰기
		if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') return;
		if (el.classList && (el.classList.contains('inner') || el.classList.contains('chat') || el.classList.contains('username') || el.classList.contains('usernametext'))) return;

		// 직접 자식 텍스트 노드만 번역
		var childNodes = el.childNodes;
		for (var i = 0; i < childNodes.length; i++) {
			var child = childNodes[i];
			if (child.nodeType === Node.TEXT_NODE) {
				translateTextNode(child);
			}
		}

		// aria-label 번역
		if (el.getAttribute) {
			var ariaLabel = el.getAttribute('aria-label');
			if (ariaLabel && KO[ariaLabel]) {
				el.setAttribute('aria-label', KO[ariaLabel]);
			}
			var title = el.getAttribute('title');
			if (title && KO[title]) {
				el.setAttribute('title', KO[title]);
			}
		}
	}

	function translateTree(root) {
		if (!root) return;
		translateElement(root);
		var elements = root.querySelectorAll('button, a, label, p, h3, h4, strong, small, span, option, abbr, div.mainmessage, div.error');
		for (var i = 0; i < elements.length; i++) {
			translateElement(elements[i]);
		}
	}

	// ============================================
	// innerHTML 기반 번역 (HTML 문자열 치환)
	// ============================================

	function patchHTML(html) {
		// 주요 하드코딩된 문자열 치환
		var replacements = {
			'>Battle!</': '>배틀!</',
			'>Find a random opponent<': '>랜덤 상대 찾기<',
			'>Teambuilder<': '>팀빌더<',
			'>Ladder<': '>래더<',
			'>Watch a battle<': '>배틀 관전<',
			'>Find a user<': '>유저 찾기<',
			'>Friends<': '>친구<',
			'>Info & Resources<': '>정보 & 자료<',
			'>Join chat<': '>채팅 참가<',
			'>Join lobby chat<': '>로비 채팅 참가<',
			'>Home<': '>홈<',
			'>Resources<': '>자료<',
			'>Choose name<': '>로그인<',
			'>Loading...<': '>로딩 중...<',
			'>Latest News<': '>최신 뉴스<',
			'Searching...': '검색 중...',
			'>Cancel<': '>취소<',
			'>Accept<': '>수락<',
			'>Reject<': '>거절<',
			'>Challenge<': '>대전 신청<',
			'>Add game<': '>게임 추가<',
		};

		for (var en in replacements) {
			html = html.split(en).join(replacements[en]);
		}
		return html;
	}

	// ============================================
	// 메인 메뉴 초기화 후크
	// ============================================

	function hookMainMenu() {
		// MainMenuRoom.initialize를 후킹하여 생성 후 번역
		if (window.MainMenuRoom && MainMenuRoom.prototype) {
			var origInit = MainMenuRoom.prototype.initialize;
			MainMenuRoom.prototype.initialize = function() {
				origInit.apply(this, arguments);
				setTimeout(function() {
					translateTree(document.getElementById('mainmenu'));
				}, 100);
			};
		}

		// Topbar.updateUserbar 후킹
		if (window.Topbar && Topbar.prototype) {
			var origUpdateUserbar = Topbar.prototype.updateUserbar;
			Topbar.prototype.updateUserbar = function() {
				origUpdateUserbar.apply(this, arguments);
				setTimeout(function() {
					translateTree(document.querySelector('.userbar'));
				}, 50);
			};

			var origUpdateTabbar = Topbar.prototype.updateTabbar;
			Topbar.prototype.updateTabbar = function() {
				origUpdateTabbar.apply(this, arguments);
				setTimeout(function() {
					translateTree(document.querySelector('.maintabbar'));
				}, 50);
			};
		}
	}

	// ============================================
	// MutationObserver로 동적 변경 감시
	// ============================================

	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			// 추가된 노드 번역
			mutation.addedNodes.forEach(function(node) {
				if (node.nodeType === Node.ELEMENT_NODE) {
					translateTree(node);
				}
			});
		});
	});

	// ============================================
	// 페이지 타이틀 변경
	// ============================================

	function updateTitle() {
		if (document.title === 'Showdown!') {
			document.title = '포켓몬 쇼다운! (한글판)';
		} else if (document.title.includes('Showdown!')) {
			document.title = document.title.replace('Showdown!', '포켓몬 쇼다운!');
		}
	}

	// ============================================
	// OptionsPopup 번역 후킹
	// ============================================

	function hookOptionsPopup() {
		if (window.OptionsPopup && OptionsPopup.prototype) {
			var origUpdate = OptionsPopup.prototype.update;
			OptionsPopup.prototype.update = function() {
				origUpdate.apply(this, arguments);
				setTimeout(function() {
					translateTree(document.querySelector('.ps-popup'));
				}, 50);
			};
		}
		if (window.SoundsPopup && SoundsPopup.prototype) {
			var origSoundsInit = SoundsPopup.prototype.initialize;
			SoundsPopup.prototype.initialize = function() {
				origSoundsInit.apply(this, arguments);
				setTimeout(function() {
					translateTree(document.querySelector('.ps-popup'));
				}, 50);
			};
		}
	}

	// ============================================
	// 초기화
	// ============================================

	function init() {
		// 페이지 타이틀 변경
		updateTitle();
		setInterval(updateTitle, 2000);

		// 초기 번역
		translateTree(document.body);

		// MutationObserver 시작
		observer.observe(document.body, {
			childList: true,
			subtree: true
		});

		// 메인 메뉴 및 팝업 후킹 (약간 딜레이)
		setTimeout(function() {
			hookMainMenu();
			hookOptionsPopup();
			translateTree(document.body);
		}, 500);

		// 앱 초기화 후 추가 번역
		setTimeout(function() {
			translateTree(document.body);
		}, 2000);

		setTimeout(function() {
			translateTree(document.body);
		}, 5000);

		console.log('[한글화] 포켓몬 쇼다운 한글화 스크립트가 로드되었습니다!');
	}

	// DOM Ready 또는 즉시 실행
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}

	// window.onload에서도 실행
	var origOnload = window.onload;
	window.onload = function() {
		if (origOnload) origOnload.apply(this, arguments);
		setTimeout(function() {
			hookMainMenu();
			hookOptionsPopup();
			translateTree(document.body);
		}, 500);
	};
})();

// ============================================
// BattlePokedex.abilities 한글화 패치
// renderPokemonRow가 pokemon.abilities['0'] 등을 직접 표시하므로
// BattleAbilities의 한글명으로 교체해 포켓몬 목록의 특성을 한글로 표시
// ============================================
(function() {
	function patchPokedexAbilities() {
		if (!window.BattlePokedex || !window.BattleAbilities) return;
		for (var id in BattlePokedex) {
			var poke = BattlePokedex[id];
			if (!poke || !poke.abilities) continue;
			for (var slot in poke.abilities) {
				var abilName = poke.abilities[slot];
				if (!abilName || typeof abilName !== 'string') continue;
				if (/[\uAC00-\uD7A3\u3131-\u318E\u314F-\u3163]/.test(abilName)) continue; // 이미 한글
				var abilId = abilName.toLowerCase().replace(/[^a-z0-9]+/g, '');
				var koAbil = BattleAbilities[abilId];
				if (koAbil && koAbil.name && koAbil.name !== abilName) {
					if (!poke.abilities['_en_' + slot]) poke.abilities['_en_' + slot] = abilName;
					poke.abilities[slot] = koAbil.name;
				}
			}
		}
	}
	// ko-desc.js가 BattleAbilities를 패치한 후 실행되도록 지연 적용
	setTimeout(patchPokedexAbilities, 1000);
	window.addEventListener('load', function() { setTimeout(patchPokedexAbilities, 500); });
})();

// ============================================
// DexSearch 한국어 종족명 패치
// BattleTypedSearch가 toID()로 한국어 이름을 '' 처리하는 문제 수정:
// getTypedSearch 호출 시 speciesOrSet.species가 한국어면 영어 ID로 변환
// ============================================
(function() {
	function resolveKoSpecies(speciesOrSet) {
		if (!speciesOrSet || typeof speciesOrSet !== 'object' || !window.BattleAliases) return speciesOrSet;
		var species = speciesOrSet.species;
		if (!species || typeof species !== 'string') return speciesOrSet;
		// toID 결과가 비어 있으면 한국어 이름
		var id = species.toLowerCase().replace(/[^a-z0-9]+/g, '');
		if (id) return speciesOrSet; // 이미 영어
		var koKey = species.toLowerCase().replace(/[^a-z0-9\uAC00-\uD7A3\u3131-\u318E\u314F-\u3163]+/g, '');
		var englishId = window.BattleAliases[koKey];
		if (!englishId) return speciesOrSet;
		// species만 영어 ID로 교체한 복사본 반환
		var copy = Object.assign({}, speciesOrSet, { species: englishId });
		return copy;
	}

	patchWhenReady(function() {
		if (typeof DexSearch === 'undefined') return false;
		if (DexSearch.prototype.__koSpeciesPatched) return true;
		var _origGetTypedSearch = DexSearch.prototype.getTypedSearch;
		DexSearch.prototype.getTypedSearch = function(searchType, format, speciesOrSet) {
			return _origGetTypedSearch.call(this, searchType, format, resolveKoSpecies(speciesOrSet));
		};
		DexSearch.prototype.__koSpeciesPatched = true;
		console.log('[한글화] DexSearch 한국어 종족명 패치 완료');
		return true;
	});
})();

// DexSearch.find 패치: 한국어 부분 문자열 검색 지원
// 예) '쳄' 입력 시 특성 Filter 버튼 + 쳄이 들어간 포켓몬/기술 목록
(function() {
	patchWhenReady(function() {
		if (typeof DexSearch === 'undefined') return false;
		if (DexSearch._koFindPatch) return true;
		var KO_RE = /[가-힣ㄱ-ㆎㅏ-ㅣ]/;

		// 한국어 타입명 → 영어 ID
		var KO_TYPES = {
			'노말':'normal','불꽃':'fire','물':'water','풀':'grass','전기':'electric',
			'얼음':'ice','격투':'fighting','독':'poison','땅':'ground','비행':'flying',
			'에스퍼':'psychic','벌레':'bug','바위':'rock','고스트':'ghost','드래곤':'dragon',
			'악':'dark','강철':'steel','페어리':'fairy'
		};

		var _origFind = DexSearch.prototype.find;
		DexSearch.prototype.find = function(query) {
			if (!query || !KO_RE.test(query)) return _origFind.call(this, query);
			var q = query.trim();
			if (this._koQuery === q && this.results) return false;
			this._koQuery = q;
			this.query = q;
			this.exactMatch = false;
			var searchType = this.typedSearch ? this.typedSearch.searchType : '';
			var kd = window._KoData || {};
			var results = [];
			var self = this;

			function searchTable(table, type, header) {
				if (!table) return;
				var rows = [];
				for (var id in table) {
					var kname = table[id] && table[id].name;
					if (!kname || !kname.includes(q)) continue;
					rows.push([type, id, kname.indexOf(q), q.length]);
				}
				if (rows.length) {
					results.push(['header', header]);
					for (var r = 0; r < rows.length; r++) results.push(rows[r]);
				}
			}

			// 타입 인스타필터: 쿼리가 한국어 타입명에 포함될 경우 해당 타입 포켓몬/기술 목록 추가
			function addTypeFilter(st) {
				for (var koType in KO_TYPES) {
					if (!koType.includes(q)) continue;
					var engType = KO_TYPES[koType];
					try {
						var typeRows = self.instafilter(st, 'type', engType);
						if (typeRows && typeRows.length) {
							// 헤더를 한국어 타입명으로 교체
							typeRows[0] = ['header', koType + ' 타입 ' + (st === 'move' ? '기술' : '포켓몬')];
							results = results.concat(typeRows);
						}
					} catch(e) {}
				}
			}

			if (!searchType || searchType === 'pokemon') {
				// 특성 부분 매칭: 특성명에 q가 포함된 모든 특성을 ability 행으로 추가 (Filter 버튼 UI)
				if (kd.abilities) {
					var abilRows = [];
					for (var abId in kd.abilities) {
						var abName = kd.abilities[abId] && kd.abilities[abId].name;
						if (!abName || !abName.includes(q)) continue;
						abilRows.push(['ability', abId, abName.indexOf(q), q.length]);
					}
					if (abilRows.length) {
						results.push(['header', '특성']);
						results = results.concat(abilRows);
					}
				}
				// 포켓몬 이름 검색
				searchTable(kd.pokemon, 'pokemon', 'Pokémon');
				// 타입 필터
				addTypeFilter('pokemon');
			}
			if (!searchType || searchType === 'move') {
				searchTable(kd.moves, 'move', '기술');
				addTypeFilter('move');
			}
			if (!searchType || searchType === 'ability') searchTable(kd.abilities, 'ability', '특성');
			if (!searchType || searchType === 'item')    searchTable(kd.items, 'item', '아이템');

			this.results = results;
			return true;
		};
		DexSearch._koFindPatch = true;
		console.log('[한글화] DexSearch 한국어 부분 검색 패치 완료');
		return true;
	});
})();

// 공통 헬퍼: 조건이 충족될 때까지 200ms 간격으로 patchFn 재시도
function patchWhenReady(patchFn) {
	if (!patchFn()) {
		var iv = setInterval(function() { if (patchFn()) clearInterval(iv); }, 200);
	}
}

// GitHub Pages 로그인 CORS 수정: action.php를 Cloudflare Worker 프록시로 라우팅
(function() {
	var ACTION_URL = 'https://ps-login-proxy.kimcodns.workers.dev/~~showdown/action.php';
	patchWhenReady(function() {
		if (typeof App !== 'undefined' && App.prototype && App.prototype.User && App.prototype.User.prototype) {
			App.prototype.User.prototype.getActionPHP = function() { return ACTION_URL; };
			console.log('[한글화] getActionPHP 프로토타입 패치 완료');
			return true;
		}
		if (typeof app !== 'undefined' && app && app.user) {
			app.user.getActionPHP = function() { return ACTION_URL; };
			console.log('[한글화] getActionPHP 인스턴스 패치 완료');
			return true;
		}
		return false;
	});
})();

// Search.renderPokemonRow 패치: 한글 이름은 forme 분리 없이 전체 이름 표시
// 문제: tagStart = name.length(한글) - forme.length(영어) - 1 → 음수/오계산 → 이름 깨짐
(function() {
	patchWhenReady(function() {
		if (typeof BattleSearch === 'undefined' || !BattleSearch.prototype) return false;
		if (BattleSearch._koRowPatch) return true;
		var _orig = BattleSearch.prototype.renderPokemonRow;
		BattleSearch.prototype.renderPokemonRow = function(pokemon, matchStart, matchLength, errorMessage, attrs) {
			// 한글 이름이면 forme 분리 없이 전체 이름 표시되도록 forme 임시 제거
			if (pokemon && pokemon.name && /[\uAC00-\uD7A3\u3131-\u318E\u314F-\u3163]/.test(pokemon.name) && pokemon.forme) {
				var fakeObj = Object.create(pokemon);
				fakeObj.forme = '';
				return _orig.call(this, fakeObj, matchStart, matchLength, errorMessage, attrs);
			}
			return _orig.call(this, pokemon, matchStart, matchLength, errorMessage, attrs);
		};
		BattleSearch._koRowPatch = true;
		console.log('[한글화] BattleSearch.renderPokemonRow 한글명 패치 완료');
		return true;
	});
})();

// Dex.hasAbility 패치: 한글/영어 능력치명 양방향 비교
// 문제: patchPokedexAbilities가 BattlePokedex의 abilities를 한글로 교체했는데,
// 이전에 생성된 Species 객체는 영어 이름을 유지하면서 한글 비교 실패
(function() {
	patchWhenReady(function() {
		if (typeof Dex === 'undefined' || !Dex.hasAbility) return false;
		if (Dex._koHasAbilityPatch) return true;
		var _orig = Dex.hasAbility.bind(Dex);
		Dex.hasAbility = function(species, ability) {
			if (_orig(species, ability)) return true;
			if (!ability || !species || !species.abilities) return false;
			// ability가 한글이면 BattleAliases로 영어 ID 조회, 영어면 ID 변환
			var targetId = null;
			var koRE = /[가-힣ㄱ-ㆎㅏ-ㅣ]/;
			if (koRE.test(ability)) {
				var koId = ability.toLowerCase().replace(/[^a-z0-9\uAC00-\uD7A3\u3131-\u318E\u314F-\u3163]+/g, '');
				if (window.BattleAliases && window.BattleAliases[koId]) {
					targetId = window.BattleAliases[koId];
				} else {
					// BattleAliases 미등록 시 _KoData로 폴백
					var kd = window._KoData;
					if (kd && kd.abilities) {
						for (var abId in kd.abilities) {
							if (kd.abilities[abId] && kd.abilities[abId].name === ability) { targetId = abId; break; }
						}
					}
				}
			} else {
				targetId = ability.toLowerCase().replace(/[^a-z0-9]+/g, '');
			}
			if (!targetId) return false;
			for (var slot in species.abilities) {
				if (slot.charAt(0) === '_') continue;
				var enName = species.abilities['_en_' + slot] || species.abilities[slot];
				if (!enName || typeof enName !== 'string') continue;
				var enId = enName.toLowerCase().replace(/[^a-z0-9]+/g, '');
				if (enId === targetId) return true;
			}
			return false;
		};
		Dex._koHasAbilityPatch = true;
		console.log('[한글화] Dex.hasAbility 한글/영어 패치 완료');
		return true;
	});
})();

// Dex.getPokemonIcon 패치: 한글 포켓몬 이름 → species 객체 변환 후 아이콘 조회
// 문제: getPokemonIcon('폴리곤2') → toID('폴리곤2') = '2' → 잘못된 아이콘
(function() {
	patchWhenReady(function() {
		if (typeof Dex === 'undefined' || !Dex.getPokemonIcon) return false;
		if (Dex._koIconPatch) return true;
		var _orig = Dex.getPokemonIcon.bind(Dex);
		Dex.getPokemonIcon = function(pokemon, facingLeft) {
			if (typeof pokemon === 'string' && /[\uAC00-\uD7A3\u3131-\u318E\u314F-\u3163]/.test(pokemon)) {
				var species = Dex.species.get(pokemon);
				if (species && species.id) pokemon = species;
			}
			return _orig(pokemon, facingLeft);
		};
		Dex._koIconPatch = true;
		return true;
	});
})();

// Storage.packTeam 패치: 한글 아이템/특성/기술명 → 영어 ID 변환 후 저장
// 문제: unpackTeam이 Dex에서 한글명으로 복원 → packTeam에서 toID(한글)='' → 빈값으로 저장됨
(function() {
	patchWhenReady(function() {
		if (typeof Storage === 'undefined' || !Storage.packTeam) return false;
		if (Storage._koPackPatch) return true;
		var _orig = Storage.packTeam;
		Storage.packTeam = function(team) {
			if (!team || !window.resolveKoreanName) return _orig.call(this, team);
			var patched = team.map(function(set) {
				var s = Object.assign({}, set);
				if (s.item) s.item = window.resolveKoreanName(s.item);
				if (s.ability) s.ability = window.resolveKoreanName(s.ability);
				if (s.moves) s.moves = s.moves.map(function(m) { return m ? window.resolveKoreanName(m) : m; });
				return s;
			});
			return _orig.call(this, patched);
		};
		Storage._koPackPatch = true;
		console.log('[한글화] Storage.packTeam 한글명 변환 패치 완료');
		return true;
	});
})();

// 배틀 로그 한국어 패치
// BattleTextNotAFD를 직접 패치: setAFD()가 BattleText = BattleTextNotAFD를 실행하므로
// BattleText 대신 BattleTextNotAFD를 패치해야 async 로드 후에도 덮어쓰이지 않음
(function() {
	var applied = false;
	function applyKoPatch(target) {
		for (var section in KoBattleText) {
			if (!target[section]) target[section] = {};
			var koSection = KoBattleText[section];
			for (var key in koSection) {
				target[section][key] = koSection[key];
			}
		}
	}
	patchWhenReady(function() {
		if (typeof BattleTextNotAFD === 'undefined' || typeof KoBattleText === 'undefined') return false;
		if (applied) return true;
		applyKoPatch(BattleTextNotAFD);
		if (typeof BattleText !== 'undefined' && BattleText !== BattleTextNotAFD) {
			applyKoPatch(BattleText);
		}
		applied = true;
		console.log('[한글화] BattleText 한국어 패치 완료');
		return true;
	});
})();
