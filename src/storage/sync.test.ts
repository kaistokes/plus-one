import { describe, expect, it } from 'vitest';
import { startSession } from '../domain/schedule';
import { emptyData, type AppData } from '../domain/types';
import { fromBase64, sync, toBase64, type SyncConfig } from './sync';

const config: SyncConfig = { owner: 'me', repo: 'plus-one-data', path: 'log.json', token: 't' };
const one = (id: string, day: number): AppData => ({
  version: 1,
  sessions: [{ ...startSession(emptyData, 'A', new Date(2026, 9, day), id), status: 'finished' }],
});

function fakeGitHub(initial: AppData | null, conflictsBeforeSuccess = 0) {
  let file = initial ? { content: toBase64(JSON.stringify(initial)), sha: 'sha0' } : null;
  let conflicts = conflictsBeforeSuccess;
  const calls: string[] = [];
  const f = (async (url: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET';
    calls.push(method);
    if (method === 'GET' && !url.endsWith('/log.json')) return Response.json({});
    if (method === 'GET') {
      return file ? Response.json(file) : new Response('', { status: 404 });
    }
    const body = JSON.parse(String(init?.body)) as { content: string; sha?: string };
    if (conflicts > 0) {
      conflicts--;
      return new Response('', { status: 409 });
    }
    if (file && body.sha !== file.sha) return new Response('', { status: 409 });
    file = { content: body.content, sha: `sha${calls.length}` };
    return Response.json({});
  }) as typeof fetch;
  return { f, calls, remote: () => (file ? (JSON.parse(fromBase64(file.content)) as AppData) : null) };
}

describe('sync', () => {
  it('creates the file when the repo is empty', async () => {
    const gh = fakeGitHub(null);
    const merged = await sync(config, one('a', 1), gh.f);
    expect(gh.remote()).toEqual(merged);
    expect(gh.calls).toEqual(['GET', 'GET', 'PUT']);
  });

  it('blames the token when the repo itself is invisible to it', async () => {
    const f = (async () => new Response('', { status: 404 })) as unknown as typeof fetch;
    await expect(sync(config, one('a', 1), f)).rejects.toThrow("The token can't see me/plus-one-data");
  });

  it('merges remote sessions in and pushes the union', async () => {
    const gh = fakeGitHub(one('b', 3));
    const merged = await sync(config, one('a', 1), gh.f);
    expect(merged.sessions.map((s) => s.id)).toEqual(['a', 'b']);
    expect(gh.remote()).toEqual(merged);
  });

  it('skips the write when nothing changed', async () => {
    const gh = fakeGitHub(one('a', 1));
    await sync(config, one('a', 1), gh.f);
    expect(gh.calls).toEqual(['GET']);
  });

  it('re-reads and retries after a 409 conflict', async () => {
    const gh = fakeGitHub(one('b', 3), 1);
    const merged = await sync(config, one('a', 1), gh.f);
    expect(gh.calls).toEqual(['GET', 'PUT', 'GET', 'PUT']);
    expect(gh.remote()).toEqual(merged);
  });

  it('reports a bad token in plain words', async () => {
    const f = (async () => new Response('', { status: 401 })) as unknown as typeof fetch;
    await expect(sync(config, emptyData, f)).rejects.toThrow('rejected the token');
  });

  it('round-trips non-ASCII text through base64', () => {
    expect(fromBase64(toBase64('kg × 8 · ✓'))).toBe('kg × 8 · ✓');
  });
});
