// 이력서 데이터 형식과 표시용 도우미. 데이터는 src/data/resume.json (편집 페이지 /admin에서 수정)

export const LANGS = ['ko', 'ja', 'en'] as const;
export type Lang = (typeof LANGS)[number];

/** 언어별 글자 */
export type L10n = Record<Lang, string>;

export interface Resume {
  profile: {
    name: L10n;
    role: L10n;
    tagline: L10n;
    location: L10n;
    nationality: L10n;
    /** "1994-12-07". 비우면 표시하지 않음 */
    birthDate: string;
    photo: string;
    email: string;
    links: { label: string; url: string }[];
    languages: { name: L10n; level: L10n }[];
  };
  about: {
    /** 줄바꿈으로 문단 구분 */
    intro: L10n;
    values: { title: L10n; body: L10n }[];
  };
  experience: {
    /** 회사 이름. 언어마다 다르게 쓰려면 {ko, ja, en} */
    company: string | L10n;
    url: string;
    place: L10n;
    /** "2023-01" */
    start: string;
    /** "2024-05". 비우면 재직 중 */
    end: string;
    projects: {
      name: L10n;
      /** 쉼표로 구분한 기술 태그 */
      tags: string;
      groups: {
        title: L10n;
        /** 줄바꿈으로 항목 구분 */
        items: L10n;
      }[];
    }[];
  }[];
  /** 사이드 프로젝트 (소스는 비공개, 무엇을 왜 만들었는지 소개) */
  projects?: Project[];
  /** 게임 프로젝트 (모양은 projects와 같다) */
  games?: Project[];
  skills: { category: L10n; items: string }[];
  education: { school: L10n; place: L10n; start: string; end: string; detail: L10n }[];
  certificates: { name: L10n; url: string }[];
}

/** 프로젝트 카드 */
export interface Project {
  name: string;
  /** 이미지가 없을 때 카드에 크게 보일 기호 */
  icon: string;
  /** "2026-11" */
  period: string;
  /** 대표 화면 이미지 경로. 비우면 기호로 대신 */
  image: string;
  /** 직접 써 볼 수 있는 주소 (있을 때만) */
  link: string;
  summary: L10n;
  why: L10n;
  /** 줄바꿈으로 항목 구분 */
  features: L10n;
  tags: string;
  /** 게임 화면 모음 (게임 화면 페이지에 보인다) */
  gallery?: { image: string; caption: L10n }[];
}

/** 글자 하나 또는 언어별 글자 */
export function text(v: string | L10n | undefined, lang: Lang): string {
  return typeof v === 'string' ? v : tr(v, lang);
}

/** 해당 언어가 비어 있으면 다른 언어로 대신 보여준다 */
export function tr(text: L10n | undefined, lang: Lang): string {
  if (!text) return '';
  return text[lang]?.trim() || text.en?.trim() || text.ko?.trim() || text.ja?.trim() || '';
}

export function lines(text: L10n | undefined, lang: Lang): string[] {
  return tr(text, lang)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

/** 쉼표로 나누되 괄호 안의 쉼표는 그대로 둔다: "AWS (EC2, S3), Azure" → ["AWS (EC2, S3)", "Azure"] */
export function list(csv: string | undefined): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of csv ?? '') {
    if (ch === '(' || ch === '（') depth++;
    if ((ch === ')' || ch === '）') && depth > 0) depth--;
    if ((ch === ',' || ch === '、') && depth === 0) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}

function parseYm(ym: string | undefined): { y: number; m: number } | null {
  const m = ym?.match(/^(\d{4})-(\d{1,2})$/);
  return m ? { y: Number(m[1]), m: Number(m[2]) } : null;
}

/** 두 "YYYY-MM" 사이의 개월 수 (양 끝 포함). end가 없으면 지금까지 */
export function months(start: string, end: string, now = new Date()): number {
  const s = parseYm(start);
  const e = parseYm(end) ?? { y: now.getFullYear(), m: now.getMonth() + 1 };
  if (!s) return 0;
  return Math.max(0, (e.y - s.y) * 12 + (e.m - s.m) + 1);
}

const UI = {
  present: { ko: '현재', ja: '現在', en: 'Present' },
  year: { ko: '년', ja: '年', en: 'yr' },
  month: { ko: '개월', ja: 'ヶ月', en: 'mo' },
} as const;

export function formatPeriod(start: string, end: string, lang: Lang): string {
  const f = (ym: string) => ym.replace('-', '.');
  return `${f(start)} – ${end ? f(end) : UI.present[lang]}`;
}

export function formatDuration(total: number, lang: Lang): string {
  const y = Math.floor(total / 12);
  const m = total % 12;
  const parts: string[] = [];
  if (lang === 'en') {
    if (y) parts.push(`${y} ${y > 1 ? 'yrs' : 'yr'}`);
    if (m) parts.push(`${m} mo`);
    return parts.join(' ');
  }
  if (y) parts.push(`${y}${UI.year[lang]}`);
  if (m) parts.push(`${m}${UI.month[lang]}`);
  return parts.join(' ');
}

/** 전체 경력 개월 수 (겹치는 기간은 한 번만) */
export function totalExperienceMonths(r: Resume, now = new Date()): number {
  const covered = new Set<number>();
  for (const e of r.experience) {
    const s = parseYm(e.start);
    const n = months(e.start, e.end, now);
    if (!s) continue;
    for (let i = 0; i < n; i++) {
      const idx = s.y * 12 + (s.m - 1) + i;
      covered.add(idx);
    }
  }
  return covered.size;
}

/** 시작일이 최근인 순서로 */
export function sortedExperience(r: Resume): Resume['experience'] {
  return [...r.experience].sort((a, b) => b.start.localeCompare(a.start));
}
