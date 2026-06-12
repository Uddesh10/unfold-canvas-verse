// Browser-side upload pipeline. Requests a presigned S3 PUT URL from the
// `presign-upload` edge function, then uploads the original directly to S3.
// AWS Lambda generates thumb/grid/full WebP variants from the S3 event.

import { supabase } from "@/integrations/supabase/client";
import { serializePhoto } from "@/lib/photoModel";

const MAX_BYTES = 25 * 1024 * 1024;

function extFromFile(file: File): "jpg" | "jpeg" | "png" | "webp" {
  const t = file.type.toLowerCase();
  if (t.includes("png")) return "png";
  if (t.includes("webp")) return "webp";
  if (t.includes("jpeg") || t.includes("jpg")) return "jpg";
  const n = file.name.toLowerCase();
  if (n.endsWith(".png")) return "png";
  if (n.endsWith(".webp")) return "webp";
  return "jpg";
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

  const ext = extFromFile(file);
  const contentType = file.type || (ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg");

  const { data, error } = await supabase.functions.invoke("presign-upload", {
    body: { ext, contentType },
  });
  if (error) throw error;
  const { id, url } = data as { id: string; url: string };
  if (!id || !url) throw new Error("presign-upload returned no url");

  const [dims, putRes] = await Promise.all([
    getDimensions(file),
    fetch(url, { method: "PUT", headers: { "Content-Type": contentType }, body: file }),
  ]);
  if (!putRes.ok) throw new Error(`S3 upload failed: ${putRes.status}`);

  return serializePhoto({ v: 3, id, ext, w: dims.w, h: dims.h });
}
