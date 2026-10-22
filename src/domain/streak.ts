import { dayNumber, finishedSessions } from './schedule';
import type { AppData } from './types';

export const MAX_REST_DAYS = 2;

export const gymDays = (data: AppData): string[] => [...new Set(finishedSessions(data).map((s) => s.date))].sort();

/** Counts gym days, not calendar days. More than MAX_REST_DAYS off in a row ends the streak. */
export function currentStreak(data: AppData, today: string): number {
  const days = gymDays(data).map(dayNumber);
  let streak = 0;
  let after = dayNumber(today);
  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i] ?? 0;
    if (after - day - 1 > MAX_REST_DAYS) break;
    streak++;
    after = day;
  }
  return streak;
}
