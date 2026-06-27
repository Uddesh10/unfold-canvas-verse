import { useSiteContent } from "@/hooks/useSiteContent";
import type { HeroSlide } from "@/hooks/useHeroSlidesStore";

const fallback: HeroSlide[] = [];

export function useStoriesHeroSlidesStore() {
  const { value, set, save, dirty, saving, loading } = useSiteContent<HeroSlide[]>(
    "stories_hero_slides",
    fallback,
  );
  return { items: value, set, save, dirty, saving, loading };
}
