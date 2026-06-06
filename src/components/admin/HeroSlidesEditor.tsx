import { useHeroSlidesStore, type HeroSlide } from "@/hooks/useHeroSlidesStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { resolveImageUrl } from "@/lib/imageUrl";

export const HeroSlidesEditor = () => {
  const { items, set } = useHeroSlidesStore();

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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl">Hero carousel</h3>
          <p className="text-sm text-muted-foreground">Background slides shown on the homepage hero.</p>
        </div>
        <Button size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-2" /> Add slide
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="glass rounded-2xl p-4 grid grid-cols-12 gap-3 items-start">
            <div className="col-span-12 sm:col-span-3">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img src={resolveImageUrl(it.src)} alt={it.caption} className="h-full w-full object-cover" />
              </div>
            </div>
            <div className="col-span-12 sm:col-span-8 space-y-2">
              <Input value={it.src} onChange={(e) => update(i, { src: e.target.value })} placeholder="Image URL" />
              <div className="grid grid-cols-2 gap-2">
                <Input value={it.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Label" />
                <Input value={it.caption} onChange={(e) => update(i, { caption: e.target.value })} placeholder="Caption" />
              </div>
              <Input value={it.tint} onChange={(e) => update(i, { tint: e.target.value })} placeholder="Tint (Tailwind gradient classes)" />
            </div>
            <div className="col-span-12 sm:col-span-1 flex sm:flex-col gap-1 justify-end">
              <Button variant="ghost" size="icon" onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
