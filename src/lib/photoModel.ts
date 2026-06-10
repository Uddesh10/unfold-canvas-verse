// Photo data model. Photos are stored as strings in DB fields.
// - v:1 (legacy): pre-encoded AVIF+WebP derivatives uploaded by old pipeline.
// - v:2 (current): original uploaded; thumb/grid/full are signed Storage
//   transform URLs (WebP served via content negotiation).
// - plain URL string: legacy/external (e.g. Google Drive).

export type Variant = "thumb" | "grid" | "full";

export type PhotoSourcesV1 = { avif: string; webp: string };
export type PhotoSourcesV2 = { webp: string };

export type PhotoV1 = {
  v: 1;
  id: string;
  thumb: PhotoSourcesV1;
  grid: PhotoSourcesV1;
  full: PhotoSourcesV1;
  w: number;
  h: number;
};

export type PhotoV2 = {
  v: 2;
  id: string;
  path: string;
  thumb: PhotoSourcesV2;
  grid: PhotoSourcesV2;
  full: PhotoSourcesV2;
  w: number;
  h: number;
};

export type Photo = PhotoV1 | PhotoV2;

export type ParsedPhoto =
  | { kind: "v1"; photo: PhotoV1 }
  | { kind: "v2"; photo: PhotoV2 }
  | { kind: "legacy"; url: string };

export function parsePhoto(input: string | undefined | null): ParsedPhoto {
  const s = (input ?? "").trim();
  if (!s) return { kind: "legacy", url: "" };
  if (s.startsWith("{")) {
    try {
      const p = JSON.parse(s) as Photo;
      if (p?.v === 2 && p.thumb && p.grid && p.full) return { kind: "v2", photo: p };
      if (p?.v === 1 && p.thumb && p.grid && p.full) return { kind: "v1", photo: p };
    } catch {
      // fall through
    }
  }
  return { kind: "legacy", url: s };
}

export function serializePhoto(p: Photo): string {
  return JSON.stringify(p);
}

// Best single fallback URL (WebP) for contexts that can't use <picture>.
export function pickFallback(input: string, variant: Variant): string {
  const parsed = parsePhoto(input);
  if (parsed.kind === "legacy") return parsed.url;
  return parsed.photo[variant].webp;
}
