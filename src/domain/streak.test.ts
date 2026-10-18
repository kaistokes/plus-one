import { describe, expect, it } from 'vitest';
import { currentStreak, gymDays } from './streak';
import type { AppData, Session, SessionStatus } from './types';

const session = (date: string, status: SessionStatus = 'finished'): Session => ({
  id: `${date}-${status}`,
  plan: 'A',
  date,
  startedAt: `${date}T07:00:00.000Z`,
  updatedAt: `${date}T08:00:00.000Z`,
  status,
  entries: [],
});

const data = (...sessions: Session[]): AppData => ({ version: 1, sessions });

describe('streak', () => {
  it('counts gym days, not calendar days', () => {
    const week = data(session('2026-10-12'), session('2026-10-14'), session('2026-10-16'), session('2026-10-18'));
    expect(currentStreak(week, '2026-10-18')).toBe(4);
  });

  it('survives a weekend off', () => {
    const d = data(session('2026-10-14'), session('2026-10-16'), session('2026-10-19'));
    expect(currentStreak(d, '2026-10-19')).toBe(3);
  });

  it('stays alive on a rest day you might still train', () => {
    expect(currentStreak(data(session('2026-10-15')), '2026-10-18')).toBe(1);
  });

  it('breaks after three rest days in a row', () => {
    const d = data(session('2026-10-01'), session('2026-10-05'), session('2026-10-07'));
    expect(currentStreak(d, '2026-10-07')).toBe(2);
    expect(currentStreak(d, '2026-10-11')).toBe(0);
  });

  it('counts two sessions on one day once and ignores unfinished ones', () => {
    const d = data(session('2026-10-16'), { ...session('2026-10-16'), id: 'x' }, session('2026-10-17', 'discarded'), session('2026-10-18', 'active'));
    expect(gymDays(d)).toEqual(['2026-10-16']);
    expect(currentStreak(d, '2026-10-18')).toBe(1);
  });
});
