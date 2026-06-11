import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHeroSlidesStore } from "@/hooks/useHeroSlidesStore";
import { PhotoImg } from "@/components/PhotoImg";

export const HeroScene = () => {
  const { items: slides, loading } = useHeroSlidesStore();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (slides.length === 0) return;
    setI((p) => (p >= slides.length ? 0 : p));
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [slides.length]);

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
          <img
            src={resolveImageUrl(slides[i].src)}
            alt={slides[i].caption}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      {/* slide caption */}
      <div className="absolute bottom-32 right-8 md:right-12 text-right pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-[10px] uppercase tracking-[0.4em] text-primary mb-1">
              {slides[i].label}
            </div>
            <div className="text-xs md:text-sm text-foreground/80 italic">
              {slides[i].caption}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* progress dots */}
      <div className="absolute bottom-32 left-8 md:left-12 flex gap-2 pointer-events-auto">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Slide ${idx + 1}`}
            className="group relative h-1 w-8 rounded-full bg-foreground/15 overflow-hidden"
          >
            <span
              className={`absolute inset-0 origin-left bg-gradient-to-r from-primary to-accent transition-transform duration-500 ${
                idx === i ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
