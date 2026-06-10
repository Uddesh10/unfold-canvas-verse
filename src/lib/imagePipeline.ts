// Thin client wrapper around the `process-image` edge function.
// The actual decode/resize/encode/upload work runs server-side.

import { supabase } from "@/integrations/supabase/client";

export type UploadProgress = {
  stage: "decode" | "encode" | "upload" | "done";
  done: number;
  total: number;
};

export async function uploadViaEdge(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const { data, error } = await supabase.functions.invoke("process-image", {
    body: form,
  });
  if (error) throw error;
  const serialized = (data as { serialized?: string })?.serialized;
  if (!serialized) throw new Error("No image returned");
  return serialized;
}

// Back-compat shim (in case any caller still references it).
export async function processAndUploadSerialized(
  file: File,
  _onProgress?: (p: UploadProgress) => void,
): Promise<string> {
  return uploadViaEdge(file);
}
