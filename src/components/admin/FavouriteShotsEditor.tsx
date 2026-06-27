import { useFavouriteShotsStore, type FavouriteShot } from "@/hooks/useFavouriteShotsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { SaveBar } from "@/components/admin/SaveBar";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { StickyAdminHeader } from "@/components/admin/StickyAdminHeader";
import { PhotoImg } from "@/components/PhotoImg";

export const FavouriteShotsEditor = () => {
  const { value, set, save, dirty, saving } = useFavouriteShotsStore();
  const shots: FavouriteShot[] = value ?? [];

  const update = (i: number, patch: Partial<FavouriteShot>) =>
    set(shots.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const remove = (i: number) => set(shots.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= shots.length) return;
    const next = [...shots];
    [next[i], next[j]] = [next[j], next[i]];
    set(next);
  };
  const addOne = () => set([...shots, { src: "", alt: "", caption: "" }]);
  const addMany = (urls: string[]) =>
    set([...shots, ...urls.map((u) => ({ src: u, alt: "", caption: "" }))]);

  return (
    <div className="space-y-4">
      <StickyAdminHeader>
        <SaveBar dirty={dirty} saving={saving} save={save} />
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="text-sm text-muted-foreground">
            {shots.length} favourite shot{shots.length === 1 ? "" : "s"}
          </div>
          <div className="flex items-center gap-2">
            <ImageUpload multiple label="Upload multiple" onUploadMany={addMany} />
            <Button size="sm" onClick={addOne}>
              <Plus className="h-3.5 w-3.5 mr-2" /> Add shot
            </Button>
          </div>
        </div>
      </StickyAdminHeader>

      <div className="space-y-2">
        {shots.map((s, i) => (
          <div
            key={i}
            className="flex gap-3 items-center rounded-lg border border-border/40 p-2"
          >
            <div className="w-16 h-20 shrink-0 rounded overflow-hidden bg-muted">
              {s.src ? (
                <PhotoImg photo={s.src} variant="thumb" alt="" className="w-full h-full object-cover" />
              ) : null}
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <ImageUpload value={s.src} onChange={(url) => update(i, { src: url })} compact label="Upload" />
              <div className="grid grid-cols-2 gap-2">
                <Input value={s.alt} onChange={(e) => update(i, { alt: e.target.value })} placeholder="Alt text" />
                <Input value={s.caption ?? ""} onChange={(e) => update(i, { caption: e.target.value })} placeholder="Caption (optional)" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
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
