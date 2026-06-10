// Server-side image upload: stores the original in the private `gallery`
// bucket and returns a serialized v:2 Photo containing signed Storage
// transform URLs for thumb/grid/full variants. Resizing happens on-demand
// at Supabase Storage's image CDN, so this function uses minimal memory.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SIGNED_TTL = 60 * 60 * 24 * 365 * 10; // 10 years
const MAX_BYTES = 25 * 1024 * 1024;

const VARIANTS = [
  { name: "thumb", width: 480, quality: 60 },
  { name: "grid", width: 1280, quality: 70 },
  { name: "full", width: 2400, quality: 78 },
] as const;

function extFromMime(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("avif")) return "avif";
  if (mime.includes("gif")) return "gif";
  return "jpg";
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
    const anonKey =
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

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

    const id = crypto.randomUUID();
    const ext = extFromMime(file.type);
    const path = `${id}/original.${ext}`;

    const { error: upErr } = await admin.storage
      .from("gallery")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) throw upErr;

    const sources: Record<string, { webp: string }> = {};
    for (const spec of VARIANTS) {
      const { data, error } = await admin.storage
        .from("gallery")
        .createSignedUrl(path, SIGNED_TTL, {
          transform: {
            width: spec.width,
            resize: "contain",
            quality: spec.quality,
          },
        });
      if (error) throw error;
      sources[spec.name] = { webp: data?.signedUrl ?? "" };
    }

    const photo = {
      v: 2 as const,
      id,
      path,
      thumb: sources.thumb,
      grid: sources.grid,
      full: sources.full,
      w: 0,
      h: 0,
    };

    return new Response(
      JSON.stringify({ photo, serialized: JSON.stringify(photo) }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("process-image error", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
