import { useSiteContent } from "@/hooks/useSiteContent";

export type FavouriteShot = {
  src: string;
  alt: string;
  caption?: string;
};

const fallback: FavouriteShot[] = [];

export function useFavouriteShotsStore() {
  return useSiteContent<FavouriteShot[]>("favourite_shots", fallback);
}
