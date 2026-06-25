import { motion } from "framer-motion";
import { HeroScene } from "@/three/HeroScene";

export const Hero = () => {
  return (
    <section className="relative h-[100svh] min-h-[520px] w-full overflow-hidden hero-bg">
      <HeroScene />

      {/* Brand */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center text-center px-4 sm:px-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-display leading-[0.95] tracking-tight max-w-[92vw]"
          style={{ fontSize: "clamp(2.5rem, 11vw, 9rem)" }}
        >
          <span className="text-gradient">Unfold</span>{" "}
          <span className="font-light italic">Studios</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1.2 }}
          className="mt-4 sm:mt-6 md:mt-8 max-w-2xl text-sm sm:text-base md:text-2xl text-muted-foreground/90 tracking-wide font-light px-2"
        >
          storytelling through{" "}
          <span className="italic text-foreground/90">three perspectives</span>
        </motion.p>
      </div>
    </section>
  );
};
