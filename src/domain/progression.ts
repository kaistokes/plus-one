import { floorTo, nextUp } from './ladder';
import type { Exercise, Load } from './types';

export type Reason = 'baseline' | 'reps' | 'overflow' | 'weight' | 'deload';

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

export function workingWeight(sets: Load[]): number {
  const counts = new Map<number, number>();
  for (const s of sets) counts.set(s.weight, (counts.get(s.weight) ?? 0) + 1);
  let best = 0;
  let bestCount = 0;
  for (const [w, c] of counts) {
    if (c > bestCount || (c === bestCount && w > best)) {
      best = w;
      bestCount = c;
    }
  }
  return best;
}

function repsAtWorkingWeight(sets: Load[], w: number, count: number): number[] {
  const converted = sets.map((s) => (s.weight === w ? s.reps : repsAt(epley(s), w)));
  const last = converted.at(-1) ?? 0;
  return Array.from({ length: count }, (_, i) => converted[i] ?? last).sort((a, b) => b - a);
}

function isStalled(history: Load[][], w: number): boolean {
  const window = history.slice(-STALL_WINDOW);
  if (window.length < STALL_WINDOW) return false;
  if (!window.every((sets) => workingWeight(sets) === w)) return false;
  const totals = window.map((sets) => sets.filter((s) => s.weight === w).reduce((n, s) => n + s.reps, 0));
  const first = totals[0] ?? 0;
  return totals.slice(1).every((t) => t <= first);
}

/** `history` is oldest first; each item is the completed sets of one session. */
export function nextTargets(exercise: Exercise, history: Load[][]): Targets {
  const last = history.at(-1);
  if (!last || last.length === 0) return { reason: 'baseline' };

  const { min, max } = exercise.repRange;
  const w = workingWeight(last);
  const oneRepMax = Math.max(...last.map(epley));
  const reps = repsAtWorkingWeight(last, w, exercise.sets);
  const at = (weight: number, r: number): Load => ({ weight, reps: r });

  if (reps.every((r) => r >= max)) {
    const up = nextUp(exercise.weights, w);
    const predicted = repsAt(oneRepMax, up);
    if (predicted >= min) {
      const r = Math.min(Math.max(predicted, min), max);
      return { reason: 'weight', sets: reps.map(() => at(up, r)) };
    }
    return { reason: 'overflow', sets: reps.map((r) => at(w, r + 1)) };
  }

  if (isStalled(history, w)) {
    const down = floorTo(exercise.weights, w * DELOAD_FACTOR);
    if (down > 0 && down < w) {
      const r = Math.min(Math.max(repsAt(oneRepMax, down), min), max);
      return { reason: 'deload', sets: reps.map(() => at(down, r)) };
    }
  }

  return { reason: 'reps', sets: reps.map((r) => at(w, r >= max ? r : r + 1)) };
}
