import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHeroSlidesStore } from "@/hooks/useHeroSlidesStore";
import { PhotoImg } from "@/components/PhotoImg";

export const HeroScene = () => {
  const { items: slides, loading } = useHeroSlidesStore();
  const [i, setI] = useState(0);
  const pausedUntilRef = useRef(0);

  useEffect(() => {
    if (slides.length === 0) return;
    setI((p) => (p >= slides.length ? 0 : p));
    const t = setInterval(() => {
      if (Date.now() < pausedUntilRef.current) return;
      setI((p) => (p + 1) % slides.length);
    }, 4500);
    return () => clearInterval(t);
  }, [slides.length]);

  const go = (dir: -1 | 1) => {
    if (slides.length === 0) return;
    pausedUntilRef.current = Date.now() + 6000;
    setI((p) => (p + dir + slides.length) % slides.length);
  };

  // Avoid flashing the default slide before remote slides load.
  if (loading || slides.length === 0) {
    return <div className="absolute inset-0 bg-background" />;
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <PhotoImg
            photo={slides[i].src}
            variant="full"
            alt={slides[i].caption}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
            eager
            loading="eager"
          />
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="group absolute top-1/2 -translate-y-1/2 left-3 md:left-6 z-10 glass rounded-full p-2 md:p-3 hover:glow transition pointer-events-auto"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next slide"
            className="group absolute top-1/2 -translate-y-1/2 right-3 md:right-6 z-10 glass rounded-full p-2 md:p-3 hover:glow transition pointer-events-auto"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </>
      )}
    </div>
  );
};
