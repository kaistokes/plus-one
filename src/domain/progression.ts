import { floorTo, nextUp } from './ladder';
import type { Exercise, Load } from './types';

export type Reason = 'baseline' | 'reps' | 'weight' | 'deload';

export type Targets =
  | { reason: 'baseline' }
  | { reason: Exclude<Reason, 'baseline'>; sets: Load[] };

const EPS = 1e-9;
const STALL_WINDOW = 3;
const DELOAD_FACTOR = 0.9;

export const epley = ({ weight, reps }: Load) => weight * (1 + reps / 30);

export function repsAt(oneRepMax: number, weight: number): number {
  return Math.max(1, Math.floor(30 * (oneRepMax / weight - 1) + EPS));
}

export const heaviestFirst = (a: Load, b: Load) => b.weight - a.weight || b.reps - a.reps;

/** Heaviest set first, padded with the lightest set when a session logged fewer sets than planned. */
function normalise(sets: Load[], count: number): Load[] {
  const sorted = [...sets].sort(heaviestFirst);
  const lightest = sorted.at(-1);
  if (!lightest) return [];
  return Array.from({ length: count }, (_, i) => sorted[i] ?? lightest);
}

function isStalled(history: Load[][], count: number): boolean {
  const window = history.slice(-STALL_WINDOW).map((sets) => normalise(sets, count));
  if (window.length < STALL_WINDOW) return false;
  const weights = (sets: Load[]) => sets.map((s) => s.weight).join();
  const last = weights(window.at(-1) ?? []);
  if (!window.every((sets) => weights(sets) === last)) return false;
  const totals = window.map((sets) => sets.reduce((n, s) => n + s.reps, 0));
  const first = totals[0] ?? 0;
  return totals.slice(1).every((t) => t <= first);
}

/**
 * Each set progresses on its own: below the top of the range it gets one more rep, at the top its
 * weight goes up a step. `history` is oldest first; each item is the completed sets of one session.
 */
export function nextTargets(exercise: Exercise, history: Load[][]): Targets {
  const last = normalise(history.at(-1) ?? [], exercise.sets);
  if (last.length === 0) return { reason: 'baseline' };

  const { min, max } = exercise.repRange;
  const inRange = (r: number) => Math.min(Math.max(r, min), max);

  if (last.every((s) => s.reps < max) && isStalled(history, exercise.sets)) {
    const down = last.map((s) => ({ s, weight: floorTo(exercise.weights, s.weight * DELOAD_FACTOR) }));
    if (down.every(({ s, weight }) => weight > 0 && weight < s.weight)) {
      return {
        reason: 'deload',
        sets: down.map(({ s, weight }) => ({ weight, reps: inRange(repsAt(epley(s), weight)) })).sort(heaviestFirst),
      };
    }
  }

  const sets = last.map((s): Load => {
    if (s.reps < max) return { weight: s.weight, reps: s.reps + 1 };
    const up = nextUp(exercise.weights, s.weight);
    return { weight: up, reps: inRange(repsAt(epley(s), up)) };
  });
  const raised = sets.some((s, i) => s.weight > (last[i]?.weight ?? 0));
  return { reason: raised ? 'weight' : 'reps', sets: sets.sort(heaviestFirst) };
}
