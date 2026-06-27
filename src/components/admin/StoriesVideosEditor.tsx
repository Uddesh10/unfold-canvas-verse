import { useStoriesVideosStore } from "@/hooks/useStoriesVideosStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { SaveBar } from "@/components/admin/SaveBar";
import { StickyAdminHeader } from "@/components/admin/StickyAdminHeader";

export const StoriesVideosEditor = () => {
  const { value, set, save, dirty, saving } = useStoriesVideosStore();
  const items = value ?? [];

  const update = (i: number, val: string) => set(items.map((v, idx) => (idx === i ? val : v)));
  const remove = (i: number) => set(items.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    set(next);
  };
  const add = () => set([...items, ""]);

  return (
    <div className="space-y-4">
      <StickyAdminHeader>
        <SaveBar dirty={dirty} saving={saving} save={save} />
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h3 className="font-display text-xl">Stories videos</h3>
            <p className="text-sm text-muted-foreground">
              YouTube / Vimeo embed URLs shown above the Stories gallery.
            </p>
          </div>
          <Button size="sm" onClick={add}>
            <Plus className="h-3.5 w-3.5 mr-2" /> Add video
          </Button>
        </div>
      </StickyAdminHeader>

      <div className="space-y-2">
        {items.map((v, i) => (
          <div key={i} className="flex gap-2 items-center rounded-lg border border-border/40 p-2 bg-background">
            <Input
              value={v}
              onChange={(e) => update(i, e.target.value)}
              placeholder="https://www.youtube.com/embed/VIDEO_ID"
            />
            <Button variant="ghost" size="icon" onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No videos yet — click "Add video" to start.</p>
        )}
      </div>
    </div>
  );
};
