// 사이트 맨 앞(https://minhyuk94.github.io/)은 "오늘의 운세" 페이지다 (fortune/ 폴더, 빌드 없이 그대로 복사).
// 이력서는 Astro가 dist/resume/ 에 만든다. 루트에서 이력서로 자동으로 보내지 않는다.
// 게임은 조직 mhyoo-games 로 옮겼다. 예전 주소 /youtujam/ 등에는 새 주소로 보내는 안내 페이지를 둔다 (moved/, 저장도 챙겨 감).
import { copyFileSync, existsSync, renameSync, mkdirSync, writeFileSync } from 'node:fs';
import { MOVED, page } from '../moved/games.mjs';

for (const f of ['index.html', 'fortune.js']) copyFileSync(`fortune/${f}`, `dist/${f}`);
// 검색 로봇 안내는 사이트 맨 앞에 있어야 한다
if (existsSync('dist/resume/robots.txt')) renameSync('dist/resume/robots.txt', 'dist/robots.txt');
copyFileSync('moved/moved.js', 'dist/moved.js');
for (const g of MOVED) { mkdirSync(`dist/${g.path}`, { recursive: true }); writeFileSync(`dist/${g.path}/index.html`, page(g)); }
console.log('루트(오늘의 운세)·옮긴 게임 안내 준비됨');
