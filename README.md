# minhyuk94.github.io

유민혁의 이력서 사이트입니다. 한국어, 일본어, 영어로 볼 수 있습니다. → https://minhyuk94.github.io

- 첫 화면은 방문자 브라우저 언어로 자동 선택됩니다 (`/ko/`, `/ja/`, `/en/`).
- 상단 **PDF로 저장** 버튼을 누르면 A4 인쇄용 레이아웃으로 저장됩니다.

## 내용 고치기

### 웹에서 고치기 (추천)

1. https://minhyuk94.github.io/admin/ 에 들어갑니다.
2. GitHub 토큰으로 로그인합니다. 토큰 만드는 방법은 로그인 화면에 있습니다.
3. 경력, 프로젝트, 기술 등을 폼에서 고치고 **저장하기**를 누릅니다.
4. 1~2분 뒤 사이트에 반영됩니다. 진행 상황은 저장소의 **Actions** 탭에서 볼 수 있습니다.

> 토큰은 **Fine-grained token**으로 만들고 이 저장소 하나에만 `Contents: Read and write` 권한을 주세요. 토큰은 내 브라우저에만 저장되고 GitHub API 외에는 어디에도 보내지 않습니다.

### 파일로 고치기

모든 내용은 [`src/data/resume.json`](src/data/resume.json) 하나에 있습니다. GitHub 웹에서 이 파일을 직접 고쳐도 됩니다.

- 언어별 글자는 `{ "ko": "...", "ja": "...", "en": "..." }` 형식이고, 비어 있는 언어는 다른 언어로 대신 보여집니다.
- `items`(업무 항목)는 한 줄에 하나씩, `tags`·스킬 `items`는 쉼표로 구분합니다.
- 기간은 `"2023-01"` 형식입니다. `end`를 비우면 "현재"(재직 중)로 표시됩니다.
- 경력 연수, 회사 수 같은 첫 화면 숫자는 데이터에서 자동으로 계산됩니다.

저장할 때마다 자동으로 데이터 형식을 검사합니다. 형식이 틀리면 배포가 멈추고 기존 사이트는 그대로 유지되니, Actions 탭의 오류 메시지를 보고 고치면 됩니다.

## 개발

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # 타입 검사 + 정적 사이트 생성 (dist/)
```

| 구성 | 기술 |
|---|---|
| 사이트 | [Astro](https://astro.build) (정적 HTML 생성, 자바스크립트 최소화) |
| 편집 페이지 | React (`src/admin/`), GitHub Contents API |
| 배포 | GitHub Actions → GitHub Pages |

```
src/
├── data/resume.json      이력서 내용 (여기만 고치면 됨)
├── components/Resume.astro  이력서 화면
├── pages/[lang]/         /ko/ /ja/ /en/
├── pages/admin/          웹 편집 페이지
├── admin/                편집기 (자동 폼, GitHub 저장)
├── lib/                  데이터 형식, 기간 계산, 화면 문구
└── styles/global.css     디자인
scripts/validate-resume.mjs  배포 전 데이터 검사
```
