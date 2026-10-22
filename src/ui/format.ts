import { exercises } from '../domain/catalogue';
import { nextUp } from '../domain/ladder';
import type { Targets } from '../domain/progression';
import type { ExerciseId, Load, SetLog } from '../domain/types';

export const kg = (w: number) => String(Math.round(w * 100) / 100);

export function describeSets(sets: Load[]): string {
  const first = sets[0];
  if (!first) return '';
  if (sets.every((s) => s.weight === first.weight)) return `${kg(first.weight)} × ${sets.map((s) => s.reps).join(', ')}`;
  return sets.map((s) => `${kg(s.weight)} × ${s.reps}`).join(', ');
}

export function targetSummary(t: Targets): { sets: string; weight: string; mark: string } | null {
  if (t.reason === 'baseline') return null;
  const first = t.sets[0];
  if (!first) return null;
  const reps = t.sets.map((s) => s.reps);
  const same = reps.every((r) => r === first.reps);
  return {
    sets: same ? `${t.sets.length} × ${first.reps}` : reps.join(', '),
    weight: kg(first.weight),
    mark: { reps: '+1', overflow: '+1', weight: '↑', deload: '↓' }[t.reason],
  };
}

export function coachLine(id: ExerciseId, t: Targets, last: Load[] | undefined): string | null {
  const { repRange, weights } = exercises[id];
  if (t.reason === 'baseline' || !last) return null;
  const prev = `Last time ${describeSets(last)}.`;
  const w = t.sets[0]?.weight ?? 0;
  switch (t.reason) {
    case 'reps':
      return `${prev} Hit ${repRange.max} on every set and the weight goes up.`;
    case 'overflow':
      return `${prev} Keep adding reps. ${kg(nextUp(weights, w))} isn't a safe jump yet.`;
    case 'weight':
      return `${prev} You hit ${repRange.max} on every set, so the weight goes up.`;
    case 'deload':
      return `${prev} Three sessions without progress. Drop to ${kg(w)} and build back up.`;
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
