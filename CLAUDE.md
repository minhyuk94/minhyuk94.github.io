# 이 저장소에서 작업할 때 지킬 것

유민혁(minhyuk94)의 이력서 사이트입니다. 사용자는 한국어로 대화합니다.

## 구조

- 내용은 전부 `src/data/resume.json` 하나 (ko / ja / en). 화면은 `src/components/Resume.astro`.
- 이력서 주소는 **`https://minhyuk94.github.io/resume/`** (`astro.config.mjs`의 `base: '/resume'`, 결과는 `dist/resume/`). 루트에서 이력서로 자동으로 보내지 않는다(사용자 요청). 사이트 안 주소·이미지 경로(`/images/…`)는 화면에서 꼭 `url()`(`src/lib/resume.ts`)로 감싼다. 데이터에는 `/images/…` 그대로 적는다.
- 기본 브랜치는 **`master`**. master에 푸시하면 GitHub Actions가 `scripts/validate-resume.mjs`로 데이터 검사 → `astro check` → 빌드 → GitHub Pages 배포.
- `/admin` 웹 편집 페이지는 GitHub Contents API로 master의 `src/data/resume.json`에 직접 커밋한다. 데이터 구조를 바꾸면 `src/admin/fields.tsx`의 라벨·힌트·템플릿, `scripts/validate-resume.mjs`도 같이 고친다.

## 옮긴 게임 (조직 mhyoo-games)

- 게임들은 조직 `mhyoo-games`로 옮겼다 → `https://mhyoo-games.github.io/<게임>/`. 이력서 `games`의 `link`도 새 주소.
- 예전 주소 `minhyuk94.github.io/<게임>/`에는 `scripts/root-pages.mjs`가 `moved/games.mjs`로 안내 페이지를 만든다. `moved/moved.js`가 그 게임의 저장(localStorage 앞글자, Godot는 IndexedDB `/userfs`의 저장 파일)을 챙겨 `#carry=`로 새 주소에 보낸다(각 게임의 `carry.js`가 받음). 게임을 더 옮기면 `MOVED`에 더하고 `moved/moved.test.mjs`를 맞춘다.

## 사이트 맨 앞: 오늘의 운세

- `https://minhyuk94.github.io/`는 **오늘의 운세** 페이지 (`fortune/index.html` + `fortune/fortune.js`, 빌드 없는 정적 파일). `scripts/root-pages.mjs`가 빌드 후 `dist/`에 복사한다.
- 날짜(+생년월일)로 정해지는 재미용 운세. 같은 날·같은 사람이면 늘 같은 결과. 문구는 새로 쓴 것만. 규칙을 바꾸면 `fortune/fortune.test.mjs`(CI에서 실행)를 맞춘다.
- 생년월일은 방문자 브라우저(localStorage)에만 저장하고 어디로도 보내지 않는다.
- 한국어·일본어·영어 지원 (`?lang=`, 고른 언어 저장, 없으면 브라우저 언어). 문구(`TEXT`)는 세 언어가 같은 모양·같은 순서라 언어를 바꿔도 점수·뜻이 같다(테스트로 확인). 일본어의 열두 번째 띠는 멧돼지(いのしし).

## 개인정보 (절대 규칙)

- **전화번호, 집 주소(우편번호·번지·건물명)는 어떤 파일에도 넣지 않는다.** 이 저장소는 공개이고, 예전에 이 정보가 노출돼 저장소를 지우고 새로 만들었다.
- 지역은 "Tokyo, Japan / 東京 / 일본 도쿄" 수준까지만. 연락처는 이메일과 LinkedIn.
- 생년월일은 사용자가 공개를 원해서 넣어 둔 상태.

## 내용 원칙

- 사용자가 말하지 않은 수치·성과·기술을 지어내지 않는다. 일반적인 표현으로 쓴 부분은 사용자에게 알리고 확인받는다.
- ko / ja / en 세 언어를 항상 같은 뜻으로 맞춘다. 일본어는 일본 채용 담당자가 읽기에 자연스러운 표현으로.
- 경력 연수·회사 수 등 첫 화면 숫자는 데이터에서 자동 계산되므로 직접 쓰지 않는다.

## 새 프로젝트를 만들면 (사용자 요청으로 계속 적용)

1. 새 저장소에는 **자동 빌드 검사(GitHub Actions)** 를 처음부터 넣는다.
2. 프로젝트가 완성되면 이 이력서의 `projects`에 카드를 추가한다. **게임은 `games`에** 따로 둔다 (같은 필드 + `gallery`: 화면 모음 `{ image, caption }`, `/[lang]/games/` 게임 화면 페이지에 보인다. 화면 이미지는 `public/images/games/`).
   - **소스 코드는 공개하지 않는다.** 저장소 링크를 넣지 않는다. 프로그램이 무엇이고 왜 만들었는지만 소개한다.
   - 필드: `name`(게임은 `{ko, ja, en}` 언어별 이름, 프로그램은 글자 하나), `icon`(이모지), `period`("YYYY-MM", 순서용이고 화면에는 안 보임), `image`(대표 화면, 사용자가 /admin에서 올림), `link`(공개 데모가 있을 때만), `summary`, `why`(만든 이유 — 사용자가 말한 동기를 살림), `features`(4줄 안팎), `tags`.
   - 최신 프로젝트를 앞에 둔다.
3. 대표 화면 캡처는 사용자가 로컬 Docker에서 찍어 /admin "사진 올리기"로 올린다. 개인 메모·회사 정보가 찍히지 않게 안내한다.

## 미리보기 방법

이 작업 환경에서는 npm 설치와 github.io 접속이 막혀 있을 수 있다. 그럴 때는:

1. 작업 브랜치에 임시 워크플로를 넣어 빌드 결과(`dist`)를 `preview-build` 브랜치로 푸시하게 한다.
2. 그 브랜치를 git으로 받아 로컬 http 서버 + headless Chrome으로 PC·휴대폰·PDF(print) 화면을 확인한다.
3. /admin은 Playwright로 `api.github.com` 요청을 가짜 응답으로 바꿔 로그인·저장·사진 업로드를 확인한다.
4. 확인 후 임시 워크플로를 지우고 master에 squash로 합친다. 작업 브랜치 삭제는 프록시에서 막히므로 사용자에게 요청한다.
