import { useState } from "react";
import { useWeddingTestimonialsStore } from "@/hooks/useTestimonialsStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { SaveBar } from "@/components/admin/SaveBar";
import { CollapsibleCard } from "@/components/admin/CollapsibleCard";

export const TestimonialsEditor = () => {
  const { items, set, save, dirty, saving } = useWeddingTestimonialsStore();
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});
  const setOpen = (i: number, v: boolean) => setOpenMap((m) => ({ ...m, [i]: v }));
  const expandAll = () => setOpenMap(Object.fromEntries(items.map((_, i) => [i, true])));
  const collapseAll = () => setOpenMap({});

  const update = (i: number, patch: Partial<{ q: string; a: string }>) =>
    set(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => set(items.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    set(next);
  };
  const add = () => set([...items, { q: "New testimonial quote.", a: "Couple — Place" }]);

  return (
    <div className="space-y-4">
      <SaveBar dirty={dirty} saving={saving} save={save} />
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-sm text-muted-foreground">
          {items.length} testimonial{items.length === 1 ? "" : "s"} — shown on the Weddings page
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>Expand all</Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>Collapse all</Button>
          <Button size="sm" onClick={add}>
            <Plus className="h-3.5 w-3.5 mr-2" /> Add
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
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{it.a || "Untitled"}</div>
                <div className="text-xs text-muted-foreground truncate italic">"{it.q}"</div>
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
            <div className="space-y-2 pt-3">
              <Textarea value={it.q} onChange={(e) => update(i, { q: e.target.value })} placeholder="Quote" rows={3} />
              <Input value={it.a} onChange={(e) => update(i, { a: e.target.value })} placeholder="Attribution (e.g. Anika & Rohan — Udaipur)" />
            </div>
          </CollapsibleCard>
        ))}
      </div>
    </div>
  );
};
