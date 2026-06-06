import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Testimonial = { id?: string; q: string; a: string };

export function useWeddingTestimonialsStore() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("testimonials")
      .select("id, quote, attribution, position")
      .eq("vertical", "weddings")
      .order("position", { ascending: true });
    setItems((data ?? []).map((r) => ({ id: r.id, q: r.quote, a: r.attribution })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = useCallback(async (next: Testimonial[]) => {
    setItems(next);
    await supabase.from("testimonials").delete().eq("vertical", "weddings");
    if (next.length) {
      const rows = next.map((it, i) => ({
        vertical: "weddings",
        position: i,
        quote: it.q,
        attribution: it.a,
      }));
      const { error } = await supabase.from("testimonials").insert(rows);
      if (error) throw error;
    }
    await load();
  }, [load]);

  return { items, set, loading, reload: load };
}
