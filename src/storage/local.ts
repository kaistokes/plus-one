import { get, set } from 'idb-keyval';
import { parseAppData } from '../domain/parse';
import { emptyData, type AppData } from '../domain/types';
import type { SyncConfig } from './sync';

const DATA_KEY = 'plus-one:data';
const SYNC_KEY = 'plus-one:sync';

export async function loadData(): Promise<AppData> {
  const raw = await get(DATA_KEY);
  return raw === undefined ? emptyData : parseAppData(raw);
}

export const saveData = (data: AppData) => set(DATA_KEY, data);

export async function loadSyncConfig(): Promise<SyncConfig | null> {
  return (await get<SyncConfig>(SYNC_KEY)) ?? null;
}

export const saveSyncConfig = (config: SyncConfig | null) => set(SYNC_KEY, config);

export async function requestPersistence() {
  try {
    await navigator.storage?.persist?.();
  } catch {}
}
