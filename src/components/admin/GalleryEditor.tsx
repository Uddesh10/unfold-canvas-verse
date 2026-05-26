import { useGalleryStore, type Vertical } from "@/hooks/useGalleryStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUp, ArrowDown, Plus, RotateCcw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { resolveImageUrl } from "@/lib/imageUrl";
import type { GalleryItem } from "@/data/galleries";

export const GalleryEditor = ({ vertical }: { vertical: Vertical }) => {
  const { items, set, reset } = useGalleryStore(vertical);

  const update = (i: number, patch: Partial<GalleryItem>) => {
    const next = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    set(next);
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
      { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80", alt: "New photo", caption: "" },
    ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {items.length} photo{items.length === 1 ? "" : "s"}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { reset(); toast({ title: "Reset to defaults" }); }}>
            <RotateCcw className="h-3.5 w-3.5 mr-2" /> Reset
          </Button>
          <Button size="sm" onClick={add}>
            <Plus className="h-3.5 w-3.5 mr-2" /> Add photo
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="glass rounded-2xl p-4 grid grid-cols-12 gap-3 items-start">
            <div className="col-span-12 sm:col-span-2">
              <div className="aspect-[4/5] overflow-hidden rounded-lg bg-muted">
                {it.src && (
                  <img src={resolveImageUrl(it.src)} alt={it.alt} className="h-full w-full object-cover" />
                )}
              </div>
            </div>
            <div className="col-span-12 sm:col-span-9 space-y-2">
              <Input
                value={it.src}
                onChange={(e) => update(i, { src: e.target.value })}
                placeholder="Image URL"
              />
              <Input
                value={it.alt}
                onChange={(e) => update(i, { alt: e.target.value })}
                placeholder="Alt text"
              />
              <Input
                value={it.caption ?? ""}
                onChange={(e) => update(i, { caption: e.target.value })}
                placeholder="Caption (optional)"
              />
            </div>
            <div className="col-span-12 sm:col-span-1 flex sm:flex-col gap-1 justify-end">
              <Button variant="ghost" size="icon" onClick={() => move(i, -1)} aria-label="Move up">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => move(i, 1)} aria-label="Move down">
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
