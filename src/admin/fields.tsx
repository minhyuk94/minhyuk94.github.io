// 이력서 데이터를 모양에 맞춰 자동으로 입력 폼으로 그린다.
// 새 항목을 resume.json에 추가해도 폼이 알아서 따라온다.
import { createContext, useContext, useState } from 'react';

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
type Obj = { [k: string]: Json };

const LANG_KEYS = ['ko', 'ja', 'en'] as const;

/** 사진을 저장소에 올리고 사이트에서 쓸 경로를 돌려주는 함수 (편집기가 제공) */
export const ImageUploadContext = createContext<((file: File, kind: string) => Promise<string>) | null>(null);
/** 이미지 경로로 받는 항목 */
const IMAGE_KEYS = new Set(['photo', 'image']);
const LANG_NAMES: Record<string, string> = { ko: '한국어', ja: '日本語', en: 'English' };

/** 화면에 보일 항목 이름 */
const LABELS: Record<string, string> = {
  profile: '기본 정보',
  about: '소개',
  experience: '경력',
  skills: '기술',
  education: '학력',
  certificates: '자격증',
  projects: '프로젝트',
  games: '게임 프로젝트',
  gallery: '게임 화면 모음',
  caption: '화면 설명',
  icon: '기호 (사진 없을 때)',
  period: '시기',
  image: '대표 화면',
  link: '써 볼 수 있는 주소',
  summary: '한 줄 소개',
  why: '만든 이유',
  features: '주요 기능',
  name: '이름',
  role: '직무',
  tagline: '한 줄 소개',
  location: '지역',
  nationality: '국적',
  birthDate: '생년월일',
  photo: '사진 경로',
  email: '이메일',
  links: '링크',
  label: '표시 이름',
  url: '주소(URL)',
  languages: '언어 능력',
  level: '수준',
  intro: '자기소개',
  values: '중요하게 생각하는 것',
  title: '제목',
  body: '내용',
  company: '회사',
  place: '국가·지역',
  start: '시작',
  end: '종료',
  tags: '기술 태그',
  groups: '업무 묶음',
  items: '항목',
  category: '분류',
  school: '학교',
  detail: '내용',
};

const HINTS: Record<string, string> = {
  birthDate: '예: 1994-12-07 · 비우면 표시 안 함',
  start: '예: 2023-01',
  end: '예: 2024-05 · 비우면 "현재"(재직 중)',
  tags: '쉼표로 구분 (예: Laravel, AWS)',
  items: '한 줄에 하나씩',
  intro: '줄바꿈마다 문단이 나뉘어요. 첫 문단은 크게 보여요',
  photo: '"사진 올리기"를 누르면 자동으로 채워져요',
  image: '"사진 올리기"로 화면 캡처를 올리세요 · 비우면 기호로 대신',
  period: '예: 2026-11',
  link: '공개된 데모가 있을 때만 (예: https://…)',
  features: '한 줄에 하나씩',
  icon: '이모지 하나 (예: 🛡️)',
};

/** 여러 줄 입력이 어울리는 항목 */
const MULTILINE = new Set(['items', 'intro', 'body', 'tagline', 'detail', 'why', 'features']);

export function isL10n(v: Json): v is Record<'ko' | 'ja' | 'en', string> {
  return !!v && typeof v === 'object' && !Array.isArray(v) && LANG_KEYS.every((k) => typeof (v as Obj)[k] === 'string');
}

export function labelOf(key: string) {
  return LABELS[key] ?? key;
}

const E = { ko: '', ja: '', en: '' };
/** 목록이 비었을 때 새 항목의 모양 (항목이 있으면 첫 항목 모양을 따른다) */
const TEMPLATES: Record<string, Json> = {
  projects: { name: '', icon: '', period: '', image: '', link: '', summary: E, why: E, features: E, tags: '' },
  games: { name: '', icon: '', period: '', image: '', link: '', summary: E, why: E, features: E, tags: '', gallery: [{ image: '', caption: E }] },
  gallery: { image: '', caption: E },
  experience: { company: E, url: '', place: E, start: '', end: '', projects: [{ name: E, tags: '', groups: [{ title: E, items: E }] }] },
  certificates: { name: E, url: '' },
  skills: { category: E, items: '' },
  education: { school: E, place: E, start: '', end: '', detail: E },
  links: { label: '', url: '' },
  values: { title: E, body: E },
  languages: { name: E, level: E },
};

/** 배열에 새 항목을 넣을 때 첫 항목과 같은 모양의 빈 값 */
export function blankLike(v: Json): Json {
  if (typeof v === 'string') return '';
  if (typeof v === 'number') return 0;
  if (typeof v === 'boolean') return false;
  if (v === null) return null;
  if (Array.isArray(v)) return v.length ? [blankLike(v[0])] : [];
  const out: Obj = {};
  for (const [k, val] of Object.entries(v)) out[k] = blankLike(val);
  return out;
}

/** 목록 카드 제목으로 쓸 대표 글자 */
function summaryOf(v: Json): string {
  if (typeof v === 'string') return v;
  if (!v || typeof v !== 'object' || Array.isArray(v)) return '';
  if (isL10n(v)) return v.ko || v.en || v.ja;
  for (const key of ['company', 'name', 'school', 'title', 'category', 'label']) {
    const x = (v as Obj)[key];
    if (x !== undefined) {
      const s = summaryOf(x);
      if (s) return s;
    }
  }
  return '';
}

interface FieldProps {
  name: string;
  value: Json;
  onChange: (v: Json) => void;
  depth?: number;
  /** 목록 카드 안에서는 카드 제목이 있으니 묶음 제목을 생략 */
  bare?: boolean;
}

export function Field({ name, value, onChange, depth = 0, bare = false }: FieldProps) {
  if (isL10n(value)) return <L10nField name={name} value={value} onChange={onChange} />;
  if (Array.isArray(value)) return <ArrayField name={name} value={value} onChange={onChange} depth={depth} />;
  if (value && typeof value === 'object') {
    return (
      <fieldset className={`obj depth-${Math.min(depth, 3)}`}>
        {depth > 0 && !bare && <legend>{labelOf(name)}</legend>}
        {Object.entries(value).map(([k, v]) => (
          <Field key={k} name={k} value={v} depth={depth + 1} onChange={(nv) => onChange({ ...value, [k]: nv })} />
        ))}
      </fieldset>
    );
  }
  if (typeof value === 'boolean') {
    return (
      <label className="field check">
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} /> {labelOf(name)}
      </label>
    );
  }
  if (IMAGE_KEYS.has(name) && typeof value === 'string') {
    return <ImageField name={name} value={value} onChange={onChange} />;
  }
  const text = value == null ? '' : String(value);
  const multi = MULTILINE.has(name) || text.includes('\n');
  return (
    <label className="field">
      <span className="field-label">
        {labelOf(name)}
        {HINTS[name] && <small>{HINTS[name]}</small>}
      </span>
      {multi ? (
        <AutoTextarea value={text} onChange={(v) => onChange(v)} />
      ) : (
        <input value={text} onChange={(e) => onChange(typeof value === 'number' ? Number(e.target.value) : e.target.value)} />
      )}
    </label>
  );
}

function L10nField({ name, value, onChange }: { name: string; value: Record<string, string>; onChange: (v: Json) => void }) {
  const multi = MULTILINE.has(name) || LANG_KEYS.some((k) => value[k].includes('\n') || value[k].length > 60);
  return (
    <div className="field l10n">
      <span className="field-label">
        {labelOf(name)}
        {HINTS[name] && <small>{HINTS[name]}</small>}
      </span>
      <div className="l10n-grid">
        {LANG_KEYS.map((k) => (
          <label key={k} className="l10n-cell">
            <span className="lang-tag">{LANG_NAMES[k]}</span>
            {multi ? (
              <AutoTextarea value={value[k]} onChange={(v) => onChange({ ...value, [k]: v })} lang={k} />
            ) : (
              <input value={value[k]} lang={k} onChange={(e) => onChange({ ...value, [k]: e.target.value })} />
            )}
            {!value[k].trim() && <span className="missing">비어 있음 · 다른 언어로 대신 보여요</span>}
          </label>
        ))}
      </div>
    </div>
  );
}

function ArrayField({ name, value, onChange, depth }: { name: string; value: Json[]; onChange: (v: Json) => void; depth: number }) {
  const [open, setOpen] = useState<Set<number>>(() => new Set(value.length <= 1 ? [0] : []));

  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpen((o) => {
      const s = new Set<number>();
      o.forEach((x) => s.add(x === i ? j : x === j ? i : x));
      return s;
    });
  };

  const toggle = (i: number) =>
    setOpen((o) => {
      const s = new Set(o);
      if (s.has(i)) s.delete(i);
      else s.add(i);
      return s;
    });

  const add = (atStart: boolean) => {
    const blank = value.length ? blankLike(value[0]) : (TEMPLATES[name] ?? '');
    onChange(atStart ? [blank, ...value] : [...value, blank]);
    setOpen((o) => {
      const s = new Set<number>();
      if (atStart) {
        o.forEach((x) => s.add(x + 1));
        s.add(0);
      } else {
        o.forEach((x) => s.add(x));
        s.add(value.length);
      }
      return s;
    });
  };

  const remove = (i: number) => {
    const label = summaryOf(value[i]) || `${i + 1}번째 항목`;
    if (!window.confirm(`"${label}"을(를) 지울까요?`)) return;
    onChange(value.filter((_, idx) => idx !== i));
    setOpen((o) => {
      const s = new Set<number>();
      o.forEach((x) => {
        if (x < i) s.add(x);
        else if (x > i) s.add(x - 1);
      });
      return s;
    });
  };

  const simple = value.every((v) => typeof v === 'string');

  return (
    <div className={`array depth-${Math.min(depth, 3)}`}>
      <div className="array-head">
        <span className="field-label">
          {labelOf(name)} <small>{value.length}개</small>
        </span>
        {!simple && value.length > 0 && (
          <button type="button" className="mini" onClick={() => add(true)}>
            + 맨 앞에 추가
          </button>
        )}
      </div>
      {value.map((item, i) => {
        const isOpen = simple || open.has(i);
        return (
          <div key={i} className={`array-item ${isOpen ? 'open' : ''}`}>
            <div className="array-item-bar">
              {!simple && (
                <button type="button" className="disclose" onClick={() => toggle(i)} aria-expanded={isOpen}>
                  <span aria-hidden>{isOpen ? '▾' : '▸'}</span> {summaryOf(item) || `${i + 1}번째 항목 (비어 있음)`}
                </button>
              )}
              {simple && (
                <input className="grow" value={String(item)} onChange={(e) => onChange(value.map((v, idx) => (idx === i ? e.target.value : v)))} />
              )}
              <span className="item-tools">
                <button type="button" className="mini" onClick={() => move(i, -1)} disabled={i === 0} aria-label="위로">↑</button>
                <button type="button" className="mini" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="아래로">↓</button>
                <button type="button" className="mini danger" onClick={() => remove(i)} aria-label="삭제">삭제</button>
              </span>
            </div>
            {!simple && isOpen && (
              <div className="array-item-body">
                <Field name={name} value={item} depth={depth + 1} bare onChange={(nv) => onChange(value.map((v, idx) => (idx === i ? nv : v)))} />
              </div>
            )}
          </div>
        );
      })}
      <button type="button" className="add" onClick={() => add(false)}>
        + {labelOf(name)} 추가
      </button>
    </div>
  );
}

function ImageField({ name, value, onChange }: { name: string; value: string; onChange: (v: Json) => void }) {
  const upload = useContext(ImageUploadContext);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(file: File) {
    if (!upload) return;
    setBusy(true);
    setError(null);
    try {
      const path = await upload(file, name);
      setPreview(URL.createObjectURL(file));
      onChange(path);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const shown = preview ?? (value || null);
  return (
    <div className="field">
      <span className="field-label">
        {labelOf(name)}
        {HINTS[name] && <small>{HINTS[name]}</small>}
      </span>
      <div className="image-field">
        {shown ? <img src={shown} alt="" className={name === 'photo' ? 'photo-preview' : 'shot-preview'} /> : <span className="no-image">없음</span>}
        <div className="image-field-side">
          <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="/images/…" />
          <span className="image-actions">
            <label className={`mini file-btn ${busy ? 'is-busy' : ''}`}>
              {busy ? '올리는 중…' : '사진 올리기'}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={busy || !upload}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void pick(f);
                  e.target.value = '';
                }}
              />
            </label>
            {value && (
              <button type="button" className="mini danger" onClick={() => { setPreview(null); onChange(''); }}>
                빼기
              </button>
            )}
          </span>
          {preview && <small className="muted">새 사진은 저장 후 사이트에 반영되면 보여요</small>}
          {error && <span className="error">{error}</span>}
        </div>
      </div>
    </div>
  );
}

function AutoTextarea({ value, onChange, lang }: { value: string; onChange: (v: string) => void; lang?: string }) {
  const rows = Math.min(14, Math.max(2, value.split('\n').length + 1));
  return <textarea value={value} rows={rows} lang={lang} onChange={(e) => onChange(e.target.value)} />;
}

export type { Json, Obj };
