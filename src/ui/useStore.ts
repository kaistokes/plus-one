import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { exercises } from '../domain/catalogue';
import { nextDown, nextUp } from '../domain/ladder';
import { mergeData } from '../domain/merge';
import type { AppData, Load, Session } from '../domain/types';
import { emptyData } from '../domain/types';
import {
  loadData,
  loadSyncConfig,
  loadSyncedAt,
  requestPersistence,
  saveData,
  saveSyncConfig,
  saveSyncedAt,
} from '../storage/local';
import { sync, type SyncConfig } from '../storage/sync';

type Action =
  | { type: 'loaded'; data: AppData }
  | { type: 'start'; session: Session }
  | { type: 'setActual'; sessionId: string; entry: number; set: number; actual: Load | null }
  | { type: 'step'; sessionId: string; entry: number; set: number; field: 'weight' | 'reps'; dir: 1 | -1; fallback: Load }
  | { type: 'close'; sessionId: string; status: 'finished' | 'discarded' }
  | { type: 'synced'; data: AppData };

interface State {
  loaded: boolean;
  data: AppData;
}

const now = () => new Date().toISOString();

function updateSession(data: AppData, id: string, fn: (s: Session) => Session): AppData {
  return { ...data, sessions: data.sessions.map((s) => (s.id === id ? { ...fn(s), updatedAt: now() } : s)) };
}

function updateSet(
  data: AppData,
  sessionId: string,
  entry: number,
  set: number,
  fn: (s: Session['entries'][number]['sets'][number], exercise: Session['entries'][number]['exercise']) => Load | null,
): AppData {
  return updateSession(data, sessionId, (s) => ({
    ...s,
    entries: s.entries.map((e, ei) =>
      ei !== entry ? e : { ...e, sets: e.sets.map((x, si) => (si === set ? { ...x, actual: fn(x, e.exercise) } : x)) },
    ),
  }));
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loaded':
      return { loaded: true, data: mergeData(state.data, action.data) };
    case 'start':
      return { ...state, data: { ...state.data, sessions: [...state.data.sessions, action.session] } };
    case 'setActual':
      return { ...state, data: updateSet(state.data, action.sessionId, action.entry, action.set, () => action.actual) };
    case 'step':
      return {
        ...state,
        data: updateSet(state.data, action.sessionId, action.entry, action.set, (x, id) => {
          const base = x.actual ?? x.target ?? action.fallback;
          if (action.field === 'reps') return { ...base, reps: Math.max(0, base.reps + action.dir) };
          const { weights } = exercises[id];
          return { ...base, weight: action.dir > 0 ? nextUp(weights, base.weight) : nextDown(weights, base.weight) };
        }),
      };
    case 'close':
      return { ...state, data: updateSession(state.data, action.sessionId, (s) => ({ ...s, status: action.status })) };
    case 'synced':
      return { ...state, data: mergeData(state.data, action.data) };
  }
}

export type SyncStatus =
  | { kind: 'idle' }
  | { kind: 'off' }
  | { kind: 'syncing' }
  | { kind: 'synced'; at: Date }
  | { kind: 'offline' }
  | { kind: 'error'; message: string };

export function useStore() {
  const [state, dispatch] = useReducer(reducer, { loaded: false, data: emptyData });
  const [config, setConfig] = useState<SyncConfig | null>(null);
  const [status, setStatus] = useState<SyncStatus>({ kind: 'idle' });
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [syncTick, setSyncTick] = useState(0);
  const dataRef = useRef(state.data);
  dataRef.current = state.data;
  const configRef = useRef(config);
  configRef.current = config;
  const inFlight = useRef(false);
  const again = useRef(false);

  const requestSync = useCallback(() => setSyncTick((t) => t + 1), []);

  const runSync = useCallback(async () => {
    if (inFlight.current) {
      again.current = true;
      return;
    }
    const c = configRef.current;
    if (!c) return setStatus({ kind: 'off' });
    if (!navigator.onLine) return setStatus({ kind: 'offline' });
    inFlight.current = true;
    setStatus({ kind: 'syncing' });
    try {
      const startedAt = new Date().toISOString();
      dispatch({ type: 'synced', data: await sync(c, dataRef.current) });
      setStatus({ kind: 'synced', at: new Date() });
      setSyncedAt(startedAt);
      void saveSyncedAt(startedAt);
    } catch (e) {
      setStatus(navigator.onLine ? { kind: 'error', message: (e as Error).message } : { kind: 'offline' });
    } finally {
      inFlight.current = false;
      if (again.current) {
        again.current = false;
        requestSync();
      }
    }
  }, [requestSync]);

  useEffect(() => {
    if (state.loaded && syncTick > 0) void runSync();
  }, [state.loaded, syncTick, runSync]);

  useEffect(() => {
    void (async () => {
      void requestPersistence();
      const [data, c, at] = await Promise.all([loadData(), loadSyncConfig(), loadSyncedAt()]);
      setConfig(c);
      setSyncedAt(at);
      dispatch({ type: 'loaded', data });
      requestSync();
    })();
    window.addEventListener('online', requestSync);
    return () => window.removeEventListener('online', requestSync);
  }, [requestSync]);

  useEffect(() => {
    if (state.loaded) void saveData(state.data);
  }, [state]);

  const updateConfig = useCallback(
    async (c: SyncConfig | null) => {
      await saveSyncConfig(c);
      setConfig(c);
      requestSync();
    },
    [requestSync],
  );

  const closeSession = useCallback(
    (sessionId: string, closed: 'finished' | 'discarded') => {
      dispatch({ type: 'close', sessionId, status: closed });
      requestSync();
    },
    [requestSync],
  );

  const unsynced = state.data.sessions.some((s) => s.status === 'finished' && (!syncedAt || s.updatedAt > syncedAt));

  return { ...state, dispatch, config, updateConfig, status, unsynced, requestSync, closeSession };
}
