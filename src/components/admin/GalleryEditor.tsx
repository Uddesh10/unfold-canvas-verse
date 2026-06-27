import { useState } from "react";
import { useGalleryStore, type Vertical } from "@/hooks/useGalleryStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Trash2, ArrowUp, ArrowDown, Plus, X, GripVertical, Eye, EyeOff } from "lucide-react";
import type { GalleryItem } from "@/data/galleries";
import { SaveBar } from "@/components/admin/SaveBar";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { CollapsibleCard } from "@/components/admin/CollapsibleCard";
import { StickyAdminHeader } from "@/components/admin/StickyAdminHeader";
import { PhotoImg } from "@/components/PhotoImg";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type PhotoRowProps = {
  id: string;
  photoUrl: string;
  index: number;
  inSlideshow: boolean;
  isHidden: boolean;
  onChange: (url: string) => void;
  onToggleSlideshow: () => void;
  onToggleHidden: () => void;
  onRemove: () => void;
};

const SortablePhotoRow = ({
  id,
  photoUrl,
  inSlideshow,
  isHidden,
  onChange,
  onToggleSlideshow,
  onToggleHidden,
  onRemove,
}: PhotoRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-3 items-center rounded-lg border border-border/40 p-2 bg-background ${
        isHidden ? "opacity-60" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none p-1 text-muted-foreground hover:text-foreground"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">
        <ImageUpload value={photoUrl} onChange={onChange} compact label="Upload photo" />
      </div>
      <label className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground cursor-pointer select-none whitespace-nowrap">
        <Checkbox checked={inSlideshow} onCheckedChange={onToggleSlideshow} disabled={!photoUrl} />
        Slideshow
      </label>
      <label className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground cursor-pointer select-none whitespace-nowrap">
        <Checkbox checked={isHidden} onCheckedChange={onToggleHidden} disabled={!photoUrl} />
        Hidden
      </label>
      <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

const PhotosList = ({
  photos,
  slideshowPhotos,
  hiddenPhotos,
  onChange,
  onSetPhoto,
  onRemove,
  onToggleSlideshow,
  onToggleHidden,
}: {
  photos: string[];
  slideshowPhotos: string[];
  hiddenPhotos: string[];
  onChange: (photos: string[]) => void;
  onSetPhoto: (idx: number, val: string) => void;
  onRemove: (idx: number) => void;
  onToggleSlideshow: (url: string) => void;
  onToggleHidden: (url: string) => void;
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = photos.map((_, i) => `p-${i}`);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(photos, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {photos.map((p, idx) => (
            <SortablePhotoRow
              key={ids[idx]}
              id={ids[idx]}
              photoUrl={p}
              index={idx}
              inSlideshow={!!p && slideshowPhotos.includes(p)}
              isHidden={!!p && hiddenPhotos.includes(p)}
              onChange={(url) => onSetPhoto(idx, url)}
              onToggleSlideshow={() => onToggleSlideshow(p)}
              onToggleHidden={() => onToggleHidden(p)}
              onRemove={() => onRemove(idx)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export const GalleryEditor = ({ vertical }: { vertical: Vertical }) => {
  const { items, set, save, dirty, saving } = useGalleryStore(vertical);
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});
  const setOpen = (i: number, v: boolean) => setOpenMap((m) => ({ ...m, [i]: v }));
  const expandAll = () => setOpenMap(Object.fromEntries(items.map((_, i) => [i, true])));
  const collapseAll = () => setOpenMap({});

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
        hiddenPhotos: [],
        videos: [],
        feedback: "",
      },
    ]);

  const setPhoto = (i: number, idx: number, val: string) => {
    const arr = [...(items[i].photos ?? [])];
    const prev = arr[idx];
    arr[idx] = val;
    const ss = [...(items[i].slideshowPhotos ?? [])];
    const k = ss.indexOf(prev);
    if (k !== -1) ss[k] = val;
    const hp = [...(items[i].hiddenPhotos ?? [])];
    const kh = hp.indexOf(prev);
    if (kh !== -1) hp[kh] = val;
    update(i, { photos: arr, slideshowPhotos: ss, hiddenPhotos: hp });
  };
  const addPhoto = (i: number) => update(i, { photos: [...(items[i].photos ?? []), ""] });
  const removePhoto = (i: number, idx: number) => {
    const arr = [...(items[i].photos ?? [])];
    const removed = arr.splice(idx, 1)[0];
    const ss = (items[i].slideshowPhotos ?? []).filter((u) => u !== removed);
    const hp = (items[i].hiddenPhotos ?? []).filter((u) => u !== removed);
    update(i, { photos: arr, slideshowPhotos: ss, hiddenPhotos: hp });
  };

  const toggleSlideshow = (i: number, url: string) => {
    if (!url) return;
    const current = items[i].slideshowPhotos ?? [];
    const next = current.includes(url) ? current.filter((u) => u !== url) : [...current, url];
    update(i, { slideshowPhotos: next });
  };

  const toggleHidden = (i: number, url: string) => {
    if (!url) return;
    const current = items[i].hiddenPhotos ?? [];
    const next = current.includes(url) ? current.filter((u) => u !== url) : [...current, url];
    update(i, { hiddenPhotos: next });
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
      <StickyAdminHeader>
        <SaveBar dirty={dirty} saving={saving} save={save} />
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="text-sm text-muted-foreground">
            {items.length} album{items.length === 1 ? "" : "s"}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>Expand all</Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>Collapse all</Button>
            <Button size="sm" onClick={add}>
              <Plus className="h-3.5 w-3.5 mr-2" /> Add album
            </Button>
          </div>
        </div>
      </StickyAdminHeader>

      <div className="space-y-3">
        {items.map((it, i) => {
          const isOpen = !!openMap[i];
          const photoCount = (it.photos ?? []).length;
          const hiddenCount = (it.hiddenPhotos ?? []).length;
          const videoCount = (it.videos ?? []).length;
          return (
            <CollapsibleCard
              key={i}
              open={isOpen}
              onOpenChange={(v) => setOpen(i, v)}
              className={it.hidden ? "opacity-60" : ""}
              header={
                <div className="flex items-center gap-3 min-w-0">
                  {it.src ? (
                    <PhotoImg
                      photo={it.src}
                      variant="thumb"
                      alt=""
                      className="w-10 h-10 rounded object-cover shrink-0 border border-border/40"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-muted shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {it.client?.trim() || it.alt?.trim() || "Untitled album"}
                      {it.hidden ? <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">· hidden</span> : null}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {it.caption || "—"} · {photoCount} photo{photoCount === 1 ? "" : "s"}
                      {hiddenCount ? ` · ${hiddenCount} hidden` : ""}
                      {videoCount ? ` · ${videoCount} video${videoCount === 1 ? "" : "s"}` : ""}
                    </div>
                  </div>
                </div>
              }
              actions={
                <>
                  <Button variant="ghost" size="icon" onClick={() => update(i, { hidden: !it.hidden })} aria-label={it.hidden ? "Unhide album" : "Hide album"}>
                    {it.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                </>
              }
            >
              <div className="space-y-5 pt-3">
                <div className="grid grid-cols-12 gap-3 items-start">
                  <div className="col-span-12 sm:col-span-3 space-y-2">
                    <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Cover image</Label>
                    <ImageUpload value={it.src} onChange={(url) => update(i, { src: url })} />
                  </div>
                  <div className="col-span-12 sm:col-span-9 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input value={it.client ?? ""} onChange={(e) => update(i, { client: e.target.value })} placeholder="Client name (shown on hover)" />
                      <Input value={it.caption ?? ""} onChange={(e) => update(i, { caption: e.target.value })} placeholder="Event date / location (e.g. Tuscany · June 2024)" />
                    </div>
                    <Input value={it.alt} onChange={(e) => update(i, { alt: e.target.value })} placeholder="Alt text" />
                  </div>
                </div>

                {/* Photos list */}
                <div>
                  <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                    <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      Photos · drag to reorder · "Slideshow" features on grid · "Hidden" skips on site
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
                  <PhotosList
                    photos={it.photos ?? []}
                    slideshowPhotos={it.slideshowPhotos ?? []}
                    hiddenPhotos={it.hiddenPhotos ?? []}
                    onChange={(photos) => update(i, { photos })}
                    onSetPhoto={(idx, val) => setPhoto(i, idx, val)}
                    onRemove={(idx) => removePhoto(i, idx)}
                    onToggleSlideshow={(url) => toggleSlideshow(i, url)}
                    onToggleHidden={(url) => toggleHidden(i, url)}
                  />
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
            </CollapsibleCard>
          );
        })}
      </div>
    </div>
  );
};
