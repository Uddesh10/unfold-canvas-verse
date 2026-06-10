// In-memory registry of files staged for upload. The token is what we store
// in editor state in place of a final URL/JSON until the user clicks Save.

export const PENDING_PREFIX = "pending:";

type Entry = { file: File; objectUrl: string };
const registry = new Map<string, Entry>();

export function stageFile(file: File): string {
  const token = `${PENDING_PREFIX}${crypto.randomUUID()}`;
  registry.set(token, { file, objectUrl: URL.createObjectURL(file) });
  return token;
}

export function isPendingToken(s: string | undefined | null): boolean {
  return !!s && s.startsWith(PENDING_PREFIX);
}

export function getPending(token: string): Entry | undefined {
  return registry.get(token);
}

export function getPendingFile(token: string): File | undefined {
  return registry.get(token)?.file;
}

export function getPendingPreview(token: string): string | undefined {
  return registry.get(token)?.objectUrl;
}

export function clearPending(token: string) {
  const e = registry.get(token);
  if (e) {
    URL.revokeObjectURL(e.objectUrl);
    registry.delete(token);
  }
}

export function listPendingTokens(): string[] {
  return Array.from(registry.keys());
}
