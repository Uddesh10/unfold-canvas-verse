// Direct client-side upload to the `gallery` Storage bucket. RLS enforces
// admin-only writes. Returns a serialized v:2 Photo string (path only —
// variants are resolved at render time via signed transform URLs).

import { supabase } from "@/integrations/supabase/client";
import { serializePhoto } from "@/lib/photoModel";

const MAX_BYTES = 25 * 1024 * 1024;

function extFromMime(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("avif")) return "avif";
  if (mime.includes("gif")) return "gif";
  return "jpg";
}

export async function uploadViaEdge(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Not an image");
  if (file.size > MAX_BYTES) throw new Error("File too large (max 25MB)");

  const id = crypto.randomUUID();
  const ext = extFromMime(file.type);
  const path = `${id}/original.${ext}`;

  const { error } = await supabase.storage
    .from("gallery")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;

  return serializePhoto({ v: 2, id, path, ext, w: 0, h: 0 });
}
