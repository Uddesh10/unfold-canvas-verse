import { motion } from "framer-motion";
import { HeroScene } from "@/three/HeroScene";
import { Link } from "react-router-dom";
import { verticals } from "@/data/themes";

export const Hero = () => {
  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden hero-bg">
      <HeroScene />

      {/* Brand */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-[70%] flex flex-col items-center text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[14vw] md:text-[9vw] leading-[0.9] tracking-tight"
        >
          <span className="text-gradient">Unfold</span>{" "}
          <span className="font-light italic">Studios</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1.2 }}
          className="mt-6 max-w-md text-sm md:text-base text-muted-foreground tracking-wide"
        >
          storytelling through three perspectives
        </motion.p>
      </div>

      {/* Bottom: big-font perspective links */}
      <motion.nav
        className="absolute bottom-10 md:bottom-14 inset-x-0 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-10 px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 1 }}
        aria-label="Studios"
      >
        {verticals.map((v) => (
          <Link
            key={v.key}
            to={v.path}
            className="group relative font-display text-3xl md:text-5xl tracking-tight hover:text-gradient transition-colors"
          >
            <span
              className="mr-3 inline-block h-2 w-2 rounded-full align-middle"
              style={{ background: v.color }}
            />
            <span className="italic">{v.label}</span>
            <span className="block h-px w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r from-primary to-accent mt-1" />
          </Link>
        ))}
      </motion.nav>

      {/* vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,hsl(var(--background))_100%)]" />
    </section>
  );
};
