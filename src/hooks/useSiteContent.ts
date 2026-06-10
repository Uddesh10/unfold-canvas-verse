import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveAllPending } from "@/lib/resolvePending";

/**
 * Generic hook for a single jsonb row in site_content keyed by `key`.
 * `set(next)` only updates local state. Call `save()` to persist.
 */
export function useSiteContent<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<T>(fallback);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (data?.value !== undefined && data.value !== null) {
      setValue(data.value as T);
    }
    setDirty(false);
    setLoading(false);
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  const set = useCallback((next: T) => {
    setValue(next);
    setDirty(true);
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const resolved = await resolveAllPending(ref.current);
      setValue(resolved);
      ref.current = resolved;
      const { error } = await supabase
        .from("site_content")
        .upsert({ key, value: resolved as never }, { onConflict: "key" });
      if (error) throw error;
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }, [key]);

  return { value, set, save, dirty, saving, loading, reload: load };
}
