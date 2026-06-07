import { useSiteContent } from "@/hooks/useSiteContent";
import { defaultPhotographer, type Photographer } from "@/data/photographer";

export function usePhotographerStore() {
  return useSiteContent<Photographer>("photographer", defaultPhotographer);
}
