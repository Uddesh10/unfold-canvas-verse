import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { GalleryItem } from "@/data/galleries";
import { isPendingToken, getPendingFile, clearPending } from "@/lib/pendingUploads";
import { uploadViaEdge } from "@/lib/imagePipeline";
import { toast } from "sonner";

export type Vertical = "weddings" | "spaces" | "stories";

const UPLOAD_CONCURRENCY = 3;

async function resolvePendingTokens(items: GalleryItem[]): Promise<GalleryItem[]> {
  // Collect every unique pending token across all items.
  const tokens = new Set<string>();
  for (const it of items) {
    if (isPendingToken(it.src)) tokens.add(it.src);
    for (const p of it.photos ?? []) if (isPendingToken(p)) tokens.add(p);
    for (const p of it.slideshowPhotos ?? []) if (isPendingToken(p)) tokens.add(p);
  }
  if (tokens.size === 0) return items;

  const list = Array.from(tokens);
  const map = new Map<string, string>();
  let done = 0;
  const total = list.length;
  const toastId = toast.loading(`Uploading 0/${total} photos…`);

  // Run uploads with limited concurrency.
  let idx = 0;
  const workers = Array.from({ length: Math.min(UPLOAD_CONCURRENCY, total) }, async () => {
    while (idx < list.length) {
      const i = idx++;
      const token = list[i];
      const file = getPendingFile(token);
      if (!file) throw new Error("Staged file missing — please re-select the image");
      const serialized = await uploadViaEdge(file);
      map.set(token, serialized);
      done++;
      toast.loading(`Uploading ${done}/${total} photos…`, { id: toastId });
    }
  });
  try {
    await Promise.all(workers);
  } catch (e) {
    toast.error("Upload failed", { id: toastId });
    throw e;
  }
  toast.success(`Uploaded ${total} photo${total === 1 ? "" : "s"}`, { id: toastId });

  // Substitute tokens throughout.
  const sub = (s: string) => (isPendingToken(s) ? map.get(s) ?? s : s);
  const next = items.map((it) => ({
    ...it,
    src: sub(it.src),
    photos: (it.photos ?? []).map(sub),
    slideshowPhotos: (it.slideshowPhotos ?? []).map(sub),
  }));

  // Free object URLs / registry entries we successfully resolved.
  for (const t of map.keys()) clearPending(t);

  return next;
}

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
      .select("*")
      .eq("vertical", vertical)
      .order("position", { ascending: true });
    setItems(
      (data ?? []).map((r) => {
        const slideshow = (r as unknown as { slideshow_photos?: string[] }).slideshow_photos ?? [];
        return {
          src: r.src,
          alt: r.alt ?? "",
          caption: r.caption ?? undefined,
          client: r.client ?? undefined,
          photos: (r.photos as string[] | null) ?? [],
          slideshowPhotos: slideshow as string[],
          videos: (r.videos as string[] | null) ?? [],
          feedback: r.feedback ?? undefined,
        };
      })
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
    try {
      // Resolve any staged file uploads first; if it fails, abort the save.
      const resolved = await resolvePendingTokens(ref.current);
      setItems(resolved);
      ref.current = resolved;

      await supabase.from("gallery_items").delete().eq("vertical", vertical);
      if (resolved.length) {
        const rows = resolved.map((it, i) => ({
          vertical,
          position: i,
          src: it.src,
          alt: it.alt ?? "",
          caption: it.caption ?? null,
          client: it.client ?? null,
          photos: it.photos ?? [],
          slideshow_photos: it.slideshowPhotos ?? [],
          videos: it.videos ?? [],
          feedback: it.feedback ?? null,
        }));
        const { error } = await supabase.from("gallery_items").insert(rows as never);
        if (error) throw error;
      }
      await load();
    } finally {
      setSaving(false);
    }
  }, [vertical, load]);

  return { items, set, save, dirty, saving, loading, reload: load };
}
