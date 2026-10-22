import { describe, expect, it } from 'vitest';
import { exercises } from './catalogue';
import { progressOrder, rangeStart, timeline, windowOf, type Point } from './progress';
import type { AppData, Load, Session } from './types';

const sets = (...pairs: [number, number][]): Load[] => pairs.map(([weight, reps]) => ({ weight, reps }));
const point = (date: string, ...pairs: [number, number][]): Point => ({ date, weight: pairs[0]?.[0] ?? 0, sets: sets(...pairs) });

const session = (date: string, status: Session['status'], pushdown: Load[]): Session => ({
  id: date,
  plan: 'A',
  date,
  startedAt: `${date}T07:00:00.000Z`,
  updatedAt: `${date}T08:00:00.000Z`,
  status,
  entries: [{ exercise: 'cable-pushdown', sets: pushdown.map((actual) => ({ target: null, actual })) }],
});

describe('progress', () => {
  it('lists every exercise once, paired with its swap', () => {
    expect(progressOrder.slice(0, 4)).toEqual(['bench-press', 'incline-press', 'lat-pulldown', 'high-row']);
    expect([...progressOrder].sort()).toEqual(Object.keys(exercises).sort());
  });

  it('plots the working weight of each finished session', () => {
    const data: AppData = {
      version: 1,
      sessions: [
        session('2026-10-21', 'finished', sets([17.5, 6], [17.5, 5])),
        session('2026-10-18', 'finished', sets([15, 8], [17.5, 8])),
        session('2026-10-22', 'discarded', sets([25, 8])),
      ],
    };
    expect(timeline(data, 'cable-pushdown').map((p) => [p.date, p.weight])).toEqual([
      ['2026-10-18', 17.5],
      ['2026-10-21', 17.5],
    ]);
  });

  it('measures change from the last session before the window', () => {
    const points = [
      point('2026-09-01', [15, 8]),
      point('2026-10-10', [17.5, 8]),
      point('2026-10-20', [21.25, 5]),
      point('2026-11-01', [21.25, 7]),
    ];
    expect(rangeStart('4W', '2026-11-05', '2026-09-01')).toBe('2026-10-08');
    const w = windowOf(points, '2026-10-08', '2026-11-05');
    expect(w.before?.date).toBe('2026-09-01');
    expect(w.points.map((p) => p.date)).toEqual(['2026-10-10', '2026-10-20', '2026-11-01']);
    expect([w.start, w.current, w.change]).toEqual([15, 21.25, 6.25]);
    expect(w.jumps).toEqual([
      { date: '2026-10-10', from: 15, to: 17.5 },
      { date: '2026-10-20', from: 17.5, to: 21.25 },
    ]);
    expect(w.best).toEqual({ weight: 21.25, reps: 7 });
  });

  it('starts the All range at the first session', () => {
    const from = rangeStart('All', '2026-10-30', '2026-10-18');
    const w = windowOf([point('2026-10-18', [105, 6]), point('2026-10-25', [110, 5])], from, '2026-10-30');
    expect([from, w.before, w.change, w.jumps.length]).toEqual(['2026-10-18', undefined, 5, 1]);
  });
});
