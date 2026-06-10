import { useState } from "react";
import { useGalleryStore, type Vertical } from "@/hooks/useGalleryStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Trash2, ArrowUp, ArrowDown, Plus, X } from "lucide-react";
import type { GalleryItem } from "@/data/galleries";
import { SaveBar } from "@/components/admin/SaveBar";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { CollapsibleCard } from "@/components/admin/CollapsibleCard";
import { resolveImageUrl } from "@/lib/imageUrl";

export const GalleryEditor = ({ vertical }: { vertical: Vertical }) => {
  const { items, set, save, dirty, saving } = useGalleryStore(vertical);

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
        src: "",
        alt: "New album",
        caption: "",
        client: "",
        photos: [],
        slideshowPhotos: [],
        videos: [],
        feedback: "",
      },
    ]);

  const setPhoto = (i: number, idx: number, val: string) => {
    const arr = [...(items[i].photos ?? [])];
    const prev = arr[idx];
    arr[idx] = val;
    // Keep slideshow flags in sync when a photo URL changes.
    const ss = [...(items[i].slideshowPhotos ?? [])];
    const k = ss.indexOf(prev);
    if (k !== -1) ss[k] = val;
    update(i, { photos: arr, slideshowPhotos: ss });
  };
  const addPhoto = (i: number) => update(i, { photos: [...(items[i].photos ?? []), ""] });
  const removePhoto = (i: number, idx: number) => {
    const arr = [...(items[i].photos ?? [])];
    const removed = arr.splice(idx, 1)[0];
    const ss = (items[i].slideshowPhotos ?? []).filter((u) => u !== removed);
    update(i, { photos: arr, slideshowPhotos: ss });
  };

  const toggleSlideshow = (i: number, url: string) => {
    if (!url) return;
    const current = items[i].slideshowPhotos ?? [];
    const next = current.includes(url) ? current.filter((u) => u !== url) : [...current, url];
    update(i, { slideshowPhotos: next });
  };

  const addVideo = (i: number) => update(i, { videos: [...(items[i].videos ?? []), ""] });
  const updateVideo = (i: number, idx: number, val: string) => {
    const arr = [...(items[i].videos ?? [])];
    arr[idx] = val;
    update(i, { videos: arr });
  };
  const removeVideo = (i: number, idx: number) => {
    const arr = [...(items[i].videos ?? [])];
    arr.splice(idx, 1);
    update(i, { videos: arr });
  };

  return (
    <div className="space-y-4">
      <SaveBar dirty={dirty} saving={saving} save={save} />
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {items.length} album{items.length === 1 ? "" : "s"}
        </div>
        <Button size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-2" /> Add album
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="glass rounded-2xl p-4 space-y-5">
            <div className="grid grid-cols-12 gap-3 items-start">
              <div className="col-span-12 sm:col-span-3 space-y-2">
                <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Cover image</Label>
                <ImageUpload value={it.src} onChange={(url) => update(i, { src: url })} />
              </div>
              <div className="col-span-12 sm:col-span-8 space-y-2">
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
                <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Photos in album · tick "Slideshow" to feature on the grid hover
                </div>
                <div className="flex items-center gap-2">
                  <ImageUpload
                    multiple
                    label="Upload multiple"
                    onUploadMany={(urls) =>
                      update(i, { photos: [...(items[i].photos ?? []), ...urls] })
                    }
                  />
                  <Button variant="outline" size="sm" onClick={() => addPhoto(i)}>
                    <Plus className="h-3 w-3 mr-1" /> Photo
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {(it.photos ?? []).map((p, idx) => {
                  const inSlideshow = !!p && (it.slideshowPhotos ?? []).includes(p);
                  return (
                    <div key={idx} className="flex gap-3 items-center rounded-lg border border-border/40 p-2">
                      <div className="flex-1 min-w-0">
                        <ImageUpload
                          value={p}
                          onChange={(url) => setPhoto(i, idx, url)}
                          compact
                          label="Upload photo"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground cursor-pointer select-none whitespace-nowrap">
                        <Checkbox
                          checked={inSlideshow}
                          onCheckedChange={() => toggleSlideshow(i, p)}
                          disabled={!p}
                        />
                        Slideshow
                      </label>
                      <Button variant="ghost" size="icon" onClick={() => removePhoto(i, idx)} aria-label="Remove">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Videos list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Videos (YouTube/Vimeo embed URLs)</div>
                <Button variant="outline" size="sm" onClick={() => addVideo(i)}>
                  <Plus className="h-3 w-3 mr-1" /> Video
                </Button>
              </div>
              <div className="space-y-2">
                {(it.videos ?? []).map((v, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input value={v} onChange={(e) => updateVideo(i, idx, e.target.value)} placeholder="https://www.youtube.com/embed/..." />
                    <Button variant="ghost" size="icon" onClick={() => removeVideo(i, idx)}><X className="h-4 w-4" /></Button>
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
