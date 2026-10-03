import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useHeroSlidesStore } from "@/hooks/useHeroSlidesStore";
import { PhotoImg } from "@/components/PhotoImg";
import { useIsMobile } from "@/hooks/use-mobile";
import { CarouselControls } from "@/components/CarouselControls";

export const HeroScene = () => {
  const { items: slides, loading } = useHeroSlidesStore();
  const [i, setI] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const pausedUntilRef = useRef(0);
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (slides.length === 0) return;
    setI((p) => (p >= slides.length ? 0 : p));
    const t = setInterval(() => {
      if (Date.now() < pausedUntilRef.current) return;
      setDirection(1);
      setI((p) => (p + 1) % slides.length);
    }, 4500);
    return () => clearInterval(t);
  }, [slides.length]);

  const go = (dir: -1 | 1) => {
    if (slides.length === 0) return;
    pausedUntilRef.current = Date.now() + 6000;
    setDirection(dir);
    setI((p) => (p + dir + slides.length) % slides.length);
  };

  if (loading || slides.length === 0) {
    return <div className="absolute inset-0 bg-background" />;
  }

  const current = slides[i];
  const imgSrc = (isMobile && current.mobileSrc) ? current.mobileSrc : current.src;

  return (
    <div className="absolute inset-0 overflow-hidden bg-carousel-surface">
      <AnimatePresence mode="sync">
        <motion.div
          key={i}
          initial={{ opacity: 0, x: reduceMotion ? 0 : direction * 36, scale: reduceMotion ? 1 : 1.035 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: reduceMotion ? 0 : direction * -20, scale: reduceMotion ? 1 : 1.015 }}
          transition={{ duration: reduceMotion ? 0.25 : 1.25, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <PhotoImg
            photo={imgSrc}
            variant="full"
            alt={current.caption}
            className="absolute inset-0 h-full w-full object-cover object-center"
            draggable={false}
            eager
            loading="eager"
          />
        </motion.div>
      </AnimatePresence>

      {/* Subtle vignette so the glass card always reads well */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />

      {/* Centered title (static across slides) */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center px-4">
        <div className="text-center max-w-[92vw] md:max-w-2xl">
          <div
            className="font-display leading-[0.95] tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]"
            style={{ fontSize: "clamp(2rem, 7vw, 5rem)" }}
          >
            <span className="text-gradient">Unfold</span>{" "}
            <span className="font-light italic">Studios</span>
          </div>
          <div className="mt-3 md:mt-4 text-xs md:text-sm uppercase tracking-[0.4em] text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            Story telling through three perspective
          </div>
        </div>
      </div>

      {/* Bottom-right caption */}
      {current.caption && (
        <div className="pointer-events-none absolute bottom-6 right-6 md:bottom-10 md:right-10 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="glass rounded-xl px-4 py-3 md:px-6 md:py-4 border border-white/10 text-right max-w-[80vw]"
            >
              {current.label && (
                <div className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/70 mb-1">
                  {current.label}
                </div>
              )}
              <div className="text-sm md:text-base text-white/90 font-medium tracking-wide">
                {current.caption}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}


      <CarouselControls current={i} total={slides.length} onPrevious={() => go(-1)} onNext={() => go(1)} />
    </div>
  );
};
