import { motion } from "framer-motion";
import { HeroScene } from "@/three/HeroScene";
import { Link } from "react-router-dom";
import { verticals } from "@/data/themes";

export const Hero = () => {
  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden hero-bg">
      <HeroScene />

      {/* Top tag */}
      <motion.div
        className="absolute top-24 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.5em] text-muted-foreground"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 1 }}
      >
        Est. 2016 — A photography house
      </motion.div>

      {/* Brand */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-[58%] flex flex-col items-center text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[14vw] md:text-[9vw] leading-[0.9] tracking-tight"
        >
          <span className="text-gradient">Unfold</span>{" "}
          <span className="font-light italic">Studios</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 1.2 }}
          className="mt-6 max-w-md text-sm md:text-base text-muted-foreground tracking-wide"
        >
          storytelling through three perspectives
        </motion.p>
      </div>

      {/* Bottom: pick a perspective */}
      <motion.div
        className="absolute bottom-8 inset-x-0 flex flex-col items-center gap-4 px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 1 }}
      >
        <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          Choose a perspective
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {verticals.map((v) => (
            <Link
              key={v.key}
              to={v.path}
              className="glass rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.25em] hover:glow transition-all hover:scale-[1.03]"
              data-cursor-hover
            >
              <span className="mr-2" style={{ color: v.color }}>●</span>
              {v.brand}
            </Link>
          ))}
        </div>
      </motion.div>

      {/* vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,hsl(var(--background))_100%)]" />
    </section>
  );
};
