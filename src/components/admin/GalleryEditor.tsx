import { useGalleryStore, type Vertical } from "@/hooks/useGalleryStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUp, ArrowDown, Plus, RotateCcw, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { resolveImageUrl } from "@/lib/imageUrl";
import type { GalleryItem } from "@/data/galleries";

export const GalleryEditor = ({ vertical }: { vertical: Vertical }) => {
  const { items, set, reset } = useGalleryStore(vertical);

  const update = (i: number, patch: Partial<GalleryItem>) => {
    set(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  };
  const remove = (i: number) => set(items.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    set(next);
  };
  const add = () =>
    set([
      ...items,
      {
        src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
        alt: "New album",
        caption: "",
        client: "",
        photos: [],
        videos: [],
        feedback: "",
      },
    ]);

  const updateListItem = (i: number, key: "photos" | "videos", idx: number, val: string) => {
    const arr = [...(items[i][key] ?? [])];
    arr[idx] = val;
    update(i, { [key]: arr } as Partial<GalleryItem>);
  };
  const addListItem = (i: number, key: "photos" | "videos") => {
    update(i, { [key]: [...(items[i][key] ?? []), ""] } as Partial<GalleryItem>);
  };
  const removeListItem = (i: number, key: "photos" | "videos", idx: number) => {
    const arr = [...(items[i][key] ?? [])];
    arr.splice(idx, 1);
    update(i, { [key]: arr } as Partial<GalleryItem>);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {items.length} album{items.length === 1 ? "" : "s"}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { reset(); toast({ title: "Reset to defaults" }); }}>
            <RotateCcw className="h-3.5 w-3.5 mr-2" /> Reset
          </Button>
          <Button size="sm" onClick={add}>
            <Plus className="h-3.5 w-3.5 mr-2" /> Add album
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="glass rounded-2xl p-4 space-y-4">
            <div className="grid grid-cols-12 gap-3 items-start">
              <div className="col-span-12 sm:col-span-2">
                <div className="aspect-[4/5] overflow-hidden rounded-lg bg-muted">
                  {it.src && (
                    <img src={resolveImageUrl(it.src)} alt={it.alt} className="h-full w-full object-cover" />
                  )}
                </div>
              </div>
              <div className="col-span-12 sm:col-span-9 space-y-2">
                <Input value={it.src} onChange={(e) => update(i, { src: e.target.value })} placeholder="Cover image URL" />
                <div className="grid grid-cols-2 gap-2">
                  <Input value={it.client ?? ""} onChange={(e) => update(i, { client: e.target.value })} placeholder="Client name (shown on hover)" />
                  <Input value={it.caption ?? ""} onChange={(e) => update(i, { caption: e.target.value })} placeholder="Caption / location" />
                </div>
                <Input value={it.alt} onChange={(e) => update(i, { alt: e.target.value })} placeholder="Alt text" />
              </div>
              <div className="col-span-12 sm:col-span-1 flex sm:flex-col gap-1 justify-end">
                <Button variant="ghost" size="icon" onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Photos list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Photos in album</div>
                <Button variant="outline" size="sm" onClick={() => addListItem(i, "photos")}>
                  <Plus className="h-3 w-3 mr-1" /> Photo
                </Button>
              </div>
              <div className="space-y-2">
                {(it.photos ?? []).map((p, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input value={p} onChange={(e) => updateListItem(i, "photos", idx, e.target.value)} placeholder="Photo URL" />
                    <Button variant="ghost" size="icon" onClick={() => removeListItem(i, "photos", idx)}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Videos list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Videos (embed URLs, e.g. YouTube/Vimeo)</div>
                <Button variant="outline" size="sm" onClick={() => addListItem(i, "videos")}>
                  <Plus className="h-3 w-3 mr-1" /> Video
                </Button>
              </div>
              <div className="space-y-2">
                {(it.videos ?? []).map((v, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input value={v} onChange={(e) => updateListItem(i, "videos", idx, e.target.value)} placeholder="https://www.youtube.com/embed/..." />
                    <Button variant="ghost" size="icon" onClick={() => removeListItem(i, "videos", idx)}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">Client feedback</div>
              <Textarea
                value={it.feedback ?? ""}
                onChange={(e) => update(i, { feedback: e.target.value })}
                placeholder="What the client said about the shoot…"
                rows={3}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
