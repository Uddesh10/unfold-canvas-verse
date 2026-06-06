import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Generic hook for a single jsonb row in site_content keyed by `key`.
 * Falls back to `fallback` until the row loads.
 */
export function useSiteContent<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (data?.value !== undefined && data.value !== null) {
      setValue(data.value as T);
    }
    setLoading(false);
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async (next: T) => {
      setValue(next);
      const { error } = await supabase
        .from("site_content")
        .upsert({ key, value: next as never }, { onConflict: "key" });
      if (error) throw error;
    },
    [key]
  );

  return { value, set: save, loading, reload: load };
}
