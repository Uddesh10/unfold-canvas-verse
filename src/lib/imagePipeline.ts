// Browser-side multi-variant encoding + upload to the external Storage bucket.
// Produces thumb/grid/full WebP variants plus an untouched JPEG/original
// fallback, then uploads them as `{id}/{variant}.{ext}`. Returns a v:2 Photo
// JSON string with just the id — variant paths are deterministic.

import imageCompression from "browser-image-compression";
import { storageSupabase, STORAGE_BUCKET } from "@/integrations/supabase/storageClient";
import { serializePhoto, type Variant } from "@/lib/photoModel";

const MAX_BYTES = 25 * 1024 * 1024;

type VariantSpec = { name: Variant; maxWidth: number; quality: number };

const VARIANT_SPECS: VariantSpec[] = [
  { name: "thumb", maxWidth: 480, quality: 0.6 },
  { name: "grid", maxWidth: 1280, quality: 0.7 },
  { name: "full", maxWidth: 2400, quality: 0.78 },
];

function extFromMime(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("avif")) return "avif";
  if (mime.includes("gif")) return "gif";
  return "jpg";
}

async function encodeVariant(file: File, spec: VariantSpec): Promise<Blob> {
  return imageCompression(file, {
    maxWidthOrHeight: spec.maxWidth,
    initialQuality: spec.quality,
    fileType: "image/webp",
    useWebWorker: true,
    maxSizeMB: 5,
  });
}

async function getDimensions(file: File): Promise<{ w: number; h: number }> {
  try {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = url;
      });
      return { w: img.naturalWidth, h: img.naturalHeight };
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    return { w: 0, h: 0 };
  }
}

export async function uploadViaEdge(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Not an image");
  if (file.size > MAX_BYTES) throw new Error("File too large (max 25MB)");

  const id = crypto.randomUUID();
  const origExt = extFromMime(file.type);

  // Encode all variants in parallel (web workers).
  const [thumb, grid, full, dims] = await Promise.all([
    encodeVariant(file, VARIANT_SPECS[0]),
    encodeVariant(file, VARIANT_SPECS[1]),
    encodeVariant(file, VARIANT_SPECS[2]),
    getDimensions(file),
  ]);

  // Upload all 4 objects. Concurrency is implicit via Promise.all (4 is fine).
  const uploads: Array<{ path: string; blob: Blob; type: string }> = [
    { path: `${id}/thumb.webp`, blob: thumb, type: "image/webp" },
    { path: `${id}/grid.webp`, blob: grid, type: "image/webp" },
    { path: `${id}/full.webp`, blob: full, type: "image/webp" },
    { path: `${id}/original.${origExt}`, blob: file, type: file.type },
  ];

  const results = await Promise.all(
    uploads.map(({ path, blob, type }) =>
      storageSupabase.storage.from(STORAGE_BUCKET).upload(path, blob, {
        contentType: type,
        upsert: false,
        cacheControl: "31536000",
      })
    )
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;

  return serializePhoto({ v: 2, id, ext: "webp", w: dims.w, h: dims.h });
}
