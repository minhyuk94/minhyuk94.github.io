import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fortune, animalsToday, animalOf, signOf, validBirth, ymd } from './fortune.js';

test('같은 날·같은 사람이면 늘 같고, 날이 바뀌면 달라짐', () => {
  assert.deepEqual(fortune('1994-03-15', '2026-11-10'), fortune('1994-03-15', '2026-11-10'));
  const days = new Set(Array.from({ length: 10 }, (_, i) => JSON.stringify(fortune('1994-03-15', `2026-11-${String(i + 1).padStart(2, '0')}`))));
  assert.equal(days.size, 10);
  assert.notDeepEqual(fortune('1994-03-15', '2026-11-10'), fortune('1990-07-01', '2026-11-10'));
});

test('점수와 칸이 알맞은 범위', () => {
  const seen = new Set();
  for (let i = 0; i < 400; i++) {
    const f = fortune('2000-01-01', `x${i}`);
    assert.ok(f.total >= 1 && f.total <= 100);
    assert.ok(f.stars >= 1 && f.stars <= 5);
    assert.equal(f.parts.length, 4);
    assert.ok(f.parts.every((p) => p.text && p.score >= 1 && p.score <= 100));
    assert.equal(f.numbers.length, 2);
    assert.ok(f.numbers[0] < f.numbers[1] && f.numbers[1] <= 45);
    assert.ok(f.text && f.word && f.item && f.dir && f.time && /^#/.test(f.color.hex));
    seen.add(f.stars);
  }
  assert.ok(seen.size >= 4, '별 개수가 고루 나옴');
});

test('띠·별자리·날짜', () => {
  assert.equal(animalOf(1994).name, '개띠');
  assert.equal(animalOf(2024).name, '용띠');
  assert.equal(animalOf(1900).name, '쥐띠');
  assert.deepEqual(signOf(3, 15), ['물고기자리', '♓']);
  assert.deepEqual(signOf(3, 21), ['양자리', '♈']);
  assert.deepEqual(signOf(12, 25), ['염소자리', '♑']);
  assert.deepEqual(signOf(1, 19), ['염소자리', '♑']);
  assert.ok(validBirth('1994-03-15'));
  assert.ok(!validBirth('1994-02-30'));
  assert.ok(!validBirth('94-3-15'));
  assert.equal(ymd(new Date(2026, 10, 9)), '2026-11-09');
  const a = animalsToday('2026-11-10');
  assert.equal(a.length, 12);
  assert.deepEqual(a, animalsToday('2026-11-10'));
});
