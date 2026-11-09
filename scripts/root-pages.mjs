// 사이트 맨 앞(https://minhyuk94.github.io/)은 "오늘의 운세" 페이지다 (fortune/ 폴더, 빌드 없이 그대로 복사).
// 이력서는 Astro가 dist/resume/ 에 만든다. 루트에서 이력서로 자동으로 보내지 않는다.
// (dalmaru·haesol 같은 게임은 각자 저장소의 GitHub Pages라 /dalmaru/ 등은 건드리지 않는다)
import { copyFileSync, existsSync, renameSync } from 'node:fs';

for (const f of ['index.html', 'fortune.js']) copyFileSync(`fortune/${f}`, `dist/${f}`);
// 검색 로봇 안내는 사이트 맨 앞에 있어야 한다
if (existsSync('dist/resume/robots.txt')) renameSync('dist/resume/robots.txt', 'dist/robots.txt');
console.log('루트(오늘의 운세) 준비됨');
