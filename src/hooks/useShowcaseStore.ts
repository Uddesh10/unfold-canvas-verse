import { useLocalStore } from "@/lib/localStore";
import { verticals } from "@/data/themes";

export type ShowcaseSlide = {
  key: string;
  brand: string;
  label: string;
  tagline: string;
  path: string;
  color: string;
  glow: string;
  image: string;
};

export const defaultShowcaseSlides: ShowcaseSlide[] = verticals.map((v) => ({
  key: v.key,
  brand: v.brand,
  label: v.label,
  tagline: v.tagline,
  path: v.path,
  color: v.color,
  glow: v.glow,
  image: v.image,
}));

export const SHOWCASE_KEY = "unfold:showcase";

export function useShowcaseStore() {
  const [items, set] = useLocalStore<ShowcaseSlide[]>(SHOWCASE_KEY, defaultShowcaseSlides);
  return { items, set, reset: () => set(defaultShowcaseSlides) };
}
