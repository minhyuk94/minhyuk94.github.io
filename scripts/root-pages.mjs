// 이력서는 /resume/ 아래에 있다. 루트와 예전 주소로 들어와도 /resume/… 로 보내는 작은 페이지들을 dist/ 에 만든다.
// (dalmaru·haesol 같은 게임은 각자 저장소의 GitHub Pages라 /dalmaru/ 등은 건드리지 않는다)
import { mkdirSync, writeFileSync, renameSync, existsSync } from 'node:fs';

const go = (to) => `<!doctype html><html><head><meta charset="utf-8"><title>이동 중…</title>
<meta name="robots" content="noindex"><link rel="canonical" href="https://minhyuk94.github.io${to}">
<meta http-equiv="refresh" content="0; url=${to}">
<script>location.replace(${JSON.stringify(to)} + location.hash)</script></head>
<body><a href="${to}">${to}</a></body></html>`;

const pages = {
  '': '/resume/',
  ko: '/resume/ko/', ja: '/resume/ja/', en: '/resume/en/',
  'ko/games': '/resume/ko/games/', 'ja/games': '/resume/ja/games/', 'en/games': '/resume/en/games/',
  admin: '/resume/admin/',
  // Jekyll 시절 주소
  profile: '/resume/', 'profile/ko': '/resume/ko/', 'profile/ja': '/resume/ja/', 'profile/en': '/resume/en/',
};
for (const [from, to] of Object.entries(pages)) {
  const dir = `dist/${from}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/index.html`, go(to));
}
// 검색 로봇 안내는 사이트 맨 앞에 있어야 한다
if (existsSync('dist/resume/robots.txt')) renameSync('dist/resume/robots.txt', 'dist/robots.txt');
console.log('루트 이동 페이지 준비됨');
