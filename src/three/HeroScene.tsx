import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=80",
    label: "Weddings",
    caption: "Tuscany — golden hour vows",
    tint: "from-[hsl(330_90%_60%/0.45)] via-transparent to-[hsl(280_80%_50%/0.35)]",
  },
  {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80",
    label: "Spaces",
    caption: "Casa Lume — Milan",
    tint: "from-[hsl(190_90%_55%/0.4)] via-transparent to-[hsl(220_80%_40%/0.4)]",
  },
  {
    src: "https://images.unsplash.com/photo-1517242810446-cc8951b2be40?auto=format&fit=crop&w=1800&q=80",
    label: "Stories",
    caption: "Shinjuku — 02:14",
    tint: "from-[hsl(290_90%_55%/0.45)] via-transparent to-[hsl(180_90%_50%/0.35)]",
  },
  {
    src: "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=1800&q=80",
    label: "Stories",
    caption: "Hong Kong — rain & neon",
    tint: "from-[hsl(260_90%_55%/0.4)] via-transparent to-[hsl(200_90%_50%/0.4)]",
  },
  {
    src: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1800&q=80",
    label: "Spaces",
    caption: "Volta House — Lisbon",
    tint: "from-[hsl(20_90%_60%/0.35)] via-transparent to-[hsl(330_80%_55%/0.4)]",
  },
];

export const HeroScene = () => {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, []);

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
            src={slides[i].src}
            alt={slides[i].caption}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${slides[i].tint}`} />
        </motion.div>
      </AnimatePresence>

      {/* film grain / overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,hsl(var(--background))_95%)]" />
      <div className="pointer-events-none absolute inset-0 bg-background/30" />

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
