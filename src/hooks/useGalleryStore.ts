import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { GalleryItem } from "@/data/galleries";

export type Vertical = "weddings" | "spaces" | "stories";

export function useGalleryStore(vertical: Vertical) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<GalleryItem[]>([]);

  useEffect(() => { ref.current = items; }, [items]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("gallery_items")
      .select("id, src, alt, caption, client, photos, videos, feedback, position")
      .eq("vertical", vertical)
      .order("position", { ascending: true });
    setItems(
      (data ?? []).map((r) => ({
        src: r.src,
        alt: r.alt ?? "",
        caption: r.caption ?? undefined,
        client: r.client ?? undefined,
        photos: (r.photos as string[] | null) ?? [],
        videos: (r.videos as string[] | null) ?? [],
        feedback: r.feedback ?? undefined,
      }))
    );
    setDirty(false);
    setLoading(false);
  }, [vertical]);

  useEffect(() => { load(); }, [load]);

  const set = useCallback((next: GalleryItem[]) => {
    setItems(next);
    setDirty(true);
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    const next = ref.current;
    await supabase.from("gallery_items").delete().eq("vertical", vertical);
    if (next.length) {
      const rows = next.map((it, i) => ({
        vertical,
        position: i,
        src: it.src,
        alt: it.alt ?? "",
        caption: it.caption ?? null,
        client: it.client ?? null,
        photos: it.photos ?? [],
        videos: it.videos ?? [],
        feedback: it.feedback ?? null,
      }));
      const { error } = await supabase.from("gallery_items").insert(rows);
      if (error) { setSaving(false); throw error; }
    }
    setSaving(false);
    await load();
  }, [vertical, load]);

  return { items, set, save, dirty, saving, loading, reload: load };
}
