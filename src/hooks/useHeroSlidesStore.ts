import { useSiteContent } from "@/hooks/useSiteContent";

export type HeroSlide = {
  src: string;
  label: string;
  caption: string;
  tint: string;
};

export const defaultHeroSlides: HeroSlide[] = [
  {
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=80",
    label: "Weddings",
    caption: "Tuscany — golden hour vows",
    tint: "from-[hsl(330_90%_60%/0.45)] via-transparent to-[hsl(280_80%_50%/0.35)]",
  },
];

export function useHeroSlidesStore() {
  const { value, set, save, dirty, saving, loading } = useSiteContent<HeroSlide[]>("hero_slides", defaultHeroSlides);
  return { items: value, set, save, dirty, saving, loading };
}
