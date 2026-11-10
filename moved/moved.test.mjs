// 옮긴 게임 안내 페이지: 새 주소·저장 앞글자가 맞는지
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MOVED, page, NEW_HOST } from './games.mjs';

test('옮긴 게임마다 새 주소로 보내는 페이지가 있다', () => {
  const paths = MOVED.map((g) => g.path);
  for (const p of ['youtujam', 'LeftAlonePuppy', 'dalmaru', 'haesol', 'flashgames']) assert.ok(paths.includes(p), p);
  for (const g of MOVED) {
    const html = page(g);
    const to = `${NEW_HOST}/${g.to ?? g.path}/`;
    assert.ok(html.includes(`"to":"${to}"`), g.path);
    assert.ok(html.includes('<script src="/moved.js"></script>'));
    assert.ok(html.includes(`url=${to}`), '스크립트 없이도 넘어감');
    assert.ok(g.ls.length + g.idb.length > 0, `${g.path}: 챙길 저장이 정해져 있음`);
  }
});
