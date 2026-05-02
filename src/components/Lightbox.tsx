import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryItem } from "@/data/galleries";

interface Props {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}

export const Lightbox = ({ items, index, onClose, onIndexChange }: Props) => {
  const open = index !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && index !== null) onIndexChange((index + 1) % items.length);
      if (e.key === "ArrowLeft" && index !== null) onIndexChange((index - 1 + items.length) % items.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, index, items.length, onIndexChange, onClose]);

  return (
    <AnimatePresence>
      {open && index !== null && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-background/90 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute top-6 right-6 glass rounded-full p-3 hover:glow transition"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            aria-label="Previous"
            onClick={(e) => { e.stopPropagation(); onIndexChange((index - 1 + items.length) % items.length); }}
            className="absolute left-4 md:left-8 glass rounded-full p-3 hover:glow transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            aria-label="Next"
            onClick={(e) => { e.stopPropagation(); onIndexChange((index + 1) % items.length); }}
            className="absolute right-4 md:right-8 glass rounded-full p-3 hover:glow transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <motion.figure
            key={index}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[92vw] max-h-[88vh]"
          >
            <img
              src={items[index].src}
              alt={items[index].alt}
              className="max-w-[92vw] max-h-[80vh] object-contain rounded-md shadow-glass"
            />
            {items[index].caption && (
              <figcaption className="mt-3 text-center text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {items[index].caption}
              </figcaption>
            )}
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export function useLightbox() {
  const [index, setIndex] = useState<number | null>(null);
  return {
    index,
    open: (i: number) => setIndex(i),
    close: () => setIndex(null),
    set: (i: number) => setIndex(i),
  };
}
