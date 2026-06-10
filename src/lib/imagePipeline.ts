// Browser-side image compression pipeline.
// Decodes an uploaded image, resizes to thumb/grid/full, encodes each in
// AVIF + WebP, uploads all six derivatives to the `gallery` Supabase bucket,
// and returns a serialized Photo JSON string.

import { supabase } from "@/integrations/supabase/client";
import { serializePhoto, type Photo, type Variant } from "@/lib/photoModel";

// ~10 years in seconds — effectively permanent for a signed URL.
const SIGNED_TTL = 60 * 60 * 24 * 365 * 10;

type VariantSpec = { name: Variant; longEdge: number; quality: number };

const VARIANTS: VariantSpec[] = [
  { name: "thumb", longEdge: 480, quality: 55 },
  { name: "grid", longEdge: 1280, quality: 65 },
  { name: "full", longEdge: 2400, quality: 72 },
];

export type UploadProgress = {
  stage: "decode" | "encode" | "upload" | "done";
  done: number;
  total: number;
};

// Decode arbitrary image File to an ImageData via the browser. We prefer
// createImageBitmap + canvas because it handles HEIC-free JPEGs, PNGs, WebPs
// natively without pulling extra WASM codecs.
async function decodeToImageData(file: File): Promise<{ data: ImageData; w: number; h: number }> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D not available");
  ctx.drawImage(bitmap, 0, 0);
  const data = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  bitmap.close();
  return { data, w: bitmap.width, h: bitmap.height };
}

function targetSize(w: number, h: number, longEdge: number) {
  if (Math.max(w, h) <= longEdge) return { w, h };
  if (w >= h) {
    return { w: longEdge, h: Math.round((h * longEdge) / w) };
  }
  return { w: Math.round((w * longEdge) / h), h: longEdge };
}

async function uploadBlob(path: string, blob: Blob, contentType: string): Promise<string> {
  const { error } = await supabase.storage
    .from("gallery")
    .upload(path, blob, { upsert: false, contentType });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage
    .from("gallery")
    .createSignedUrl(path, SIGNED_TTL);
  if (signErr || !data?.signedUrl) throw signErr ?? new Error("Sign failed");
  return data.signedUrl;
}

export async function processAndUpload(
  file: File,
  onProgress?: (p: UploadProgress) => void,
): Promise<Photo> {
  const id = crypto.randomUUID();
  const totalSteps = VARIANTS.length * 2 /* encode */ + VARIANTS.length * 2 /* upload */ + 1;
  let step = 0;
  const tick = (stage: UploadProgress["stage"]) => {
    step += 1;
    onProgress?.({ stage, done: step, total: totalSteps });
  };

  onProgress?.({ stage: "decode", done: 0, total: totalSteps });
  const { data: srcData, w: srcW, h: srcH } = await decodeToImageData(file);
  tick("decode");

  // Lazy-load the heavy WASM codecs only inside the admin upload flow.
  const [{ default: resize }, avifMod, webpMod] = await Promise.all([
    import("@jsquash/resize"),
    import("@jsquash/avif"),
    import("@jsquash/webp"),
  ]);
  const encodeAvif = avifMod.encode;
  const encodeWebp = webpMod.encode;

  const sources: Record<Variant, { avif: string; webp: string }> = {
    thumb: { avif: "", webp: "" },
    grid: { avif: "", webp: "" },
    full: { avif: "", webp: "" },
  };

  for (const spec of VARIANTS) {
    const { w, h } = targetSize(srcW, srcH, spec.longEdge);
    const resized =
      w === srcW && h === srcH
        ? srcData
        : await resize(srcData, { width: w, height: h, method: "lanczos3" });

    onProgress?.({ stage: "encode", done: step, total: totalSteps });
    const [avifBuf, webpBuf] = await Promise.all([
      encodeAvif(resized, { quality: spec.quality, speed: 6 }),
      encodeWebp(resized, { quality: spec.quality }),
    ]);
    tick("encode");
    tick("encode");

    onProgress?.({ stage: "upload", done: step, total: totalSteps });
    const [avifUrl, webpUrl] = await Promise.all([
      uploadBlob(`${id}/${spec.name}.avif`, new Blob([avifBuf], { type: "image/avif" }), "image/avif"),
      uploadBlob(`${id}/${spec.name}.webp`, new Blob([webpBuf], { type: "image/webp" }), "image/webp"),
    ]);
    tick("upload");
    tick("upload");

    sources[spec.name] = { avif: avifUrl, webp: webpUrl };
  }

  onProgress?.({ stage: "done", done: totalSteps, total: totalSteps });

  return {
    v: 1,
    id,
    thumb: sources.thumb,
    grid: sources.grid,
    full: sources.full,
    w: srcW,
    h: srcH,
  };
}

/** Convenience: process a File and return its serialized JSON string. */
export async function processAndUploadSerialized(
  file: File,
  onProgress?: (p: UploadProgress) => void,
): Promise<string> {
  const photo = await processAndUpload(file, onProgress);
  return serializePhoto(photo);
}
