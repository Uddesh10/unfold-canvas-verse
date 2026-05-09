import { useLocalStore } from "@/lib/localStore";
import { weddingTestimonials, type Testimonial } from "@/data/testimonials";

const KEY = "unfold:testimonials:weddings";

export function useWeddingTestimonialsStore() {
  const [items, set] = useLocalStore<Testimonial[]>(KEY, weddingTestimonials);
  return {
    items,
    set,
    reset: () => set(weddingTestimonials),
  };
}
