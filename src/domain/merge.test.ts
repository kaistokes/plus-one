import { describe, expect, it } from 'vitest';
import { mergeData } from './merge';
import { parseAppData } from './parse';
import { startSession } from './schedule';
import type { AppData, Session } from './types';
import { emptyData } from './types';

const s = (id: string, day: number, patch: Partial<Session> = {}): Session => ({
  ...startSession(emptyData, 'A', new Date(2026, 9, day), id),
  ...patch,
});
const data = (...sessions: Session[]): AppData => ({ version: 1, sessions });

const a = data(s('1', 1, { status: 'finished' }), s('2', 3, { updatedAt: '2026-10-03T08:00:00.000Z' }));
const b = data(s('2', 3, { updatedAt: '2026-10-03T09:00:00.000Z' }), s('3', 5));

describe('mergeData', () => {
  it('is idempotent', () => {
    expect(mergeData(a, a)).toEqual(a);
    expect(mergeData(mergeData(a, b), b)).toEqual(mergeData(a, b));
  });

  it('is commutative', () => {
    expect(mergeData(a, b)).toEqual(mergeData(b, a));
  });

  it('keeps every session and prefers the newer copy of a shared one', () => {
    const m = mergeData(a, b);
    expect(m.sessions.map((x) => x.id)).toEqual(['1', '2', '3']);
    expect(m.sessions[1]?.updatedAt).toBe('2026-10-03T09:00:00.000Z');
  });

  it('lets a finished or discarded copy beat an active one', () => {
    const done = data(s('2', 3, { status: 'finished', updatedAt: '2026-10-03T07:00:00.000Z' }));
    expect(mergeData(b, done).sessions.find((x) => x.id === '2')?.status).toBe('finished');
  });

  it('round-trips through the parser', () => {
    const m = mergeData(a, b);
    expect(parseAppData(JSON.parse(JSON.stringify(m)))).toEqual(m);
    expect(() => parseAppData({ version: 1, sessions: [{ id: 3 }] })).toThrow('sessions[0]');
  });
});
