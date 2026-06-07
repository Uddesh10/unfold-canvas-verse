import { useShowcaseStore, type ShowcaseSlide } from "@/hooks/useShowcaseStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { SaveBar } from "@/components/admin/SaveBar";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const ShowcaseEditor = () => {
  const { items, set, save, dirty, saving } = useShowcaseStore();


  const update = (i: number, patch: Partial<ShowcaseSlide>) =>
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
        key: `slide-${Date.now()}`,
        brand: "New Studio",
        label: "Label",
        tagline: "A short tagline.",
        path: "/",
        color: "#E8B86C",
        glow: "#F2C97A",
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
      },
    ]);

  return (
    <div className="space-y-4">
      <SaveBar dirty={dirty} saving={saving} save={save} />
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl">Studios carousel</h3>
          <p className="text-sm text-muted-foreground">"One house. Three perspectives." section on homepage.</p>
        </div>
        <Button size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-2" /> Add slide
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="glass rounded-2xl p-4 grid grid-cols-12 gap-3 items-start">
            <div className="col-span-12 sm:col-span-3">
              <ImageUpload value={it.image} onChange={(url) => update(i, { image: url })} aspect="aspect-video" />
            </div>
            <div className="col-span-12 sm:col-span-8 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Input value={it.brand} onChange={(e) => update(i, { brand: e.target.value })} placeholder="Brand" />
                <Input value={it.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Label" />
              </div>
              <Textarea value={it.tagline} onChange={(e) => update(i, { tagline: e.target.value })} placeholder="Tagline" rows={2} />
              <div className="grid grid-cols-3 gap-2">
                <Input value={it.path} onChange={(e) => update(i, { path: e.target.value })} placeholder="Path (/weddings)" />
                <div className="flex items-center gap-2">
                  <input type="color" value={it.color} onChange={(e) => update(i, { color: e.target.value })} className="h-9 w-9 rounded border bg-transparent" />
                  <Input value={it.color} onChange={(e) => update(i, { color: e.target.value })} placeholder="Color" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="color" value={it.glow} onChange={(e) => update(i, { glow: e.target.value })} className="h-9 w-9 rounded border bg-transparent" />
                  <Input value={it.glow} onChange={(e) => update(i, { glow: e.target.value })} placeholder="Glow" />
                </div>
              </div>
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
