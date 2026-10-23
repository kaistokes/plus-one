import { exercises } from '../domain/catalogue';
import type { Targets } from '../domain/progression';
import type { ExerciseId, Load, SetLog } from '../domain/types';

export const kg = (w: number) => String(Math.round(w * 100) / 100);

export function describeSets(sets: Load[]): string {
  const first = sets[0];
  if (!first) return '';
  if (sets.every((s) => s.weight === first.weight)) return `${kg(first.weight)} × ${sets.map((s) => s.reps).join(', ')}`;
  return sets.map((s) => `${kg(s.weight)} × ${s.reps}`).join(', ');
}

export interface TargetGroup {
  reps: string;
  weight: string;
}

/** Runs of sets at one weight, e.g. 50 × 7 then 45 × 8, 7 reads as "7 @ 50 · 8, 7 @ 45". */
export function targetSummary(t: Targets): { groups: TargetGroup[]; mark: string } | null {
  if (t.reason === 'baseline' || t.sets.length === 0) return null;
  const runs: Load[][] = [];
  for (const s of t.sets) {
    const run = runs.at(-1);
    if (run && run[0]?.weight === s.weight) run.push(s);
    else runs.push([s]);
  }
  return {
    groups: runs.map((run) => {
      const reps = run.map((s) => s.reps);
      const same = run.length > 1 && reps.every((r) => r === reps[0]);
      return { reps: same ? `${run.length} × ${reps[0]}` : reps.join(', '), weight: kg(run[0]?.weight ?? 0) };
    }),
    mark: { reps: '+1', weight: '↑', deload: '↓' }[t.reason],
  };
}

export function coachLine(id: ExerciseId, t: Targets, last: Load[] | undefined): string | null {
  const { repRange } = exercises[id];
  if (t.reason === 'baseline' || !last) return null;
  const prev = `Last time ${describeSets(last)}.`;
  switch (t.reason) {
    case 'reps':
      return `${prev} Hit ${repRange.max} on a set and that set's weight goes up.`;
    case 'weight':
      return `${prev} You hit ${repRange.max}, so the weight goes up.`;
    case 'deload':
      return `${prev} Three sessions without progress. Drop about 10% and build back up.`;
  }
}

export const isBelow = (s: SetLog) =>
  s.actual !== null && s.target !== null && (s.actual.reps < s.target.reps || s.actual.weight < s.target.weight);

export const longDate = (d: Date) =>
  d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' });

export const shortDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });

export const dayMonth = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
