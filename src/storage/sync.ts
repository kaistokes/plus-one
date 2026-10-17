import { mergeData } from '../domain/merge';
import { parseAppData } from '../domain/parse';
import { emptyData, type AppData } from '../domain/types';

export interface SyncConfig {
  owner: string;
  repo: string;
  path: string;
  token: string;
}

type Fetch = typeof fetch;

const MAX_ATTEMPTS = 3;

export class SyncError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

const url = (c: SyncConfig) =>
  `https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents/${c.path
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;

const headers = (c: SyncConfig) => ({
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${c.token}`,
  'X-GitHub-Api-Version': '2022-11-28',
});

export function toBase64(text: string): string {
  let binary = '';
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function fromBase64(b64: string): string {
  const binary = atob(b64.replace(/\s/g, ''));
  return new TextDecoder().decode(Uint8Array.from(binary, (ch) => ch.charCodeAt(0)));
}

async function pull(c: SyncConfig, f: Fetch): Promise<{ data: AppData; sha: string } | null> {
  const res = await f(url(c), { headers: headers(c), cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new SyncError(describe(res.status), res.status);
  const body = (await res.json()) as { content: string; sha: string };
  return { data: parseAppData(JSON.parse(fromBase64(body.content))), sha: body.sha };
}

async function push(c: SyncConfig, data: AppData, sha: string | undefined, f: Fetch): Promise<boolean> {
  const res = await f(url(c), {
    method: 'PUT',
    headers: { ...headers(c), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `Sync ${new Date().toISOString()}`,
      content: toBase64(JSON.stringify(data, null, 1)),
      ...(sha ? { sha } : {}),
    }),
  });
  if (res.status === 409) return false;
  if (!res.ok) throw new SyncError(describe(res.status), res.status);
  return true;
}

function describe(status: number): string {
  if (status === 401) return 'GitHub rejected the token. Check it in Settings.';
  if (status === 403) return "The token can't write to that repo. Check its permissions.";
  if (status === 404) return "Couldn't find that repo. Check the owner and name.";
  return `GitHub returned ${status}. Try again later.`;
}

const same = (a: AppData, b: AppData) => JSON.stringify(a) === JSON.stringify(b);

export async function sync(c: SyncConfig, local: AppData, f: Fetch = fetch): Promise<AppData> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const remote = await pull(c, f);
    const merged = mergeData(local, remote?.data ?? emptyData);
    if (remote && same(merged, remote.data)) return merged;
    if (await push(c, merged, remote?.sha, f)) return merged;
  }
  throw new SyncError('Another device kept changing the log. Try again.');
}
