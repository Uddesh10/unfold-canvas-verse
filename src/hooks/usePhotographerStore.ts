import { useLocalStore } from "@/lib/localStore";
import { defaultPhotographer, type Photographer } from "@/data/photographer";

const KEY = "unfold:photographer";

export function usePhotographerStore() {
  const [value, set] = useLocalStore<Photographer>(KEY, defaultPhotographer);
  return { value, set, reset: () => set(defaultPhotographer) };
}
