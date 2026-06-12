// Admin-only: returns a presigned S3 PUT URL for gallery/{id}/original.{ext}
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { AwsClient } from "npm:aws4fetch@1";
import { z } from "npm:zod@3";

const Body = z.object({
  ext: z.enum(["jpg", "jpeg", "png", "webp"]),
  contentType: z.string().min(3).max(64),
});

const REGION = Deno.env.get("AWS_REGION")!;
const BUCKET = Deno.env.get("AWS_S3_BUCKET")!;
const ACCESS_KEY = Deno.env.get("AWS_ACCESS_KEY_ID")!;
const SECRET_KEY = Deno.env.get("AWS_SECRET_ACCESS_KEY")!;

const aws = new AwsClient({
  accessKeyId: ACCESS_KEY,
  secretAccessKey: SECRET_KEY,
  service: "s3",
  region: REGION,
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } }
    );
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: role } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { ext, contentType } = parsed.data;

    const id = crypto.randomUUID();
    const key = `gallery/${id}/original.${ext}`;

    // Presign with aws4fetch
    const host = `${BUCKET}.s3.${REGION}.amazonaws.com`;
    const url = new URL(`https://${host}/${key}`);
    url.searchParams.set("X-Amz-Expires", "300");

    const signed = await aws.sign(
      new Request(url.toString(), { method: "PUT", headers: { "Content-Type": contentType } }),
      { aws: { signQuery: true } }
    );

    return new Response(
      JSON.stringify({ id, key, url: signed.url, contentType }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("presign-upload error", e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
