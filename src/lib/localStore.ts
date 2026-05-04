// Tiny reactive localStorage store using useSyncExternalStore.
// IMPORTANT: getSnapshot must return a stable reference between calls when
// the underlying data hasn't changed, otherwise React throws
// "getSnapshot should be cached to avoid an infinite loop".
import { useSyncExternalStore, useCallback } from "react";

type Listener = () => void;
const listenersByKey = new Map<string, Set<Listener>>();
const cacheByKey = new Map<string, { raw: string | null; value: unknown }>();

function notify(key: string) {
  // invalidate cache so next getSnapshot reparses
  cacheByKey.delete(key);
  listenersByKey.get(key)?.forEach((l) => l());
}

export function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = (() => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  })();
  const cached = cacheByKey.get(key);
  if (cached && cached.raw === raw) return cached.value as T;
  let value: T;
  if (raw === null) {
    value = fallback;
  } else {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  cacheByKey.set(key, { raw, value });
  return value;
}

export function writeStore<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
  notify(key);
}

export function clearStore(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
  notify(key);
}

function subscribe(key: string, cb: Listener) {
  let set = listenersByKey.get(key);
  if (!set) {
    set = new Set();
    listenersByKey.set(key, set);
  }
  set.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === key || e.key === null) {
      cacheByKey.delete(key);
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    set!.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useLocalStore<T>(key: string, fallback: T): [T, (v: T) => void] {
  const sub = useCallback((cb: Listener) => subscribe(key, cb), [key]);
  const get = useCallback(() => readStore(key, fallback), [key, fallback]);
  const value = useSyncExternalStore(sub, get, () => fallback);
  const setter = useCallback((v: T) => writeStore(key, v), [key]);
  return [value, setter];
}
