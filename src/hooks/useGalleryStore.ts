import { useLocalStore } from "@/lib/localStore";
import {
  weddingsGallery,
  spacesGallery,
  storiesGallery,
  type GalleryItem,
} from "@/data/galleries";

export type Vertical = "weddings" | "spaces" | "stories";

const defaults: Record<Vertical, GalleryItem[]> = {
  weddings: weddingsGallery,
  spaces: spacesGallery,
  stories: storiesGallery,
};

const keyFor = (v: Vertical) => `unfold:gallery:${v}`;

export function useGalleryStore(v: Vertical) {
  const [items, set] = useLocalStore<GalleryItem[]>(keyFor(v), defaults[v]);
  return {
    items,
    set,
    reset: () => set(defaults[v]),
  };
}

export function getDefaults(v: Vertical) {
  return defaults[v];
}
