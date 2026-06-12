// Returns the public CloudFront base URL so the browser can build image URLs
// without needing the secret baked into VITE_ env vars.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const base = (Deno.env.get("CLOUDFRONT_DOMAIN") ?? "").replace(/\/$/, "");
  return new Response(JSON.stringify({ base }), {
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
  });
});
