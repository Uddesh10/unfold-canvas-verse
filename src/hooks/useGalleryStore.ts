import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { GalleryItem } from "@/data/galleries";

export type Vertical = "weddings" | "spaces" | "stories";

export function useGalleryStore(vertical: Vertical) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
  }, [vertical]);

  useEffect(() => { load(); }, [load]);

  const set = useCallback(async (next: GalleryItem[]) => {
    setItems(next);
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
      if (error) throw error;
    }
    await load();
  }, [vertical, load]);

  return { items, set, loading, reload: load };
}
