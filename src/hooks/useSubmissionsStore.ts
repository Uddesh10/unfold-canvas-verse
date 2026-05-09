import { useLocalStore, writeStore, readStore } from "@/lib/localStore";

export type Submission = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  date: string;
  message?: string;
};

const KEY = "unfold:submissions";

export function useSubmissionsStore() {
  const [items, set] = useLocalStore<Submission[]>(KEY, []);
  return {
    items,
    set,
    remove: (id: string) => set(items.filter((s) => s.id !== id)),
    clear: () => set([]),
  };
}

export function addSubmission(s: Omit<Submission, "id" | "createdAt">) {
  const list = readStore<Submission[]>(KEY, []);
  const next: Submission = {
    ...s,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  writeStore(KEY, [next, ...list]);
}
