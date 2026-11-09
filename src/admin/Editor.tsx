import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Field, ImageUploadContext, labelOf, type Json, type Obj } from './fields';
import { GitHubError, REPO, RESUME_PATH, checkToken, readFile, writeFile } from './github';
import { url } from '../lib/resume';

const TOKEN_KEY = 'resume-admin-token';
const SECTIONS = ['profile', 'about', 'experience', 'projects', 'games', 'skills', 'education', 'certificates'];
/** 데이터에 꼭 있어야 하는 항목 (projects는 없어도 됨) */
const REQUIRED = SECTIONS.filter((s) => s !== 'projects' && s !== 'games');

function loadToken(): { token: string; remember: boolean } {
  try {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) return { token: saved, remember: true };
    return { token: sessionStorage.getItem(TOKEN_KEY) ?? '', remember: false };
  } catch {
    return { token: '', remember: false };
  }
}

function storeToken(token: string, remember: boolean) {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    if (!token) return;
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  } catch {
    /* 저장 못 해도 이번 화면에서는 동작 */
  }
}

export default function Editor() {
  const initial = useMemo(loadToken, []);
  const [token, setToken] = useState(initial.token);
  const [remember, setRemember] = useState(initial.remember);
  const [authed, setAuthed] = useState(false);

  const [data, setData] = useState<Obj | null>(null);
  const [original, setOriginal] = useState('');
  const [sha, setSha] = useState<string | null>(null);
  const [tab, setTab] = useState('profile');
  const [rawMode, setRawMode] = useState(false);
  const [rawText, setRawText] = useState('');
  const [message, setMessage] = useState('이력서 갱신 (웹 편집)');

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const current = data ? JSON.stringify(data, null, 2) + '\n' : '';
  const dirty = !!data && current !== original;

  // 저장하지 않고 나가려 하면 확인
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // 저장된 토큰이 있으면 바로 불러오기
  useEffect(() => {
    if (initial.token) void login();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setError(null);
    setNotice(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      if (e instanceof GitHubError && e.status === 401) setAuthed(false);
    } finally {
      setBusy(null);
    }
  }

  async function login(e?: FormEvent) {
    e?.preventDefault();
    const tk = token.trim();
    if (!tk) return;
    await run('토큰 확인 중…', async () => {
      const { canPush } = await checkToken(tk);
      if (!canPush) throw new Error('이 토큰으로는 저장소에 쓸 수 없습니다 (Contents: Read and write 권한 필요)');
      storeToken(tk, remember);
      setAuthed(true);
      await reload(tk);
    });
  }

  async function reload(tk = token.trim()) {
    const file = await readFile(tk, RESUME_PATH);
    const parsed = JSON.parse(file.text) as Obj;
    setData(parsed);
    setOriginal(JSON.stringify(parsed, null, 2) + '\n');
    setSha(file.sha);
    setRawText(JSON.stringify(parsed, null, 2));
  }

  function logout() {
    if (dirty && !window.confirm('저장하지 않은 변경 사항이 사라집니다. 로그아웃할까요?')) return;
    storeToken('', false);
    setToken('');
    setAuthed(false);
    setData(null);
  }

  function applyRaw(): Obj | null {
    try {
      const parsed = JSON.parse(rawText);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('최상위는 { } 객체여야 합니다');
      for (const s of REQUIRED) if (!(s in parsed)) throw new Error(`"${s}" 항목이 없습니다`);
      setData(parsed);
      return parsed;
    } catch (e) {
      setError(`JSON 형식 오류: ${e instanceof Error ? e.message : e}`);
      return null;
    }
  }

  async function save() {
    let toSave = data;
    if (rawMode) {
      toSave = applyRaw();
      if (!toSave) return;
    }
    if (!toSave) return;
    const text = JSON.stringify(toSave, null, 2) + '\n';
    await run('저장 중…', async () => {
      const newSha = await writeFile(token.trim(), RESUME_PATH, new TextEncoder().encode(text), message || '이력서 갱신 (웹 편집)', sha);
      setSha(newSha);
      setOriginal(text);
      setNotice('저장했어요. 1~2분 뒤 사이트에 반영됩니다.');
    });
  }

  /** 사진을 줄여서 저장소에 올리고 사이트 경로를 돌려준다. 이력서 저장은 따로 눌러야 적용 */
  async function uploadImage(file: File, kind: string): Promise<string> {
    const bytes = await shrinkPhoto(file, kind === 'photo' ? 800 : 1600);
    const folder = kind === 'photo' ? 'public/images' : 'public/images/projects';
    const path = `${folder}/${kind}-${Date.now()}.jpg`;
    await writeFile(token.trim(), path, bytes, `${kind === 'photo' ? '프로필 사진' : '프로젝트 화면'} 올리기 (웹 편집)`, null);
    setNotice('사진을 올렸어요. "저장하기"를 눌러야 이력서에 적용돼요.');
    return path.replace(/^public/, '');
  }

  if (!authed || !data) {
    return (
      <div className="login-wrap">
        <form className="login" onSubmit={login}>
          <h1>이력서 편집</h1>
          <p className="muted">
            GitHub 토큰으로 로그인하면 이력서 내용을 고쳐 저장소에 바로 저장할 수 있어요. 토큰은 이 브라우저에만 보관되고
            GitHub 외에는 어디에도 보내지 않아요.
          </p>
          <label className="field">
            <span className="field-label">GitHub 토큰</span>
            <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="github_pat_…" autoComplete="off" />
          </label>
          <label className="field check">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> 이 브라우저에 기억하기 (내 PC에서만)
          </label>
          <button className="primary" disabled={!token.trim() || !!busy}>
            {busy ?? '로그인'}
          </button>
          {error && <div className="error">{error}</div>}
          <details className="howto">
            <summary>토큰 만드는 방법</summary>
            <ol>
              <li>
                <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">
                  GitHub → Settings → Developer settings → Fine-grained tokens → Generate new token
                </a>
              </li>
              <li>Repository access: <b>Only select repositories</b> → <code>{REPO.name}</code></li>
              <li>Permissions → Repository permissions → <b>Contents: Read and write</b></li>
              <li>만료일을 정하고 생성한 뒤, 나온 토큰을 위에 붙여 넣으세요</li>
            </ol>
          </details>
        </form>
      </div>
    );
  }

  return (
    <div className="editor">
      <header className="editor-bar">
        <strong>이력서 편집</strong>
        <span className={`state ${dirty ? 'dirty' : ''}`}>{dirty ? '● 저장 안 됨' : '저장됨'}</span>
        <span className="spacer" />
        <a href={url('/')} target="_blank" rel="noopener noreferrer" className="mini">사이트 보기 ↗</a>
        <a href={`https://github.com/${REPO.owner}/${REPO.name}/actions`} target="_blank" rel="noopener noreferrer" className="mini">반영 상황 ↗</a>
        <button className="mini" onClick={logout}>로그아웃</button>
      </header>

      <nav className="tabs">
        {SECTIONS.filter((s) => s in data || s === 'projects' || s === 'games').map((s) => (
          <button key={s} className={!rawMode && tab === s ? 'on' : ''} onClick={() => {
            if (rawMode && !applyRaw()) return;
            setRawMode(false);
            setTab(s);
          }}>
            {labelOf(s)}
          </button>
        ))}
        <button
          className={rawMode ? 'on' : ''}
          onClick={() => {
            setRawText(JSON.stringify(data, null, 2));
            setRawMode(true);
          }}
        >
          JSON 직접 편집
        </button>
      </nav>

      <main className="editor-body">
        {rawMode ? (
          <div className="raw">
            <p className="muted">전체 데이터를 직접 고칠 수 있어요. 형식이 틀리면 저장되지 않아요.</p>
            <textarea value={rawText} onChange={(e) => setRawText(e.target.value)} spellCheck={false} />
          </div>
        ) : (
          <>
            <ImageUploadContext.Provider value={uploadImage}>
              <Field name={tab} value={(data[tab] ?? []) as Json} onChange={(v) => setData({ ...data, [tab]: v })} />
            </ImageUploadContext.Provider>
          </>
        )}
      </main>

      <footer className="save-bar">
        <input value={message} onChange={(e) => setMessage(e.target.value)} aria-label="변경 메모" placeholder="변경 메모" />
        <button
          className="mini"
          onClick={() => {
            if (dirty && !window.confirm('고친 내용을 버리고 저장소의 최신 내용을 불러올까요?')) return;
            void run('불러오는 중…', () => reload());
          }}
          disabled={!!busy}
        >
          다시 불러오기
        </button>
        <button className="primary" onClick={() => void save()} disabled={!!busy || (!dirty && !rawMode)}>
          {busy ?? '저장하기'}
        </button>
        {error && <div className="error">{error}</div>}
        {notice && <div className="notice">{notice}</div>}
      </footer>
    </div>
  );
}

/** 사진을 긴 변 maxSide px JPEG로 줄인다 (위치 정보 같은 EXIF도 빠짐) */
async function shrinkPhoto(file: File, maxSide: number): Promise<Uint8Array> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('사진을 변환하지 못했습니다'))), 'image/jpeg', 0.88),
  );
  return new Uint8Array(await blob.arrayBuffer());
}
