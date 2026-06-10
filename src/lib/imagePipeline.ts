// Browser-side image compression pipeline.
// Decodes an uploaded image, resizes to thumb/grid/full, encodes each in
// AVIF + WebP, uploads all six derivatives to the `gallery` Supabase bucket,
// and returns a serialized Photo JSON string.

import { supabase } from "@/integrations/supabase/client";
import { serializePhoto, type Photo, type Variant } from "@/lib/photoModel";

// Vite-resolved URLs for the WASM binaries. `?url` makes Vite copy the file
// to the build output and serve it with the correct `application/wasm` MIME
// type in dev — bypassing the Emscripten glue's bare relative fetches that
// were resolving to the SPA's `index.html`.
import avifEncWasmUrl from "@jsquash/avif/codec/enc/avif_enc.wasm?url";
import webpEncWasmUrl from "@jsquash/webp/codec/enc/webp_enc.wasm?url";
import webpEncSimdWasmUrl from "@jsquash/webp/codec/enc/webp_enc_simd.wasm?url";
import resizeWasmUrl from "@jsquash/resize/lib/resize/pkg/squoosh_resize_bg.wasm?url";

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

// One-time codec initialization. Each entry resolves to the codec's encode
// (or resize) function, ready to call.
let codecsPromise: Promise<{
  encodeAvif: (data: ImageData, opts: { quality: number; speed?: number }) => Promise<ArrayBuffer>;
  encodeWebp: (data: ImageData, opts: { quality: number }) => Promise<ArrayBuffer>;
  resize: (
    data: ImageData,
    opts: { width: number; height: number; method?: string },
  ) => Promise<ImageData>;
}> | null = null;

function loadCodecs() {
  if (codecsPromise) return codecsPromise;
  codecsPromise = (async () => {
    const [avifEncodeMod, webpEncodeMod, resizeMod] = await Promise.all([
      // `init` is exported from each codec's encode module but not re-exported
      // from the package index, so we import the submodules directly.
      import("@jsquash/avif/encode.js"),
      import("@jsquash/webp/encode.js"),
      import("@jsquash/resize"),
    ]);

    // Tell Emscripten where to fetch the codec WASM. `locateFile` is called
    // with the bare filename the glue would otherwise resolve relative to
    // the JS module URL.
    await (avifEncodeMod as never as { init: Function }).init(undefined, {
      locateFile: (path: string) => (path.endsWith(".wasm") ? avifEncWasmUrl : path),
    });
    await (webpEncodeMod as never as { init: Function }).init(undefined, {
      locateFile: (path: string) => {
        if (path.endsWith("webp_enc_simd.wasm")) return webpEncSimdWasmUrl;
        if (path.endsWith(".wasm")) return webpEncWasmUrl;
        return path;
      },
    });

    // The resize package uses wasm-bindgen; init takes the wasm URL directly.
    await resizeMod.initResize(resizeWasmUrl);

    return {
      encodeAvif: (avifEncodeMod as never as { default: Function }).default as never,
      encodeWebp: (webpEncodeMod as never as { default: Function }).default as never,
      resize: resizeMod.default as never,
    };
  })();
  return codecsPromise;
}

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

  const { encodeAvif, encodeWebp, resize } = await loadCodecs();

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
