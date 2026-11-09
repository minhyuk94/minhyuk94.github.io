// 오늘의 운세: 날짜(와 생년월일)로 정해지는 재미용 운세. 같은 날·같은 사람이면 늘 같은 결과.
// 화면(index.html)과 테스트(fortune.test.mjs)가 함께 쓴다. 문구는 모두 새로 쓴 것.

/** 글자 → 32비트 해시 (FNV-1a) */
export function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
/** 씨앗으로 정해지는 난수 (0 이상 1 미만) */
export function rng(seed) {
  let a = hash(seed) || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

/** 로컬 날짜를 "2026-11-10" 으로 */
export function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const ANIMALS = [
  { id: 'rat', name: '쥐띠', emoji: '🐭' }, { id: 'ox', name: '소띠', emoji: '🐮' }, { id: 'tiger', name: '호랑이띠', emoji: '🐯' },
  { id: 'rabbit', name: '토끼띠', emoji: '🐰' }, { id: 'dragon', name: '용띠', emoji: '🐲' }, { id: 'snake', name: '뱀띠', emoji: '🐍' },
  { id: 'horse', name: '말띠', emoji: '🐴' }, { id: 'sheep', name: '양띠', emoji: '🐑' }, { id: 'monkey', name: '원숭이띠', emoji: '🐵' },
  { id: 'rooster', name: '닭띠', emoji: '🐔' }, { id: 'dog', name: '개띠', emoji: '🐶' }, { id: 'pig', name: '돼지띠', emoji: '🐷' },
];
/** 태어난 해 → 띠 (양력 해 기준. 설 전에 태어났으면 앞 해 띠일 수 있음) */
export function animalOf(year) {
  return ANIMALS[(((year - 4) % 12) + 12) % 12];
}

export const SIGNS = [
  ['염소자리', '♑', 1, 19], ['물병자리', '♒', 2, 18], ['물고기자리', '♓', 3, 20], ['양자리', '♈', 4, 19],
  ['황소자리', '♉', 5, 20], ['쌍둥이자리', '♊', 6, 21], ['게자리', '♋', 7, 22], ['사자자리', '♌', 8, 22],
  ['처녀자리', '♍', 9, 22], ['천칭자리', '♎', 10, 23], ['전갈자리', '♏', 11, 22], ['사수자리', '♐', 12, 21],
];
/** 생일 → 별자리 [이름, 기호] */
export function signOf(month, day) {
  const i = month - 1;
  const [name, sym, , end] = SIGNS[i];
  if (day <= end) return [name, sym];
  const n = SIGNS[(i + 1) % 12];
  return [n[0], n[1]];
}

// ── 문구 ──
const TOTAL = [
  // 0: 조심 (1~39)
  ['서두르면 꼬이는 날이에요. 한 박자 쉬고 움직이면 손해를 피할 수 있어요.', '작은 실수가 눈덩이처럼 커질 수 있어요. 확인을 두 번 하세요.', '오늘은 새로 벌이기보다 하던 일을 정리하기 좋은 날이에요.', '기대보다 더딘 하루지만, 지나고 보면 쉬어 가는 날이었다고 느낄 거예요.'],
  // 1: 보통 아래 (40~59)
  ['큰 일은 없지만 사소한 일에 마음이 흔들릴 수 있어요. 기준을 하나 정해 두세요.', '평범하게 흘러가는 날. 무리하지 않으면 무난하게 마무리돼요.', '해야 할 일 목록을 줄이면 오히려 더 많이 끝낼 수 있어요.', '남의 말보다 내 감을 믿어도 되는 날이에요. 다만 말은 부드럽게.'],
  // 2: 보통 위 (60~74)
  ['미뤄 둔 일을 하나 끝내면 하루가 가벼워져요.', '작은 행운이 군데군데 숨어 있어요. 주변을 잘 둘러보세요.', '꾸준히 해 온 일이 조금씩 빛을 보기 시작해요.', '반가운 연락이 기분을 끌어올려 줄 거예요.'],
  // 3: 좋음 (75~89)
  ['하는 일마다 손발이 척척 맞는 날이에요. 자신 있게 밀어붙이세요.', '생각보다 일이 빨리 풀려요. 남는 시간은 나를 위해 쓰세요.', '사람 운이 좋아요. 먼저 말을 걸면 좋은 인연으로 이어져요.', '머릿속으로만 그리던 계획을 꺼내 보기 좋은 날이에요.'],
  // 4: 아주 좋음 (90~100)
  ['오늘은 흐름이 내 편이에요. 망설이던 일에 첫발을 떼 보세요.', '노력한 만큼, 아니 그 이상으로 돌아오는 날이에요.', '반짝이는 아이디어가 떠오르면 바로 적어 두세요. 큰 일이 될 수 있어요.', '웃을 일이 많은 하루. 그 기운을 주변에도 나눠 주세요.'],
];
const PARTS = {
  money: { label: '금전', icon: '💰', lines: [
    ['충동구매를 조심하세요. 장바구니는 내일 다시 보기.', '지갑이 가볍게 느껴지는 날. 작은 지출부터 점검해 보세요.', '빌려주는 돈은 돌아오기 어려운 날이에요.'],
    ['들어오는 만큼 나가는 날. 계획대로만 쓰면 괜찮아요.', '오래 고민하던 물건은 오늘 말고 주말에.', '잔돈을 모으면 생각보다 쏠쏠해요.'],
    ['뜻밖의 작은 수입이나 할인이 생길 수 있어요.', '아껴 둔 것이 쓸모를 찾는 날이에요.', '돈 이야기를 꺼내기 좋은 날. 협상이 잘 풀려요.'],
  ] },
  love: { label: '애정', icon: '💗', lines: [
    ['말 한마디가 오해를 부를 수 있어요. 오늘은 듣는 쪽이 되어 주세요.', '서운한 마음은 쌓아 두지 말고 가볍게 털어놓으세요.', '혼자만의 시간이 오히려 관계를 지켜 줘요.'],
    ['잔잔하고 편안한 하루. 함께 밥 한 끼면 충분해요.', '오래된 친구에게 안부를 물어보세요.', '사소한 약속을 지키는 것이 큰 믿음이 돼요.'],
    ['눈이 마주치면 먼저 웃어 보세요. 좋은 일이 생겨요.', '고백이나 화해에 좋은 날이에요.', '연락이 뜸했던 사람이 먼저 손을 내밀어요.'],
  ] },
  health: { label: '건강', icon: '🍀', lines: [
    ['피로가 쌓이기 쉬워요. 오늘은 일찍 잠자리에 드세요.', '목과 어깨를 자주 풀어 주세요.', '찬 음식보다 따뜻한 국물이 좋아요.'],
    ['물을 자주 마시면 몸이 가벼워져요.', '가벼운 산책이 기분 전환에 딱이에요.', '화면을 오래 보면 눈이 지쳐요. 틈틈이 먼 곳을 보세요.'],
    ['몸이 가벼운 날. 미뤄 둔 운동을 시작하기 좋아요.', '푹 잔 만큼 하루가 상쾌해요.', '좋아하는 음식이 기운을 채워 줘요.'],
  ] },
  work: { label: '일·공부', icon: '📚', lines: [
    ['꼼꼼함이 필요한 날. 숫자와 날짜를 다시 확인하세요.', '혼자 끌어안지 말고 도움을 청하세요.', '큰 결정은 하루만 미뤄도 늦지 않아요.'],
    ['하던 일을 차근차근. 순서만 지키면 막힘이 없어요.', '회의나 수업에서 메모가 나중에 큰 도움이 돼요.', '새로운 것보다 복습이 잘 되는 날이에요.'],
    ['집중력이 좋아요. 어려운 일을 먼저 처리하세요.', '내 의견이 잘 받아들여지는 날이에요.', '배운 것이 바로 써먹히는 하루예요.'],
  ] },
};
const COLORS = [['빨강', '#e5484d'], ['주황', '#f76b15'], ['노랑', '#ffc53d'], ['연두', '#8db654'], ['초록', '#30a46c'], ['하늘', '#3e9bd8'], ['파랑', '#3e63dd'], ['보라', '#8e4ec6'], ['분홍', '#e93d82'], ['갈색', '#a07553'], ['흰색', '#f4f4f2'], ['검정', '#2b2b2b'], ['금색', '#d4a72c'], ['은색', '#b8bcc6']];
const ITEMS = ['손수건', '볼펜', '따뜻한 차', '이어폰', '작은 수첩', '거울', '우산', '초콜릿', '반지', '머리끈', '향기 좋은 핸드크림', '동전 하나', '좋아하는 노래', '운동화', '사진 한 장', '열쇠고리', '책갈피', '귤'];
const DIRS = ['동쪽', '서쪽', '남쪽', '북쪽', '남동쪽', '남서쪽', '북동쪽', '북서쪽'];
const TIMES = ['이른 아침', '오전', '점심 무렵', '오후', '해 질 녘', '저녁', '늦은 밤'];
const WORDS = [
  '천천히 가도 멈추지만 않으면 된다.', '오늘의 작은 친절이 내일의 큰 행운이 된다.', '모르는 길은 물어 가면 된다.',
  '잘한 일 하나를 떠올리며 잠들자.', '완벽보다 완성이 먼저다.', '웃는 얼굴에 복이 들어온다.', '비 온 뒤에 땅이 굳는다.',
  '내가 아끼는 것을 오늘 한 번 더 아끼자.', '시작이 반, 나머지 반은 꾸준함.', '마음이 급할수록 숨을 한 번 고르자.',
  '좋은 사람 곁에 좋은 일이 모인다.', '어제보다 한 걸음이면 충분하다.', '듣는 귀가 열리면 길이 보인다.',
  '작은 정리가 큰 여유를 만든다.', '오늘 심은 씨앗은 언젠가 꽃이 된다.', '고마운 사람에게 한마디 건네자.',
  '하기 싫은 일 하나를 먼저 끝내자.', '내 속도대로 가도 괜찮다.', '실수는 다음을 위한 연습이다.', '배부른 밥 한 끼가 보약이다.',
];
const ANIMAL_LINE = [
  ['조금 쉬어 가도 괜찮은 날', '말을 아끼면 득이 되는 날', '정리하면 길이 보이는 날'],
  ['무난하게 흘러가는 날', '작은 기쁨이 있는 날', '약속을 잘 지키면 좋은 날'],
  ['반가운 소식이 오는 날', '손이 빠르게 움직이는 날', '사람 운이 좋은 날'],
  ['기운이 넘치는 날', '하는 일마다 잘 풀리는 날', '도전해 볼 만한 날'],
];

function bucket5(score) { return score < 40 ? 0 : score < 60 ? 1 : score < 75 ? 2 : score < 90 ? 3 : 4; }
function bucket3(score) { return score < 45 ? 0 : score < 72 ? 1 : 2; }
/** 점수 1~100: 가운데가 많고 양끝이 드물게 */
function score(r) { return Math.max(1, Math.min(100, Math.round(((r() + r() + r()) / 3) * 100 + 8))); }

/** 생년월일(YYYY-MM-DD)과 날짜로 오늘의 운세 */
export function fortune(birth, date) {
  const r = rng(`${date}|${birth}`);
  const total = score(r);
  const parts = Object.entries(PARTS).map(([id, p]) => {
    const s = Math.max(1, Math.min(100, Math.round(total * 0.5 + score(r) * 0.5)));
    return { id, label: p.label, icon: p.icon, score: s, text: pick(r, p.lines[bucket3(s)]) };
  });
  const [cname, chex] = pick(r, COLORS);
  const nums = new Set();
  while (nums.size < 2) nums.add(1 + Math.floor(r() * 45));
  return {
    date, birth, total, stars: Math.max(1, Math.round(total / 20)),
    text: pick(r, TOTAL[bucket5(total)]), parts,
    color: { name: cname, hex: chex }, numbers: [...nums].sort((a, b) => a - b),
    item: pick(r, ITEMS), dir: pick(r, DIRS), time: pick(r, TIMES), word: pick(r, WORDS),
  };
}

/** 띠별 오늘의 한 줄 (12개) */
export function animalsToday(date) {
  return ANIMALS.map((a) => {
    const r = rng(`${date}|animal|${a.id}`);
    const s = score(r);
    const b = s < 45 ? 0 : s < 62 ? 1 : s < 80 ? 2 : 3;
    return { ...a, score: s, stars: Math.max(1, Math.round(s / 20)), text: pick(r, ANIMAL_LINE[b]), color: pick(r, COLORS)[0], number: 1 + Math.floor(r() * 9) };
  });
}

/** "1994-03-15" 이 맞는 생년월일인지 */
export function validBirth(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
  if (!m) return false;
  const y = +m[1], mo = +m[2], d = +m[3];
  const dt = new Date(y, mo - 1, d);
  return y >= 1900 && y <= 2100 && dt.getMonth() === mo - 1 && dt.getDate() === d;
}
