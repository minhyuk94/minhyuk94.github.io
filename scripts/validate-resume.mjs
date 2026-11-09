// 이력서 데이터(src/data/resume.json)가 사이트가 기대하는 모양인지 확인한다.
// 문제가 있으면 무엇이 잘못됐는지 알려 주고 배포를 멈춘다 (기존 사이트는 그대로 유지됨).
import { readFileSync } from 'node:fs';

const LANGS = ['ko', 'ja', 'en'];
const errors = [];

let data;
try {
  data = JSON.parse(readFileSync(new URL('../src/data/resume.json', import.meta.url), 'utf8'));
} catch (e) {
  console.error(`resume.json을 읽을 수 없습니다: ${e.message}`);
  process.exit(1);
}

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const l10n = (v, path) => {
  if (!isObj(v)) return errors.push(`${path}: 언어별 글자({ko, ja, en})여야 합니다`);
  for (const l of LANGS) if (typeof v[l] !== 'string') errors.push(`${path}.${l}: 글자여야 합니다`);
};
const str = (v, path) => typeof v === 'string' || errors.push(`${path}: 글자여야 합니다`);
const arr = (v, path, each) => {
  if (!Array.isArray(v)) return errors.push(`${path}: 목록이어야 합니다`);
  v.forEach((item, i) => each(item, `${path}[${i}]`));
};
const ym = (v, path, optional) => {
  if (optional && v === '') return;
  if (typeof v !== 'string' || !/^\d{4}-\d{2}$/.test(v)) errors.push(`${path}: "2024-05" 형식이어야 합니다 (지금: ${JSON.stringify(v)})`);
};

const p = data.profile ?? {};
for (const k of ['name', 'role', 'tagline', 'location', 'nationality']) l10n(p[k], `profile.${k}`);
for (const k of ['birthDate', 'photo', 'email']) str(p[k], `profile.${k}`);
if (p.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(p.birthDate)) errors.push('profile.birthDate: "1994-12-07" 형식이거나 비어 있어야 합니다');
arr(p.links, 'profile.links', (l, path) => {
  str(l.label, `${path}.label`);
  str(l.url, `${path}.url`);
  if (l.url && !/^https?:\/\//.test(l.url)) errors.push(`${path}.url: http(s)://로 시작해야 합니다`);
});
arr(p.languages, 'profile.languages', (l, path) => {
  l10n(l.name, `${path}.name`);
  l10n(l.level, `${path}.level`);
});

l10n(data.about?.intro, 'about.intro');
arr(data.about?.values, 'about.values', (v, path) => {
  l10n(v.title, `${path}.title`);
  l10n(v.body, `${path}.body`);
});

arr(data.experience, 'experience', (e, path) => {
  if (typeof e.company === 'string') str(e.company, `${path}.company`);
  else l10n(e.company, `${path}.company`);
  str(e.url, `${path}.url`);
  l10n(e.place, `${path}.place`);
  ym(e.start, `${path}.start`, false);
  ym(e.end, `${path}.end`, true);
  arr(e.projects, `${path}.projects`, (pr, pp) => {
    l10n(pr.name, `${pp}.name`);
    str(pr.tags, `${pp}.tags`);
    arr(pr.groups, `${pp}.groups`, (g, gp) => {
      l10n(g.title, `${gp}.title`);
      l10n(g.items, `${gp}.items`);
    });
  });
});

for (const key of ['projects', 'games']) {
  if (data[key] === undefined) continue;
  arr(data[key], key, (pj, path) => {
    // 게임 이름은 언어별, 프로그램 이름은 하나 (둘 다 받음)
    if (pj.name && typeof pj.name === 'object') l10n(pj.name, `${path}.name`);
    else str(pj.name, `${path}.name`);
    if (key === 'games' && typeof pj.name !== 'object') errors.push(`${path}.name: 게임 이름은 ko/ja/en 언어별로 적어 주세요`);
    for (const k of ['icon', 'image', 'link', 'tags']) str(pj[k], `${path}.${k}`);
    for (const k of ['summary', 'why', 'features']) l10n(pj[k], `${path}.${k}`);
    if (pj.period) ym(pj.period, `${path}.period`, true);
    if (pj.link && !/^https?:\/\//.test(pj.link)) errors.push(`${path}.link: http(s)://로 시작해야 합니다`);
    if (pj.gallery !== undefined)
      arr(pj.gallery, `${path}.gallery`, (g, gp) => {
        str(g.image, `${gp}.image`);
        l10n(g.caption, `${gp}.caption`);
      });
  });
}

arr(data.skills, 'skills', (s, path) => {
  l10n(s.category, `${path}.category`);
  str(s.items, `${path}.items`);
});
arr(data.education, 'education', (e, path) => {
  l10n(e.school, `${path}.school`);
  l10n(e.place, `${path}.place`);
  l10n(e.detail, `${path}.detail`);
  ym(e.start, `${path}.start`, false);
  ym(e.end, `${path}.end`, true);
});
arr(data.certificates, 'certificates', (c, path) => {
  l10n(c.name, `${path}.name`);
  str(c.url, `${path}.url`);
});

if (errors.length) {
  console.error(`이력서 데이터에 문제가 ${errors.length}개 있습니다:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log('resume.json OK');
