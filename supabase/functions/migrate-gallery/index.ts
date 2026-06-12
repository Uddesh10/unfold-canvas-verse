// Admin-only one-shot migration: copies gallery originals from Lovable Cloud
// Storage to S3 so Lambda regenerates variants there.
// Idempotent: skips ids that already have an `original.*` in S3.
// Batched: pass { offset, limit } and call repeatedly until totalListed <= offset+limit.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { AwsClient } from "npm:aws4fetch@1";
import { z } from "npm:zod@3";

const Body = z.object({
  offset: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(50).default(20),
});

const REGION = Deno.env.get("AWS_REGION")!;
const BUCKET = Deno.env.get("AWS_S3_BUCKET")!;
const aws = new AwsClient({
  accessKeyId: Deno.env.get("AWS_ACCESS_KEY_ID")!,
  secretAccessKey: Deno.env.get("AWS_SECRET_ACCESS_KEY")!,
  service: "s3",
  region: REGION,
});

const ORIGINAL_EXTS = ["jpg", "jpeg", "png", "webp"] as const;
const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

async function s3Head(key: string): Promise<boolean> {
  const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
  const res = await aws.fetch(url, { method: "HEAD" });
  return res.status === 200;
}

async function s3Put(key: string, body: ArrayBuffer, contentType: string) {
  const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
  const res = await aws.fetch(url, {
    method: "PUT",
    headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=31536000, immutable" },
    body,
  });
  if (!res.ok) throw new Error(`S3 PUT ${key} -> ${res.status} ${await res.text()}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } }
    );
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: role } = await admin
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!role) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { offset, limit } = parsed.data;

    // List all photo ids (folders) under gallery/
    // Supabase storage list returns immediate children; folders show up as entries.
    const { data: folders, error: listErr } = await admin.storage
      .from("gallery")
      .list("", { limit: 1000, sortBy: { column: "name", order: "asc" } });
    if (listErr) throw listErr;
    const ids = (folders ?? []).map((f) => f.name).filter((n) => !!n);
    const totalListed = ids.length;
    const batch = ids.slice(offset, offset + limit);

    let migrated = 0, skipped = 0;
    const failed: { id: string; reason: string }[] = [];

    for (const id of batch) {
      try {
        // Check if S3 already has an original
        let already = false;
        for (const ext of ORIGINAL_EXTS) {
          if (await s3Head(`gallery/${id}/original.${ext}`)) { already = true; break; }
        }
        if (already) { skipped++; continue; }

        // Find original in Supabase storage
        const { data: contents } = await admin.storage.from("gallery").list(id, { limit: 20 });
        const originalEntry = contents?.find((c) => /^original\.(jpe?g|png|webp)$/i.test(c.name));

        let sourceKey: string | null = null;
        let targetExt: string;
        if (originalEntry) {
          sourceKey = `${id}/${originalEntry.name}`;
          targetExt = originalEntry.name.split(".").pop()!.toLowerCase();
          if (targetExt === "jpeg") targetExt = "jpg";
        } else {
          // Fallback: use full.webp as the original
          const fallback = contents?.find((c) => c.name === "full.webp");
          if (!fallback) { failed.push({ id, reason: "no original or full.webp" }); continue; }
          sourceKey = `${id}/full.webp`;
          targetExt = "webp";
        }

        const { data: blob, error: dlErr } = await admin.storage.from("gallery").download(sourceKey);
        if (dlErr || !blob) { failed.push({ id, reason: dlErr?.message ?? "download failed" }); continue; }
        const buf = await blob.arrayBuffer();
        const ct = CONTENT_TYPES[targetExt] ?? "application/octet-stream";
        await s3Put(`gallery/${id}/original.${targetExt}`, buf, ct);
        migrated++;
      } catch (e) {
        failed.push({ id, reason: String((e as Error)?.message ?? e) });
      }
    }

    return new Response(
      JSON.stringify({ totalListed, offset, limit, processed: batch.length, migrated, skipped, failed, done: offset + batch.length >= totalListed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("migrate-gallery error", e);
    return new Response(JSON.stringify({ error: String((e as Error)?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
