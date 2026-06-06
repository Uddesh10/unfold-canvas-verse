import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Submission = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  date: string;
  message?: string;
};

export function useSubmissionsStore() {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("submissions")
      .select("id, created_at, name, email, phone, category, shoot_date, message")
      .order("created_at", { ascending: false });
    setItems(
      (data ?? []).map((r) => ({
        id: r.id,
        createdAt: r.created_at,
        name: r.name,
        email: r.email,
        phone: r.phone,
        category: r.category,
        date: r.shoot_date,
        message: r.message ?? undefined,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = useCallback(async (id: string) => {
    await supabase.from("submissions").delete().eq("id", id);
    await load();
  }, [load]);

  const clear = useCallback(async () => {
    await supabase.from("submissions").delete().not("id", "is", null);
    await load();
  }, [load]);

  return { items, remove, clear, loading, reload: load };
}

export async function addSubmission(s: Omit<Submission, "id" | "createdAt">) {
  const { error } = await supabase.from("submissions").insert({
    name: s.name,
    email: s.email,
    phone: s.phone,
    category: s.category,
    shoot_date: s.date,
    message: s.message ?? null,
  });
  if (error) throw error;
}
