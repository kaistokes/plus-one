import type { AppData, Session, SessionStatus } from './types';

const rank: Record<SessionStatus, number> = { active: 0, finished: 1, discarded: 2 };

function pick(a: Session, b: Session): Session {
  if (rank[a.status] !== rank[b.status]) return rank[a.status] > rank[b.status] ? a : b;
  if (a.updatedAt !== b.updatedAt) return a.updatedAt > b.updatedAt ? a : b;
  return JSON.stringify(a) >= JSON.stringify(b) ? a : b;
}

export function mergeData(a: AppData, b: AppData): AppData {
  const byId = new Map<string, Session>();
  for (const s of [...a.sessions, ...b.sessions]) {
    const seen = byId.get(s.id);
    byId.set(s.id, seen ? pick(seen, s) : s);
  }
  const sessions = [...byId.values()].sort((x, y) => x.startedAt.localeCompare(y.startedAt) || x.id.localeCompare(y.id));
  return { version: 1, sessions };
}
