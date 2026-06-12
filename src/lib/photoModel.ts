// Photo data model. Photos are stored as strings in DB fields.
// - v:3 (current): hosted on S3, served via CloudFront CDN. Variants
//   `{id}/{variant}.webp` produced by AWS Lambda from `{id}/original.{ext}`.
// - v:2 (legacy): variants previously stored in Lovable Cloud Storage.
// - plain URL string: legacy/external (seed data, Unsplash, Drive, etc.).
//
// During migration, v:2 photos are re-uploaded to S3 and become readable
// via CloudFront at the same {id}/ path, so we read both v:2 and v:3 from
// CloudFront once the migration job has run.

import { supabase } from "@/integrations/supabase/client";

export type Variant = "thumb" | "grid" | "full";

export type PhotoV2 = { v: 2; id: string; ext: string; w: number; h: number; path?: string };
export type PhotoV3 = { v: 3; id: string; ext: string; w: number; h: number };
export type Photo = PhotoV2 | PhotoV3;

export type ParsedPhoto =
  | { kind: "v3"; photo: PhotoV3 }
  | { kind: "v2"; photo: PhotoV2 }
  | { kind: "legacy"; url: string };

export function parsePhoto(input: string | undefined | null): ParsedPhoto {
  const s = (input ?? "").trim();
  if (!s) return { kind: "legacy", url: "" };
  if (s.startsWith("{")) {
    try {
      const p = JSON.parse(s) as Photo;
      if (p?.v === 3 && p.id) return { kind: "v3", photo: p };
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

// ---------- CDN base (CloudFront) ----------
let cdnBase: string | null = null;
let cdnBasePromise: Promise<string> | null = null;

async function getCdnBase(): Promise<string> {
  if (cdnBase !== null) return cdnBase;
  if (!cdnBasePromise) {
    cdnBasePromise = (async () => {
      const { data, error } = await supabase.functions.invoke("cdn-config");
      if (error) throw error;
      const base = (data?.base ?? "").replace(/\/$/, "");
      cdnBase = base;
      return base;
    })();
  }
  return cdnBasePromise;
}

export function cdnUrl(id: string, variant: Variant): string {
  if (!cdnBase) return "";
  return `${cdnBase}/gallery/${id}/${variant}.webp`;
}

// ---------- URL resolution ----------
export async function photoUrl(input: string, variant: Variant): Promise<string> {
  const parsed = parsePhoto(input);
  if (parsed.kind === "legacy") return parsed.url;
  const base = await getCdnBase();
  if (!base) return "";
  return `${base}/gallery/${parsed.photo.id}/${variant}.webp`;
}

// Synchronous resolver — returns "" until CDN base has been fetched once.
// Callers should also call `ensureCdnBase()` (or `photoUrl`) to warm the cache.
export function photoUrlSync(input: string, variant: Variant): string {
  const parsed = parsePhoto(input);
  if (parsed.kind === "legacy") return parsed.url;
  if (!cdnBase) return "";
  return `${cdnBase}/gallery/${parsed.photo.id}/${variant}.webp`;
}

export async function ensureCdnBase(): Promise<string> {
  return getCdnBase();
}

// Kept for future "download original" UI — Lambda always reads from S3,
// and originals are not exposed via CDN by default.
export function originalKey(photo: PhotoV2 | PhotoV3): string {
  return `gallery/${photo.id}/original.${photo.ext === "webp" ? "webp" : photo.ext}`;
}
