/**
 * 포켓몬 쇼다운 한글화 스크립트
 * Pokemon Showdown Korean Translation Overlay
 *
 * 이 스크립트는 포켓몬 쇼다운 클라이언트의 UI 텍스트를
 * 한국어로 번역하는 오버레이 레이어입니다.
 *
 * MutationObserver를 사용하여 동적으로 생성되는 DOM 요소도 번역합니다.
 */

// Noto Sans KR 폰트 강제 적용 (CSS 캐시 우회)
(function() {
	var s = document.createElement('style');
	s.textContent = "body{font-family:'Noto Sans KR','Malgun Gothic','맑은 고딕','Apple SD Gothic Neo',sans-serif!important}";
	document.head.appendChild(s);
})();

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
// BattlePokedex.abilities 한글화 - 제거됨
// koName 아키텍처에서는 renderPokemonRow 패치에서 _koAb()로 처리
// ============================================

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
			if (this._koQuery === q && this.results !== null && this.query === q) return false;
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
				// 기술 부분 매칭: 기술명에 q가 포함된 모든 기술을 move 행으로 추가 (Filter 버튼 UI)
				if (kd.moves) {
					var moveRows = [];
					for (var mvId in kd.moves) {
						var mvName = kd.moves[mvId] && kd.moves[mvId].name;
						if (!mvName || !mvName.includes(q)) continue;
						moveRows.push(['move', mvId, mvName.indexOf(q), q.length]);
					}
					if (moveRows.length) {
						results.push(['header', '기술']);
						results = results.concat(moveRows);
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

// DexSearch.addFilter 패치: 한글 특성명/기술명을 _KoData로 ID로 변환
(function() {
	patchWhenReady(function() {
		if (typeof DexSearch === 'undefined') return false;
		if (DexSearch._koAddFilterPatch) return true;
		var _origAddFilter = DexSearch.prototype.addFilter;
		var KO_RE_AF = /[가-힣ㄱ-ㆎㅏ-ㅣ]/;
		DexSearch.prototype.addFilter = function(entry) {
			if (entry && typeof entry[1] === 'string' && KO_RE_AF.test(entry[1])) {
				var kd = window._KoData;
				var type = entry[0];
				var table = type === 'ability' ? (kd && kd.abilities) :
				            type === 'move'    ? (kd && kd.moves) : null;
				if (table) {
					for (var id in table) {
						if (table[id] && table[id].name === entry[1]) {
							entry = [type, id];
							break;
						}
					}
				}
			}
			return _origAddFilter.call(this, entry);
		};
		DexSearch._koAddFilterPatch = true;
		console.log('[한글화] DexSearch.addFilter 한글 특성/기술명 패치 완료');
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

// ModdedDex(gen7 등) koName 패치: Dex.mod()를 래핑하여 각 ModdedDex의
// species/moves/items/abilities.get() 결과에 koName을 복원
(function() {
	function patchModdedDex() {
		if (!window.Dex || !window.Dex.mod || window.Dex._koModPatch) return false;
		var _origMod = window.Dex.mod.bind(window.Dex);
		window.Dex.mod = function(modid) {
			var moddedDex = _origMod(modid);
			if (moddedDex === window.Dex || moddedDex._koGetPatch) return moddedDex;
			// species.get 래핑
			var _origSp = moddedDex.species.get;
			moddedDex.species.get = function(name) {
				var sp = _origSp.call(this, name);
				if (sp && sp.exists !== false && !sp.koName && window._KoData && window._KoData.pokemon[sp.id]) {
					sp.koName = window._KoData.pokemon[sp.id].name;
				}
				return sp;
			};
			// moves.get 래핑
			var _origMv = moddedDex.moves.get;
			moddedDex.moves.get = function(name) {
				var mv = _origMv.call(this, name);
				if (mv && mv.exists !== false && !mv.koName && window._KoData && window._KoData.moves[mv.id]) {
					mv.koName = window._KoData.moves[mv.id].name;
				}
				return mv;
			};
			// items.get 래핑
			var _origIt = moddedDex.items.get;
			moddedDex.items.get = function(name) {
				var it = _origIt.call(this, name);
				if (it && it.exists !== false && !it.koName && window._KoData && window._KoData.items[it.id]) {
					it.koName = window._KoData.items[it.id].name;
				}
				return it;
			};
			// abilities.get 래핑
			var _origAb = moddedDex.abilities.get;
			moddedDex.abilities.get = function(name) {
				var ab = _origAb.call(this, name);
				if (ab && ab.exists !== false && !ab.koName && window._KoData && window._KoData.abilities[ab.id]) {
					ab.koName = window._KoData.abilities[ab.id].name;
				}
				return ab;
			};
			moddedDex._koGetPatch = true;
			return moddedDex;
		};
		// forGen도 mod를 내부적으로 호출하므로 자동으로 적용됨
		window.Dex._koModPatch = true;
		console.log('[한글화] Dex.mod() koName 패치 완료');
		return true;
	}
	patchModdedDex();
	window.addEventListener('load', patchModdedDex);
	setTimeout(patchModdedDex, 1000);
})();

// Search 검색 결과 목록 한글화 패치
// koName 아키텍처: .name=영어(내부용), .koName=한글(표시용)
// 원본 렌더링 후 HTML에서 표시명만 한글로 교체 (data-entry는 영어 유지)
(function() {
	patchWhenReady(function() {
		if (typeof BattleSearch === 'undefined' || !BattleSearch.prototype) return false;
		if (BattleSearch._koRowPatch) return true;

		// Pokemon row: 이름 + 특성 한글화
		var _origPokemon = BattleSearch.prototype.renderPokemonRow;
		BattleSearch.prototype.renderPokemonRow = function(pokemon, matchStart, matchLength, errorMessage, attrs) {
			var html = _origPokemon.call(this, pokemon, matchStart, matchLength, errorMessage, attrs);
			if (!pokemon || !pokemon.koName) return html;
			// pokemonnamecol 내용을 한글명으로 교체
			html = html.replace(/(<span class="col pokemonnamecol">)[\s\S]*?(<\/span> )/, '$1' + pokemon.koName + '$2');
			// 특성 한글화
			if (pokemon.abilities && window._koAb) {
				var slots = ['0', '1', 'H', 'S'];
				for (var i = 0; i < slots.length; i++) {
					var en = pokemon.abilities[slots[i]];
					if (!en) continue;
					var ko = _koAb(en);
					if (ko !== en) html = html.split(en).join(ko);
				}
			}
			return html;
		};

		// Item row
		var _origItem = BattleSearch.prototype.renderItemRow;
		BattleSearch.prototype.renderItemRow = function(item, matchStart, matchLength, errorMessage, attrs) {
			var html = _origItem.call(this, item, matchStart, matchLength, errorMessage, attrs);
			if (!item || !item.koName) return html;
			html = html.replace(/(<span class="col namecol">)[\s\S]*?(<\/span> )/, '$1' + item.koName + '$2');
			return html;
		};

		// Ability row
		var _origAbility = BattleSearch.prototype.renderAbilityRow;
		BattleSearch.prototype.renderAbilityRow = function(ability, matchStart, matchLength, errorMessage, attrs) {
			var html = _origAbility.call(this, ability, matchStart, matchLength, errorMessage, attrs);
			if (!ability || !ability.koName) return html;
			html = html.replace(/(<span class="col namecol">)[\s\S]*?(<\/span> )/, '$1' + ability.koName + '$2');
			return html;
		};

		// Move row
		var _origMove = BattleSearch.prototype.renderMoveRow;
		BattleSearch.prototype.renderMoveRow = function(move, matchStart, matchLength, errorMessage, attrs) {
			var html = _origMove.call(this, move, matchStart, matchLength, errorMessage, attrs);
			if (!move || !move.koName) return html;
			html = html.replace(/(<span class="col movenamecol">)[\s\S]*?(<\/span> )/, '$1' + move.koName + '$2');
			return html;
		};

		// Static references 업데이트
		BattleSearch.renderPokemonRow = BattleSearch.prototype.renderPokemonRow;
		BattleSearch.renderItemRow = BattleSearch.prototype.renderItemRow;
		BattleSearch.renderAbilityRow = BattleSearch.prototype.renderAbilityRow;
		BattleSearch.renderMoveRow = BattleSearch.prototype.renderMoveRow;

		BattleSearch._koRowPatch = true;
		console.log('[한글화] BattleSearch 검색 결과 한글명 패치 완료');
		return true;
	});
})();

// ===== 표시 계층 패치: .name은 영어 유지, koName으로 한글 표시 =====
// .name을 덮어쓰지 않으므로 역변환(resolveKo, koToEnName 등) 완전 불필요!
// 필요한 것은 표시 시점에서 koName을 보여주는 것뿐.

// 전역 한글 표시명 헬퍼
window._koDisplayName = function(obj) {
	return (obj && obj.koName) || (obj && obj.name) || '';
};
// 특성 영어명 → 한글명 변환 헬퍼 (검색 결과 목록용)
window._koAb = function(name) {
	if (!name || typeof name !== 'string' || !window.Dex) return name;
	var a = Dex.abilities.get(name);
	return (a && a.koName) || name;
};

// Dex.species/items/moves/abilities.get: 한글 입력 → BattleAliases로 영어 ID 변환
// .name은 건드리지 않음. 한글을 toID()에 넣으면 빈 문자열이 되므로 BattleAliases 조회 필요.
(function() {
	var _koRe = /[\uAC00-\uD7A3\u3131-\u318E\u314F-\u3163]/;
	var _koToId = function(s) { return (''+s).toLowerCase().replace(/[^a-z0-9\uAC00-\uD7A3\u3131-\u318E\u314F-\u3163]+/g, ''); };

	patchWhenReady(function() {
		if (typeof Dex === 'undefined' || !Dex.species) return false;
		if (Dex.species._koPatch) return true;

		var _origSpecies = Dex.species.get;
		Dex.species.get = function(name) {
			var result;
			if (name && typeof name === 'string' && _koRe.test(name) && window.BattleAliases) {
				var koKey = _koToId(name);
				var enId = window.BattleAliases[koKey];
				if (enId) result = _origSpecies.call(this, enId);
			}
			if (!result) result = _origSpecies.call(this, name);
			// Species 생성자가 koName을 복사하지 않으므로, _KoData에서 복원
			if (result && !result.koName && window._KoData && window._KoData.pokemon) {
				var koData = window._KoData.pokemon[result.id];
				if (koData && koData.name) result.koName = koData.name;
			}
			return result;
		};
		Dex.species._koPatch = true;

		var _origItems = Dex.items.get;
		Dex.items.get = function(name) {
			var result;
			if (name && typeof name === 'string' && _koRe.test(name) && window.BattleAliases) {
				var koKey = _koToId(name);
				var enId = window.BattleAliases[koKey];
				if (enId) result = _origItems.call(this, enId);
			}
			if (!result) result = _origItems.call(this, name);
			if (result && !result.koName && window._KoData && window._KoData.items) {
				var koData = window._KoData.items[result.id];
				if (koData && koData.name) result.koName = koData.name;
			}
			return result;
		};

		var _origMoves = Dex.moves.get;
		Dex.moves.get = function(name) {
			var result;
			if (name && typeof name === 'string' && _koRe.test(name) && window.BattleAliases) {
				var koKey = _koToId(name);
				var enId = window.BattleAliases[koKey];
				if (enId) result = _origMoves.call(this, enId);
			}
			if (!result) result = _origMoves.call(this, name);
			if (result && !result.koName && window._KoData && window._KoData.moves) {
				var koData = window._KoData.moves[result.id];
				if (koData && koData.name) result.koName = koData.name;
			}
			return result;
		};

		var _origAbilities = Dex.abilities.get;
		Dex.abilities.get = function(name) {
			var result;
			if (name && typeof name === 'string' && _koRe.test(name) && window.BattleAliases) {
				var koKey = _koToId(name);
				var enId = window.BattleAliases[koKey];
				if (enId) result = _origAbilities.call(this, enId);
			}
			if (!result) result = _origAbilities.call(this, name);
			if (result && !result.koName && window._KoData && window._KoData.abilities) {
				var koData = window._KoData.abilities[result.id];
				if (koData && koData.name) result.koName = koData.name;
			}
			return result;
		};

		console.log('[한글화] Dex.species/items/moves/abilities.get 한글→영어 변환 패치 완료');
		return true;
	});
})();

// TeamEditorState.getResultValue 패치: 검색 결과에 한글명 표시
// 원본: dex.species.get(result[1]).name → 영어
// 패치: dex.species.get(result[1]).koName || .name → 한글
(function() {
	patchWhenReady(function() {
		if (typeof TeamEditorState === 'undefined' || !TeamEditorState.prototype) return false;
		if (TeamEditorState.prototype._koResultPatch) return true;
		var proto = TeamEditorState.prototype;
		if (!proto.getResultValue) return false;
		var _orig = proto.getResultValue;
		proto.getResultValue = function(result) {
			var val = _orig.call(this, result);
			if (!val || !result) return val;
			var type = result[0];
			var id = result[1];
			if (!id || typeof id !== 'string') return val;
			try {
				var obj = null;
				switch (type) {
					case 'pokemon': obj = this.dex.species.get(id); break;
					case 'item': obj = this.dex.items.get(id); break;
					case 'ability': obj = this.dex.abilities.get(id); break;
					case 'move':
						if (id.startsWith('_')) break; // separator row
						obj = this.dex.moves.get(id);
						break;
				}
				if (obj && obj.koName) return obj.koName;
			} catch(e) {}
			return val;
		};
		proto._koResultPatch = true;
		console.log('[한글화] TeamEditorState.getResultValue 한글 표시 패치 완료');
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
