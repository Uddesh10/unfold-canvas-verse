import { useState } from "react";
import { useHeroSlidesStore, type HeroSlide } from "@/hooks/useHeroSlidesStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { SaveBar } from "@/components/admin/SaveBar";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { CollapsibleCard } from "@/components/admin/CollapsibleCard";
import { PhotoImg } from "@/components/PhotoImg";

export const HeroSlidesEditor = () => {
  const { items, set, save, dirty, saving } = useHeroSlidesStore();
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});
  const setOpen = (i: number, v: boolean) => setOpenMap((m) => ({ ...m, [i]: v }));
  const expandAll = () => setOpenMap(Object.fromEntries(items.map((_, i) => [i, true])));
  const collapseAll = () => setOpenMap({});

  const update = (i: number, patch: Partial<HeroSlide>) =>
    set(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
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
        src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=80",
        label: "New",
        caption: "New caption",
        tint: "from-[hsl(330_90%_60%/0.45)] via-transparent to-[hsl(280_80%_50%/0.35)]",
      },
    ]);

  return (
    <div className="space-y-4">
      <SaveBar dirty={dirty} saving={saving} save={save} />
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="font-display text-xl">Hero carousel</h3>
          <p className="text-sm text-muted-foreground">Background slides shown on the homepage hero.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>Expand all</Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>Collapse all</Button>
          <Button size="sm" onClick={add}>
            <Plus className="h-3.5 w-3.5 mr-2" /> Add slide
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((it, i) => (
          <CollapsibleCard
            key={i}
            open={!!openMap[i]}
            onOpenChange={(v) => setOpen(i, v)}
            header={
              <div className="flex items-center gap-3 min-w-0">
                {it.src ? (
                  <PhotoImg photo={it.src} variant="thumb" alt="" className="w-14 h-9 rounded object-cover shrink-0 border border-border/40" />
                ) : (
                  <div className="w-14 h-9 rounded bg-muted shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{it.label || "Untitled slide"}</div>
                  <div className="text-xs text-muted-foreground truncate">{it.caption || "—"}</div>
                </div>
              </div>
            }
            actions={
              <>
                <Button variant="ghost" size="icon" onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
              </>
            }
          >
            <div className="grid grid-cols-12 gap-3 items-start pt-3">
              <div className="col-span-12 sm:col-span-4">
                <ImageUpload value={it.src} onChange={(url) => update(i, { src: url })} aspect="aspect-video" />
              </div>
              <div className="col-span-12 sm:col-span-8 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input value={it.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Label" />
                  <Input value={it.caption} onChange={(e) => update(i, { caption: e.target.value })} placeholder="Caption" />
                </div>
                <Input value={it.tint} onChange={(e) => update(i, { tint: e.target.value })} placeholder="Tint (Tailwind gradient classes)" />
              </div>
            </div>
          </CollapsibleCard>
        ))}
      </div>
    </div>
  );
};
