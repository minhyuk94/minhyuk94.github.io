// 게임이 조직 mhyoo-games 로 옮겨 갔다. 예전 주소(minhyuk94.github.io/<게임>/)로 오면 새 주소로 보내고, 저장도 챙겨 간다.
// ls: 그 게임의 localStorage 앞글자, idb: Godot 저장 파일 이름
export const NEW_HOST = 'https://mhyoo-games.github.io';
export const MOVED = [
  { path: 'youtujam', name: '유튜잼', ls: ['yj_'], idb: [] },
  { path: 'LeftAlonePuppy', name: '홀로 남은 강아지', ls: ['lap_'], idb: [] },
  { path: 'leftalonepuppy', to: 'LeftAlonePuppy', name: '홀로 남은 강아지', ls: ['lap_'], idb: [] },
  { path: 'dalmaru', name: '달마루 모험기', ls: [], idb: ['dalmaru_save'] },
  { path: 'haesol', name: '해솔국 이야기', ls: [], idb: ['haesol_save'] },
  { path: 'flashgames', name: '추억의 오락실', ls: ['flashgames:', 'kkaebi-'], idb: [] },
];

export function page(g) {
  const to = `${NEW_HOST}/${g.to ?? g.path}/`;
  const cfg = JSON.stringify({ to, ls: g.ls, idb: g.idb });
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<link rel="canonical" href="${to}">
<title>${g.name} — 새 주소로 옮겼어요</title>
<noscript><meta http-equiv="refresh" content="0; url=${to}"></noscript>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#1a1221;color:#fff4de;font:16px/1.6 system-ui,sans-serif;text-align:center}a{color:#ffd75a}</style>
<script>window.MOVE = ${cfg};</script>
<script src="/moved.js"></script>
</head>
<body>
<main>
<p><b>${g.name}</b>의 주소가 바뀌었어요. 저장 기록을 챙겨서 옮겨 가는 중…</p>
<p>新しいアドレスに移りました · This game has moved</p>
<p><a href="${to}">${to}</a></p>
</main>
</body>
</html>
`;
}
