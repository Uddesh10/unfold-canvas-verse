// Walks any value, finds `pending:*` tokens, uploads their staged files via
// the process-image edge function, and returns the value with tokens
// substituted for the serialized Photo JSON.

import { isPendingToken, getPendingFile, clearPending } from "@/lib/pendingUploads";
import { uploadViaEdge } from "@/lib/imagePipeline";
import { toast } from "sonner";

const UPLOAD_CONCURRENCY = 3;

function collectTokens(value: unknown, out: Set<string>): void {
  if (value == null) return;
  if (typeof value === "string") {
    if (isPendingToken(value)) out.add(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) collectTokens(v, out);
    return;
  }
  if (typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) collectTokens(v, out);
  }
}

function substitute<T>(value: T, map: Map<string, string>): T {
  if (value == null) return value;
  if (typeof value === "string") {
    return (map.get(value) ?? value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => substitute(v, map)) as unknown as T;
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = substitute(v, map);
    }
    return out as unknown as T;
  }
  return value;
}

export async function resolveAllPending<T>(value: T): Promise<T> {
  const tokens = new Set<string>();
  collectTokens(value, tokens);
  if (tokens.size === 0) return value;

  const list = Array.from(tokens);
  const map = new Map<string, string>();
  const total = list.length;
  let done = 0;
  const toastId = toast.loading(`Uploading 0/${total} photos…`);

  let idx = 0;
  const workers = Array.from({ length: Math.min(UPLOAD_CONCURRENCY, total) }, async () => {
    while (idx < list.length) {
      const i = idx++;
      const token = list[i];
      const file = getPendingFile(token);
      if (!file) throw new Error("Staged image missing — please re-select");
      const serialized = await uploadViaEdge(file);
      map.set(token, serialized);
      done++;
      toast.loading(`Uploading ${done}/${total} photos…`, { id: toastId });
    }
  });

  try {
    await Promise.all(workers);
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Upload failed", { id: toastId });
    throw e;
  }
  toast.success(`Uploaded ${total} photo${total === 1 ? "" : "s"}`, { id: toastId });

  for (const t of map.keys()) clearPending(t);
  return substitute(value, map);
}
