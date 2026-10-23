import { alternativeOf, plans } from './catalogue';
import { epley } from './progression';
import { addDays, finishedSessions } from './schedule';
import type { AppData, ExerciseId, Load } from './types';

export interface Point {
  date: string;
  weight: number;
  sets: Load[];
}

export type Range = '4W' | '3M' | 'All';

export const RANGES: readonly Range[] = ['4W', '3M', 'All'];

const RANGE_DAYS: Record<Range, number | null> = { '4W': 28, '3M': 91, All: null };

export interface Jump {
  date: string;
  from: number;
  to: number;
}

export interface Window {
  from: string;
  to: string;
  /** The last session before `from`, which sets where the line enters the window. */
  before: Point | undefined;
  points: Point[];
  start: number;
  current: number;
  change: number;
  best: Load | undefined;
  jumps: Jump[];
}

/** Each Plan B lift followed by its Plan A swap, so paired lifts sit side by side in the grid. */
export const progressOrder: readonly ExerciseId[] = [
  ...new Set([
    ...plans.B.exercises.flatMap((id) => {
      const alt = alternativeOf(id);
      return alt ? [id, alt] : [id];
    }),
    ...plans.A.exercises,
  ]),
];

export function timeline(data: AppData, id: ExerciseId): Point[] {
  return finishedSessions(data).flatMap((s) =>
    s.entries
      .filter((e) => e.exercise === id)
      .map((e) => e.sets.flatMap((set) => (set.actual ? [set.actual] : [])))
      .filter((sets) => sets.length > 0)
      .map((sets) => ({ date: s.date, weight: Math.max(...sets.map((x) => x.weight)), sets })),
  );
}

/** `first` is the earliest session date shown, which is where All begins. */
export function rangeStart(range: Range, today: string, first: string | undefined): string {
  const days = RANGE_DAYS[range];
  return days === null ? (first ?? today) : addDays(today, -days);
}

export function windowOf(points: Point[], from: string, today: string): Window {
  const inside = points.filter((p) => p.date >= from);
  const before = points.filter((p) => p.date < from).at(-1);
  const start = (before ?? inside[0])?.weight ?? 0;
  const current = points.at(-1)?.weight ?? 0;
  const jumps: Jump[] = [];
  let prev = before?.weight;
  for (const p of inside) {
    if (prev !== undefined && p.weight > prev) jumps.push({ date: p.date, from: prev, to: p.weight });
    prev = p.weight;
  }
  const best = inside.flatMap((p) => p.sets).reduce<Load | undefined>((b, s) => (!b || epley(s) > epley(b) ? s : b), undefined);
  return { from, to: today, before, points: inside, start, current, change: current - start, best, jumps };
}
