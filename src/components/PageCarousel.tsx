import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PhotoImg } from "@/components/PhotoImg";
import { useIsMobile } from "@/hooks/use-mobile";
import type { HeroSlide } from "@/hooks/useHeroSlidesStore";


interface Props {
  slides: HeroSlide[];
  loading?: boolean;
  className?: string;
  heightClass?: string;
  centerTitle?: { brand: string; tagline: string };
  bottomRightText?: string;
}

export const PageCarousel = ({
  slides,
  loading,
  className = "",
  heightClass = "h-[70svh] min-h-[480px]",
  centerTitle,
  bottomRightText,
}: Props) => {
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
    return <div className={`relative w-full bg-muted ${heightClass} ${className}`} />;
  }

  return (
    <div className={`relative w-full overflow-hidden ${heightClass} ${className}`}>
      <AnimatePresence mode="sync">
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <PhotoImg
            photo={(isMobile && slides[i].mobileSrc) ? slides[i].mobileSrc! : slides[i].src}
            variant="full"
            alt={slides[i].caption}
            className={`absolute inset-0 h-full w-full ${isMobile ? "object-contain" : "object-cover object-center"}`}
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
            className="absolute top-1/2 -translate-y-1/2 left-3 md:left-6 z-10 glass rounded-full p-2 md:p-3 hover:glow transition"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next slide"
            className="absolute top-1/2 -translate-y-1/2 right-3 md:right-6 z-10 glass rounded-full p-2 md:p-3 hover:glow transition"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </>
      )}
    </div>
  );
};
