import { useSiteContent } from "@/hooks/useSiteContent";
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

const fallback: ShowcaseSlide[] = verticals.map((v) => ({
  key: v.key, brand: v.brand, label: v.label, tagline: v.tagline,
  path: v.path, color: v.color, glow: v.glow, image: v.image,
}));

export function useShowcaseStore() {
  const { value, set, loading } = useSiteContent<ShowcaseSlide[]>("showcase", fallback);
  return { items: value, set, loading };
}
