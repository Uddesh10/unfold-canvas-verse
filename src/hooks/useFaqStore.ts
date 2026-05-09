import { useLocalStore } from "@/lib/localStore";
import { faqs as defaultFaqs, type FaqItem } from "@/data/faq";

const KEY = "unfold:faqs";

export function useFaqStore() {
  const [items, set] = useLocalStore<FaqItem[]>(KEY, defaultFaqs);
  return {
    items,
    set,
    reset: () => set(defaultFaqs),
  };
}
