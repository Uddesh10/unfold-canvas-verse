// Photo data model. Photos are stored as strings in `gallery_items.photos[]`.
// New photos are JSON-encoded `Photo` objects. Legacy photos are plain URL strings.

export type Variant = "thumb" | "grid" | "full";

export type PhotoSources = { avif: string; webp: string };

export type Photo = {
  v: 1;
  id: string;
  thumb: PhotoSources;
  grid: PhotoSources;
  full: PhotoSources;
  w: number;
  h: number;
};

export type ParsedPhoto =
  | { kind: "modern"; photo: Photo }
  | { kind: "legacy"; url: string };

export function parsePhoto(input: string | undefined | null): ParsedPhoto {
  const s = (input ?? "").trim();
  if (!s) return { kind: "legacy", url: "" };
  if (s.startsWith("{")) {
    try {
      const p = JSON.parse(s) as Photo;
      if (p && p.v === 1 && p.thumb && p.grid && p.full) {
        return { kind: "modern", photo: p };
      }
    } catch {
      // fall through
    }
  }
  return { kind: "legacy", url: s };
}

export function serializePhoto(p: Photo): string {
  return JSON.stringify(p);
}

// Pick the best fallback URL (WebP) for a given variant.
// Used where <picture> can't be used (e.g. CSS background, og:image).
export function pickFallback(input: string, variant: Variant): string {
  const parsed = parsePhoto(input);
  if (parsed.kind === "legacy") return parsed.url;
  return parsed.photo[variant].webp;
}
