import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FaqItem = { id?: string; q: string; a: string };

export function useFaqStore() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<FaqItem[]>([]);

  useEffect(() => { ref.current = items; }, [items]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("faqs")
      .select("id, question, answer, position")
      .order("position", { ascending: true });
    setItems((data ?? []).map((r) => ({ id: r.id, q: r.question, a: r.answer })));
    setDirty(false);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = useCallback((next: FaqItem[]) => {
    setItems(next);
    setDirty(true);
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    const next = ref.current;
    await supabase.from("faqs").delete().not("id", "is", null);
    if (next.length) {
      const rows = next.map((it, i) => ({ position: i, question: it.q, answer: it.a }));
      const { error } = await supabase.from("faqs").insert(rows);
      if (error) { setSaving(false); throw error; }
    }
    setSaving(false);
    await load();
  }, [load]);

  return { items, set, save, dirty, saving, loading, reload: load };
}
