import { exercises, plans } from './catalogue';
import { nextTargets, type Targets } from './progression';
import type { AppData, ExerciseId, Load, PlanId, Session } from './types';

const byStart = (a: Session, b: Session) => a.startedAt.localeCompare(b.startedAt);

export const finishedSessions = (data: AppData) =>
  data.sessions.filter((s) => s.status === 'finished').sort(byStart);

export const activeSession = (data: AppData): Session | undefined =>
  data.sessions.filter((s) => s.status === 'active').sort(byStart).at(-1);

export function nextPlan(data: AppData): PlanId {
  const last = finishedSessions(data).at(-1);
  return last?.plan === 'A' ? 'B' : 'A';
}

export function exerciseHistory(data: AppData, id: ExerciseId): Load[][] {
  return finishedSessions(data)
    .flatMap((s) => s.entries.filter((e) => e.exercise === id))
    .map((e) => e.sets.flatMap((set) => (set.actual ? [set.actual] : [])))
    .filter((sets) => sets.length > 0);
}

export const targetsFor = (data: AppData, id: ExerciseId): Targets =>
  nextTargets(exercises[id], exerciseHistory(data, id));

export function startSession(data: AppData, plan: PlanId, now: Date, id: string): Session {
  const iso = now.toISOString();
  return {
    id,
    plan,
    date: localDate(now),
    startedAt: iso,
    updatedAt: iso,
    status: 'active',
    entries: plans[plan].exercises.map((exercise) => {
      const targets = targetsFor(data, exercise);
      return {
        exercise,
        sets: Array.from({ length: exercises[exercise].sets }, (_, i) => ({
          target: targets.reason === 'baseline' ? null : (targets.sets[i] ?? null),
          actual: null,
        })),
      };
    }),
  };
}

export function localDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
