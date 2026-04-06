# 포켓몬 쇼다운 한글화 클라이언트 - AI 에이전트 가이드

## 프로젝트 개요

이 프로젝트는 [Pokémon Showdown](https://play.pokemonshowdown.com/) 배틀 시뮬레이터의
한글화 클라이언트를 제작하는 프로젝트입니다.

포켓몬 동아리에서 배틀 대회를 개최할 때, 영어 인터페이스로 인해 신규 부원의 진입 장벽이 높은 문제를 해결합니다.

## 기술 스택

- **원본 소스**: [smogon/pokemon-showdown-client](https://github.com/smogon/pokemon-showdown-client) (AGPLv3)
- **빌드**: Node.js v20+, `node build` 명령
- **프론트엔드**: 순수 JavaScript + HTML + CSS (프레임워크 없음)
- **배포**: GitHub Pages 또는 정적 호스팅 (Netlify/Vercel)
- **배틀 서버**: 공식 Pokémon Showdown 서버에 연결 (자체 서버 불필요)

## 프로젝트 구조

```
showdown/
├── AGENTS.md              # AI 에이전트 가이드 (이 파일)
├── PRD.md                 # 제품 요구사항 문서
├── play.pokemonshowdown.com/  # 클라이언트 소스코드 (포크)
│   ├── js/                # JavaScript 소스
│   ├── style/             # CSS 스타일시트
│   ├── config/            # 설정 파일
│   ├── data/              # 포켓몬 데이터 (이름, 기술, 특성 등)
│   ├── src/               # TypeScript 소스 (새 클라이언트)
│   ├── index.template.html
│   └── testclient.html    # 테스트 진입점
├── translations/          # 한국어 번역 파일
│   ├── ko-ui.json         # UI 요소 번역
│   ├── ko-pokemon.json    # 포켓몬 이름 번역
│   ├── ko-moves.json      # 기술 이름 번역
│   ├── ko-abilities.json  # 특성 이름 번역
│   ├── ko-items.json      # 도구 이름 번역
│   └── ko-formats.json    # 배틀 포맷 번역
└── scripts/               # 빌드/배포 스크립트
```

## 개발 규칙

### 1. 번역 원칙

- 포켓몬, 기술, 특성, 도구 이름은 **한국 공식 명칭** 사용
- UI 텍스트는 자연스러운 한국어로 번역 (직역 금지)
- 고유명사(Pokémon Showdown, OU, UU 등 티어명)는 원문 유지
- 번역이 어려운 경우 영문 병기 (예: "랜덤배틀 (Random Battle)")

### 2. 코드 수정 원칙

- 원본 코드와의 diff를 최소화하여 향후 업스트림 반영 용이하게
- 번역 데이터는 별도 JSON 파일로 관리 (하드코딩 금지)
- 번역 적용 로직은 별도 모듈 (`ko-translation.js`)로 분리

### 3. 빌드 및 테스트

- 빌드: `node build` (프로젝트 루트에서)
- 테스트: `testclient.html`을 로컬 HTTP 서버로 열어 확인
- 로컬 서버: `npx http-server` 실행 후 브라우저에서 접속

### 4. 커밋 메시지

- 한국어로 작성
- 예: `feat: UI 기본 메뉴 한글화`, `fix: 포켓몬 이름 번역 오류 수정`

## 주의사항

- 이 프로젝트는 **비상업적 동아리 활동 목적**입니다
- 원본 라이선스(AGPLv3)를 준수합니다
- 로그인/계정 시스템은 공식 서버를 사용합니다
- sprites, audio 파일은 공식 CDN에서 로드합니다
