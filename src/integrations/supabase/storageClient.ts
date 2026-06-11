// Separate Supabase client pointed at the external project that owns the
// `gallery` Storage bucket. Used ONLY for Storage calls. DB/auth still go
// through `@/integrations/supabase/client`.

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_STORAGE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_STORAGE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anon) {
  // eslint-disable-next-line no-console
  console.warn(
    "[storageClient] VITE_STORAGE_SUPABASE_URL / VITE_STORAGE_SUPABASE_ANON_KEY not set. " +
      "Image uploads & signed URLs will fail until these env vars are configured."
  );
}

export const storageSupabase = createClient(url ?? "https://placeholder.supabase.co", anon ?? "placeholder", {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const STORAGE_BUCKET = "gallery";
