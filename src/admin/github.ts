// GitHub 저장소의 파일을 읽고 쓰는 최소한의 API 호출 (브라우저에서 직접 api.github.com으로만 보냄)

export const REPO = { owner: 'minhyuk94', name: 'minhyuk94.github.io', branch: 'master' };
export const RESUME_PATH = 'src/data/resume.json';

export class GitHubError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function headers(token: string): HeadersInit {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function call<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`https://api.github.com/repos/${REPO.owner}/${REPO.name}${path}`, {
    ...init,
    headers: { ...headers(token), ...(init.headers ?? {}) },
    cache: 'no-store',
  });
  if (!res.ok) {
    let detail = '';
    try {
      detail = (await res.json()).message ?? '';
    } catch {
      /* 본문 없음 */
    }
    const msg =
      res.status === 401
        ? '토큰이 올바르지 않거나 만료되었습니다'
        : res.status === 403
          ? '이 토큰에는 저장소 쓰기 권한이 없습니다 (Contents: Read and write 필요)'
          : res.status === 404
            ? '파일이나 저장소를 찾을 수 없습니다. 토큰이 이 저장소에 접근할 수 있는지 확인하세요'
            : res.status === 409
              ? '그 사이 다른 곳에서 파일이 바뀌었습니다. 다시 불러온 뒤 저장하세요'
              : `GitHub 요청 실패 (${res.status}) ${detail}`;
    throw new GitHubError(res.status, msg);
  }
  return res.json() as Promise<T>;
}

/* UTF-8 ↔ base64 (한글·일본어가 깨지지 않게) */
export function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

export function base64ToText(b64: string): string {
  const bin = atob(b64.replace(/\s/g, ''));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export interface RemoteFile {
  text: string;
  sha: string;
}

export async function readFile(token: string, path: string): Promise<RemoteFile> {
  const data = await call<{ content: string; sha: string; encoding: string }>(
    token,
    `/contents/${path}?ref=${encodeURIComponent(REPO.branch)}`,
  );
  return { text: base64ToText(data.content), sha: data.sha };
}

/** 파일의 현재 sha (없으면 null) */
export async function fileSha(token: string, path: string): Promise<string | null> {
  try {
    const data = await call<{ sha: string }>(token, `/contents/${path}?ref=${encodeURIComponent(REPO.branch)}`);
    return data.sha;
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) return null;
    throw e;
  }
}

/** 파일을 저장(커밋)하고 새 sha를 돌려준다 */
export async function writeFile(
  token: string,
  path: string,
  content: Uint8Array,
  message: string,
  sha: string | null,
): Promise<string> {
  const body: Record<string, string> = { message, content: bytesToBase64(content), branch: REPO.branch };
  if (sha) body.sha = sha;
  const res = await call<{ content: { sha: string } }>(token, `/contents/${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.content.sha;
}

export async function checkToken(token: string): Promise<{ canPush: boolean }> {
  const res = await fetch(`https://api.github.com/repos/${REPO.owner}/${REPO.name}`, { headers: headers(token), cache: 'no-store' });
  if (res.status === 401) throw new GitHubError(401, '토큰이 올바르지 않거나 만료되었습니다');
  if (!res.ok) throw new GitHubError(res.status, '저장소에 접근할 수 없습니다. 토큰의 저장소 범위를 확인하세요');
  const data = await res.json();
  // fine-grained 토큰은 permissions가 없을 수 있어 일단 시도하게 둔다
  return { canPush: data.permissions ? !!data.permissions.push : true };
}
