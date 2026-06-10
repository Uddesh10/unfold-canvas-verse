// Server-side image processing: decode → resize to thumb/grid/full → encode
// AVIF + WebP → upload 6 derivatives to the private `gallery` bucket →
// return a serialized `Photo` JSON string.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import decodeJpeg from "npm:@jsquash/jpeg@1.5.0/decode.js";
import decodePng from "npm:@jsquash/png@3.0.1/decode.js";
import decodeWebp from "npm:@jsquash/webp@1.4.0/decode.js";
import decodeAvifFn from "npm:@jsquash/avif@1.3.0/decode.js";
import encodeAvif from "npm:@jsquash/avif@1.3.0/encode.js";
import encodeWebp from "npm:@jsquash/webp@1.4.0/encode.js";
import resize from "npm:@jsquash/resize@2.1.0";

const SIGNED_TTL = 60 * 60 * 24 * 365 * 10;
const MAX_BYTES = 25 * 1024 * 1024;

const VARIANTS = [
  { name: "thumb", longEdge: 480, quality: 55 },
  { name: "grid", longEdge: 1280, quality: 65 },
  { name: "full", longEdge: 2400, quality: 72 },
] as const;

async function decodeAny(buf: ArrayBuffer, mime: string): Promise<ImageData> {
  if (mime.includes("jpeg") || mime.includes("jpg")) return await decodeJpeg(buf);
  if (mime.includes("png")) return await decodePng(buf);
  if (mime.includes("webp")) return await decodeWebp(buf);
  if (mime.includes("avif")) return await decodeAvifFn(buf);
  // Fallback: try jpeg
  return await decodeJpeg(buf);
}

function targetSize(w: number, h: number, longEdge: number) {
  if (Math.max(w, h) <= longEdge) return { w, h };
  if (w >= h) return { w: longEdge, h: Math.round((h * longEdge) / w) };
  return { w: Math.round((w * longEdge) / h), h: longEdge };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleOk } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!roleOk) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "Missing file" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!file.type.startsWith("image/")) {
      return new Response(JSON.stringify({ error: "Not an image" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (file.size > MAX_BYTES) {
      return new Response(JSON.stringify({ error: "File too large (max 25MB)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const buf = await file.arrayBuffer();
    const src = await decodeAny(buf, file.type);
    const srcW = src.width;
    const srcH = src.height;

    const id = crypto.randomUUID();
    const sources: Record<string, { avif: string; webp: string }> = {};

    for (const spec of VARIANTS) {
      const { w, h } = targetSize(srcW, srcH, spec.longEdge);
      const resized =
        w === srcW && h === srcH
          ? src
          : await resize(src, { width: w, height: h, method: "lanczos3" });

      const [avifBuf, webpBuf] = await Promise.all([
        encodeAvif(resized, { quality: spec.quality, speed: 8 }),
        encodeWebp(resized, { quality: spec.quality }),
      ]);

      const avifPath = `${id}/${spec.name}.avif`;
      const webpPath = `${id}/${spec.name}.webp`;

      const [{ error: e1 }, { error: e2 }] = await Promise.all([
        admin.storage.from("gallery").upload(avifPath, new Blob([avifBuf], { type: "image/avif" }), {
          contentType: "image/avif",
          upsert: false,
        }),
        admin.storage.from("gallery").upload(webpPath, new Blob([webpBuf], { type: "image/webp" }), {
          contentType: "image/webp",
          upsert: false,
        }),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;

      const [{ data: a }, { data: wd }] = await Promise.all([
        admin.storage.from("gallery").createSignedUrl(avifPath, SIGNED_TTL),
        admin.storage.from("gallery").createSignedUrl(webpPath, SIGNED_TTL),
      ]);

      sources[spec.name] = {
        avif: a?.signedUrl ?? "",
        webp: wd?.signedUrl ?? "",
      };
    }

    const photo = {
      v: 1,
      id,
      thumb: sources.thumb,
      grid: sources.grid,
      full: sources.full,
      w: srcW,
      h: srcH,
    };

    return new Response(JSON.stringify({ photo, serialized: JSON.stringify(photo) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("process-image error", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
