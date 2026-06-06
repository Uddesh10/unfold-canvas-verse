import { useSiteContent } from "@/hooks/useSiteContent";
import { defaultPhotographer, type Photographer } from "@/data/photographer";

export function usePhotographerStore() {
  const { value, set, loading } = useSiteContent<Photographer>("photographer", defaultPhotographer);
  return { value, set, loading };
}
