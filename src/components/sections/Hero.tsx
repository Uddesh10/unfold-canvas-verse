import { motion } from "framer-motion";
import { HeroScene } from "@/three/HeroScene";

export const Hero = () => {
  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden hero-bg">
      <HeroScene />

      {/* Brand */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center text-center px-6">
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
    </section>
  );
};
