import { describe, expect, it } from 'vitest';
import { exerciseHistory, nextPlan, startSession } from './schedule';
import type { AppData, Session } from './types';
import { emptyData } from './types';

const finish = (s: Session, reps: number): Session => ({
  ...s,
  status: 'finished',
  entries: s.entries.map((e) => ({
    ...e,
    sets: e.sets.map((set) => ({ ...set, actual: { weight: set.target?.weight ?? 20, reps } })),
  })),
});

const day = (n: number) => new Date(2026, 9, n, 7, 0);

describe('schedule', () => {
  it('starts on Plan A and alternates after each finished session', () => {
    expect(nextPlan(emptyData)).toBe('A');
    const a = finish(startSession(emptyData, 'A', day(1), 'a'), 8);
    const data: AppData = { version: 1, sessions: [a] };
    expect(nextPlan(data)).toBe('B');
  });

  it('ignores active and discarded sessions when picking the next plan', () => {
    const a = finish(startSession(emptyData, 'A', day(1), 'a'), 8);
    const active = startSession(emptyData, 'B', day(3), 'b');
    const discarded: Session = { ...startSession(emptyData, 'B', day(3), 'c'), status: 'discarded' };
    expect(nextPlan({ version: 1, sessions: [a, active, discarded] })).toBe('B');
  });

  it('carries the cable pushdown across Plan A and Plan B', () => {
    const a = finish(startSession(emptyData, 'A', day(1), 'a'), 6);
    const afterA: AppData = { version: 1, sessions: [a] };
    const b = startSession(afterA, 'B', day(3), 'b');
    const pushdown = b.entries.find((e) => e.exercise === 'cable-pushdown');
    expect(pushdown?.sets.map((s) => s.target)).toEqual([
      { weight: 20, reps: 7 },
      { weight: 20, reps: 7 },
    ]);
    const bench = b.entries.find((e) => e.exercise === 'bench-press');
    expect(bench?.sets.every((s) => s.target === null)).toBe(true);
    expect(exerciseHistory(afterA, 'cable-pushdown')).toHaveLength(1);
  });

  it('records the local calendar date for the future streak counter', () => {
    expect(startSession(emptyData, 'A', new Date(2026, 9, 17, 23, 30), 'x').date).toBe('2026-10-17');
  });
});
