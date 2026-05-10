import { useLocalStore } from "@/lib/localStore";

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
  {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80",
    label: "Spaces",
    caption: "Casa Lume — Milan",
    tint: "from-[hsl(190_90%_55%/0.4)] via-transparent to-[hsl(220_80%_40%/0.4)]",
  },
  {
    src: "https://images.unsplash.com/photo-1517242810446-cc8951b2be40?auto=format&fit=crop&w=1800&q=80",
    label: "Stories",
    caption: "Shinjuku — 02:14",
    tint: "from-[hsl(290_90%_55%/0.45)] via-transparent to-[hsl(180_90%_50%/0.35)]",
  },
  {
    src: "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=1800&q=80",
    label: "Stories",
    caption: "Hong Kong — rain & neon",
    tint: "from-[hsl(260_90%_55%/0.4)] via-transparent to-[hsl(200_90%_50%/0.4)]",
  },
  {
    src: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1800&q=80",
    label: "Spaces",
    caption: "Volta House — Lisbon",
    tint: "from-[hsl(20_90%_60%/0.35)] via-transparent to-[hsl(330_80%_55%/0.4)]",
  },
];

export const HERO_SLIDES_KEY = "unfold:hero-slides";

export function useHeroSlidesStore() {
  const [items, set] = useLocalStore<HeroSlide[]>(HERO_SLIDES_KEY, defaultHeroSlides);
  return { items, set, reset: () => set(defaultHeroSlides) };
}
