import type { DayState, DataStoreV1 } from '../types';

const STORAGE_KEY = 'kpt:v1';

function readStore(): DataStoreV1 {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { version: 1, entries: {} };
    }
    const parsed = JSON.parse(raw) as DataStoreV1;
    if (!parsed || parsed.version !== 1 || typeof parsed.entries !== 'object') {
      return { version: 1, entries: {} };
    }
    return parsed;
  } catch {
    return { version: 1, entries: {} };
  }
}

function writeStore(store: DataStoreV1): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getDayState(isoDate: string): DayState {
  const store = readStore();
  return store.entries[isoDate] ?? 'E';
}

export function setDayState(isoDate: string, state: DayState): void {
  const store = readStore();
  if (state === 'E') {
    delete store.entries[isoDate];
  } else {
    store.entries[isoDate] = state;
  }
  writeStore(store);
}

export function toggleDayState(isoDate: string): DayState {
  const current = getDayState(isoDate);
  const next: DayState = current === 'E' ? 'P' : current === 'P' ? 'N' : 'E';
  setDayState(isoDate, next);
  return next;
}

export function getAllEntries(): Record<string, DayState> {
  return { ...readStore().entries };
}

export function getEarliestDateIso(): string | null {
  const keys = Object.keys(readStore().entries);
  if (keys.length === 0) return null;
  keys.sort();
  return keys[0];
}

