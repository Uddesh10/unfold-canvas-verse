import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHeroSlidesStore } from "@/hooks/useHeroSlidesStore";
import { PhotoImg } from "@/components/PhotoImg";
import { useIsMobile } from "@/hooks/use-mobile";

export const HeroScene = () => {
  const { items: slides, loading } = useHeroSlidesStore();
  const [i, setI] = useState(0);
  const pausedUntilRef = useRef(0);
  const isMobile = useIsMobile();

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

  if (loading || slides.length === 0) {
    return <div className="absolute inset-0 bg-background" />;
  }

  const current = slides[i];

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
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
            photo={current.src}
            variant="full"
            alt={current.caption}
            className={`absolute inset-0 h-full w-full ${
              isMobile ? "object-contain" : "object-cover object-center"
            }`}
            draggable={false}
            eager
            loading="eager"
          />
        </motion.div>
      </AnimatePresence>

      {/* Subtle vignette so the glass card always reads well */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />

      {/* Centered glass caption card */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="glass rounded-2xl px-6 py-5 md:px-10 md:py-7 text-center max-w-[92vw] md:max-w-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          >
            <div
              className="font-display leading-[0.95] tracking-tight"
              style={{ fontSize: "clamp(2rem, 7vw, 5rem)" }}
            >
              <span className="text-gradient">Unfold</span>{" "}
              <span className="font-light italic">Studios</span>
            </div>
            {current.caption && (
              <div className="mt-3 md:mt-4 text-[10px] md:text-xs uppercase tracking-[0.35em] text-white/90">
                {current.caption}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

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
