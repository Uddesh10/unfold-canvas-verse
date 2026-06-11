// Photo data model. Photos are stored as strings in DB fields.
// - v:2 (current): original uploaded to the `gallery` bucket. Variants are
//   resolved at render time via Supabase Storage signed transform URLs.
// - plain URL string: legacy/external (e.g. Google Drive seed data).

import { supabase } from "@/integrations/supabase/client";

export type Variant = "thumb" | "grid" | "full";

export type PhotoV2 = {
  v: 2;
  id: string;
  path: string;
  ext: string;
  w: number;
  h: number;
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
      if (p?.v === 2 && p.path) return { kind: "v2", photo: p };
    } catch {
      // fall through
    }
  }
  return { kind: "legacy", url: s };
}

export function serializePhoto(p: Photo): string {
  return JSON.stringify(p);
}

const SPECS: Record<Variant, { width: number; quality: number }> = {
  thumb: { width: 480, quality: 60 },
  grid: { width: 1280, quality: 70 },
  full: { width: 2400, quality: 78 },
};

const SIGNED_TTL = 60 * 60 * 24 * 7; // 7 days; URLs cached per session below
const urlCache = new Map<string, { url: string; expires: number }>();

async function signTransform(path: string, variant: Variant): Promise<string> {
  const key = `${path}|${variant}`;
  const now = Date.now();
  const hit = urlCache.get(key);
  if (hit && hit.expires > now + 60_000) return hit.url;
  const spec = SPECS[variant];
  const { data, error } = await supabase.storage
    .from("gallery")
    .createSignedUrl(path, SIGNED_TTL, {
      transform: { width: spec.width, resize: "contain", quality: spec.quality },
    });
  if (error || !data?.signedUrl) throw error ?? new Error("Failed to sign URL");
  urlCache.set(key, { url: data.signedUrl, expires: now + (SIGNED_TTL - 60) * 1000 });
  return data.signedUrl;
}

export async function photoUrl(input: string, variant: Variant): Promise<string> {
  const parsed = parsePhoto(input);
  if (parsed.kind === "legacy") return parsed.url;
  return signTransform(parsed.photo.path, variant);
}
