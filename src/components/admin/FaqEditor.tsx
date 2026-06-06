import { useFaqStore } from "@/hooks/useFaqStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react";

export const FaqEditor = () => {
  const { items, set } = useFaqStore();

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
  const add = () => set([...items, { q: "New question", a: "Answer goes here." }]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {items.length} question{items.length === 1 ? "" : "s"}
        </div>
        <Button size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-2" /> Add
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="glass rounded-2xl p-4 grid grid-cols-12 gap-3 items-start">
            <div className="col-span-12 sm:col-span-11 space-y-2">
              <Input value={it.q} onChange={(e) => update(i, { q: e.target.value })} placeholder="Question" />
              <Textarea value={it.a} onChange={(e) => update(i, { a: e.target.value })} placeholder="Answer" rows={3} />
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
