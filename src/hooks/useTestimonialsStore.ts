import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Testimonial = { id?: string; q: string; a: string };

export function useWeddingTestimonialsStore() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<Testimonial[]>([]);

  useEffect(() => { ref.current = items; }, [items]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("testimonials")
      .select("id, quote, attribution, position")
      .eq("vertical", "weddings")
      .order("position", { ascending: true });
    setItems((data ?? []).map((r) => ({ id: r.id, q: r.quote, a: r.attribution })));
    setDirty(false);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = useCallback((next: Testimonial[]) => {
    setItems(next);
    setDirty(true);
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    const next = ref.current;
    await supabase.from("testimonials").delete().eq("vertical", "weddings");
    if (next.length) {
      const rows = next.map((it, i) => ({
        vertical: "weddings",
        position: i,
        quote: it.q,
        attribution: it.a,
      }));
      const { error } = await supabase.from("testimonials").insert(rows);
      if (error) { setSaving(false); throw error; }
    }
    setSaving(false);
    await load();
  }, [load]);

  return { items, set, save, dirty, saving, loading, reload: load };
}
