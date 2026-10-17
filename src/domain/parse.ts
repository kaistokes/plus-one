import { exercises } from './catalogue';
import type { AppData, Entry, Load, Session, SetLog } from './types';

const fail = (path: string): never => {
  throw new Error(`Invalid data at ${path}`);
};

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const str = (v: unknown, path: string) => (typeof v === 'string' ? v : fail(path));
const num = (v: unknown, path: string) => (typeof v === 'number' && Number.isFinite(v) ? v : fail(path));

function load(v: unknown, path: string): Load | null {
  if (v === null) return null;
  if (!isObj(v)) return fail(path);
  return { weight: num(v.weight, `${path}.weight`), reps: num(v.reps, `${path}.reps`) };
}

function setLog(v: unknown, path: string): SetLog {
  if (!isObj(v)) return fail(path);
  return { target: load(v.target, `${path}.target`), actual: load(v.actual, `${path}.actual`) };
}

function entry(v: unknown, path: string): Entry {
  if (!isObj(v) || !Array.isArray(v.sets)) return fail(path);
  const id = str(v.exercise, `${path}.exercise`);
  if (!(id in exercises)) fail(`${path}.exercise`);
  return { exercise: id as Entry['exercise'], sets: v.sets.map((s, i) => setLog(s, `${path}.sets[${i}]`)) };
}

function session(v: unknown, path: string): Session {
  if (!isObj(v) || !Array.isArray(v.entries)) return fail(path);
  const plan = v.plan === 'A' || v.plan === 'B' ? v.plan : fail(`${path}.plan`);
  const status =
    v.status === 'active' || v.status === 'finished' || v.status === 'discarded' ? v.status : fail(`${path}.status`);
  return {
    id: str(v.id, `${path}.id`),
    plan,
    date: str(v.date, `${path}.date`),
    startedAt: str(v.startedAt, `${path}.startedAt`),
    updatedAt: str(v.updatedAt, `${path}.updatedAt`),
    status,
    entries: v.entries.map((e, i) => entry(e, `${path}.entries[${i}]`)),
  };
}

export function parseAppData(v: unknown): AppData {
  if (!isObj(v) || v.version !== 1 || !Array.isArray(v.sessions)) return fail('root');
  return { version: 1, sessions: v.sessions.map((s, i) => session(s, `sessions[${i}]`)) };
}
