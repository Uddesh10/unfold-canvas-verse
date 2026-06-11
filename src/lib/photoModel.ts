// Photo data model. Photos are stored as strings in DB fields.
// - v:2 (current): variants pre-generated at upload time and stored as
//   `{id}/{variant}.webp` in the external Storage bucket. Original kept as
//   `{id}/original.{ext}` for download/fallback.
// - plain URL string: legacy/external (seed data, Unsplash, Drive, etc.).

import { storageSupabase, STORAGE_BUCKET } from "@/integrations/supabase/storageClient";

export type Variant = "thumb" | "grid" | "full";

export type PhotoV2 = {
  v: 2;
  id: string;
  ext: string; // original file extension (jpg/png/...), variants are always webp
  w: number;
  h: number;
  // Legacy field — older rows may still carry `path`. Ignored at render time.
  path?: string;
};

export type Photo = PhotoV2;

export type ParsedPhoto =
  | { kind: "v2"; photo: PhotoV2 }
  | { kind: "legacy"; url: string };

export function parsePhoto(input: string | undefined | null): ParsedPhoto {
  const s = (input ?? "").trim();
  if (!s) return { kind: "legacy", url: "" };
  if (s.startsWith("{")) {
    try {
      const p = JSON.parse(s) as Photo;
      if (p?.v === 2 && p.id) return { kind: "v2", photo: p };
    } catch {
      // fall through
    }
  }
  return { kind: "legacy", url: s };
}

export function serializePhoto(p: Photo): string {
  return JSON.stringify(p);
}

const SIGNED_TTL = 60 * 60 * 24 * 7; // 7 days
const urlCache = new Map<string, { url: string; expires: number }>();

async function signPath(path: string): Promise<string> {
  const now = Date.now();
  const hit = urlCache.get(path);
  if (hit && hit.expires > now + 60_000) return hit.url;
  const { data, error } = await storageSupabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, SIGNED_TTL);
  if (error || !data?.signedUrl) throw error ?? new Error("Failed to sign URL");
  urlCache.set(path, { url: data.signedUrl, expires: now + (SIGNED_TTL - 60) * 1000 });
  return data.signedUrl;
}

export function variantPath(photo: PhotoV2, variant: Variant): string {
  return `${photo.id}/${variant}.webp`;
}

export function originalPath(photo: PhotoV2): string {
  return `${photo.id}/original.${photo.ext === "webp" ? "jpg" : photo.ext}`;
}

export async function photoUrl(input: string, variant: Variant): Promise<string> {
  const parsed = parsePhoto(input);
  if (parsed.kind === "legacy") return parsed.url;
  return signPath(variantPath(parsed.photo, variant));
}

export async function photoOriginalUrl(input: string): Promise<string> {
  const parsed = parsePhoto(input);
  if (parsed.kind === "legacy") return parsed.url;
  return signPath(originalPath(parsed.photo));
}
