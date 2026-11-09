import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fortune, animalsToday, animalOf, animalLabel, signOf, validBirth, ymd, pickLang, TEXT, LANGS } from './fortune.js';

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

test('세 언어의 문구 모양이 똑같음 (같은 번호 = 같은 뜻)', () => {
  const shape = (v) => (Array.isArray(v) ? v.map(shape) : typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)])) : typeof v);
  for (const l of LANGS) {
    assert.deepEqual(shape(TEXT[l]), shape(TEXT.ko), l);
    const flat = JSON.stringify(TEXT[l]);
    assert.ok(!flat.includes('""'), `${l}: 빈 문구 없음`);
  }
});

test('언어를 바꿔도 점수·숫자는 같고 글만 바뀜', () => {
  for (let i = 0; i < 50; i++) {
    const d = `2026-12-${String((i % 28) + 1).padStart(2, '0')}`, b = `19${50 + i}-0${(i % 9) + 1}-1${i % 9}`;
    const k = fortune(b, d, 'ko'), j = fortune(b, d, 'ja'), e = fortune(b, d, 'en');
    for (const x of [j, e]) {
      assert.equal(x.total, k.total);
      assert.deepEqual(x.numbers, k.numbers);
      assert.equal(x.color.hex, k.color.hex);
      assert.deepEqual(x.parts.map((p) => p.score), k.parts.map((p) => p.score));
    }
    assert.equal(TEXT.ja.words.indexOf(j.word), TEXT.ko.words.indexOf(k.word));
    assert.equal(TEXT.en.items.indexOf(e.item), TEXT.ko.items.indexOf(k.item));
  }
  const ak = animalsToday('2026-11-10', 'ko'), aj = animalsToday('2026-11-10', 'ja');
  assert.deepEqual(ak.map((a) => a.score), aj.map((a) => a.score));
});

test('띠·별자리·날짜·언어 고르기', () => {
  assert.equal(animalOf(1994).name.ko, '개띠');
  assert.equal(animalOf(2024).name.en, 'Dragon');
  assert.equal(animalOf(1900).name.ja, 'ねずみ年');
  assert.deepEqual(animalLabel(animalOf(1995), 'ja'), { name: 'いのしし年', emoji: '🐗' }, '일본은 멧돼지');
  assert.deepEqual(animalLabel(animalOf(1995), 'ko'), { name: '돼지띠', emoji: '🐷' });
  assert.deepEqual(signOf(3, 15), ['물고기자리', '♓']);
  assert.deepEqual(signOf(3, 21, 'ja'), ['おひつじ座', '♈']);
  assert.deepEqual(signOf(12, 25, 'en'), ['Capricorn', '♑']);
  assert.deepEqual(signOf(1, 19), ['염소자리', '♑']);
  assert.ok(validBirth('1994-03-15'));
  assert.ok(!validBirth('1994-02-30'));
  assert.ok(!validBirth('94-3-15'));
  assert.equal(ymd(new Date(2026, 10, 9)), '2026-11-09');
  assert.equal(animalsToday('2026-11-10').length, 12);
  assert.equal(pickLang(['ja-JP', 'en-US']), 'ja');
  assert.equal(pickLang(['fr-FR', 'ko']), 'ko');
  assert.equal(pickLang(['de']), 'en');
});
