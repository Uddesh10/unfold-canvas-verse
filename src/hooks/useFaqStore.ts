import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FaqItem = { id?: string; q: string; a: string };

export function useFaqStore() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("faqs")
      .select("id, question, answer, position")
      .order("position", { ascending: true });
    setItems((data ?? []).map((r) => ({ id: r.id, q: r.question, a: r.answer })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = useCallback(async (next: FaqItem[]) => {
    setItems(next);
    // Delete-all + insert all (simple, fine for small lists).
    await supabase.from("faqs").delete().not("id", "is", null);
    if (next.length) {
      const rows = next.map((it, i) => ({ position: i, question: it.q, answer: it.a }));
      const { error } = await supabase.from("faqs").insert(rows);
      if (error) throw error;
    }
    await load();
  }, [load]);

  return { items, set, loading, reload: load };
}
