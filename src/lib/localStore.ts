// Tiny reactive localStorage store using useSyncExternalStore.
import { useSyncExternalStore } from "react";

type Listener = () => void;
const listenersByKey = new Map<string, Set<Listener>>();

function notify(key: string) {
  listenersByKey.get(key)?.forEach((l) => l());
}

export function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStore<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  notify(key);
}

export function clearStore(key: string) {
  localStorage.removeItem(key);
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
    if (e.key === key) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    set!.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useLocalStore<T>(key: string, fallback: T): [T, (v: T) => void] {
  const value = useSyncExternalStore(
    (cb) => subscribe(key, cb),
    () => readStore(key, fallback),
    () => fallback,
  );
  return [value, (v: T) => writeStore(key, v)];
}
