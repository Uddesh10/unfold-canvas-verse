import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { verticals } from "@/data/themes";
import { Reveal } from "@/components/Reveal";

const CYCLE_MS = 5000;

export const Showcase = () => {
  const [i, setI] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const v = verticals[i];

  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % verticals.length), CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  const onMove = (e: React.MouseEvent) => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -y * 8, y: x * 12 });
  };
  const onLeave = () => setTilt({ x: 0, y: 0 });
  const prev = () => setI((x) => (x - 1 + verticals.length) % verticals.length);
  const next = () => setI((x) => (x + 1) % verticals.length);

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* aurora wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70 transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at 20% 30%, ${v.glow}33, transparent 55%), radial-gradient(ellipse at 80% 70%, ${v.color}33, transparent 55%)`,
        }}
      />

      <div className="container mx-auto px-6 relative">
        <Reveal>
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-4">
              The three studios
            </div>
            <h2 className="font-display text-5xl md:text-6xl">
              One house. <span className="italic text-gradient">Three perspectives.</span>
            </h2>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-12 gap-8 items-center">
          {/* Side: index + meta */}
          <div className="md:col-span-3 order-2 md:order-1">
            <div className="font-display text-[22vw] md:text-[10vw] leading-none text-gradient">
              0{i + 1}
            </div>
            <div className="mt-2 text-xs uppercase tracking-[0.4em] text-muted-foreground">
              of 0{verticals.length}
            </div>
            <div className="mt-6 h-px w-full bg-border relative overflow-hidden">
              <motion.div
                key={i}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
                className="absolute top-0 left-0 h-full"
                style={{ background: v.color }}
              />
            </div>
            <div className="mt-8 hidden md:flex flex-col gap-2">
              {verticals.map((vv, idx) => (
                <button
                  key={vv.key}
                  onClick={() => setI(idx)}
                  data-cursor-hover
                  className={`group flex items-center gap-3 text-left text-xs uppercase tracking-[0.3em] py-1 transition-opacity ${
                    idx === i ? "opacity-100" : "opacity-40 hover:opacity-80"
                  }`}
                >
                  <span
                    className="h-1.5 w-6 rounded-full transition-all"
                    style={{ background: idx === i ? vv.color : "hsl(var(--muted-foreground) / 0.4)" }}
                  />
                  {vv.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stage */}
          <div className="md:col-span-9 order-1 md:order-2">
            <div
              ref={stageRef}
              onMouseMove={onMove}
              onMouseLeave={onLeave}
              onClick={() => navigate(v.path)}
              data-cursor-hover
              className="group relative aspect-[16/10] rounded-3xl overflow-hidden cursor-pointer"
              style={{ perspective: 1200 }}
            >
              <motion.div
                animate={{ rotateX: tilt.x, rotateY: tilt.y }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                className="absolute inset-0"
                style={{ transformStyle: "preserve-3d" }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={v.key}
                    src={v.image}
                    alt={v.brand}
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.04 }}
                    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(180deg, transparent 30%, ${v.color}55 100%), linear-gradient(180deg, transparent 50%, hsl(var(--background)) 100%)`,
                  }}
                />
                {/* glowing corner badge */}
                <div className="absolute top-5 left-5 glass-strong rounded-full px-4 py-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em]">
                  <span style={{ color: v.color }}>●</span> {v.label}
                </div>
                <div className="absolute top-5 right-5 glass-strong rounded-full p-3 group-hover:rotate-45 transition-transform">
                  <ArrowUpRight className="h-4 w-4" />
                </div>

                {/* Prev / Next arrows */}
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  data-cursor-hover
                  aria-label="Previous studio"
                  className="absolute left-4 top-1/2 -translate-y-1/2 glass-strong rounded-full p-3 hover:scale-110 transition-transform"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  data-cursor-hover
                  aria-label="Next studio"
                  className="absolute right-4 top-1/2 -translate-y-1/2 glass-strong rounded-full p-3 hover:scale-110 transition-transform"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <div className="absolute bottom-0 inset-x-0 p-7 md:p-10">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={v.key}
                      initial={{ y: 24, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -12, opacity: 0 }}
                      transition={{ duration: 0.7 }}
                    >
                      <div className="font-display text-4xl md:text-6xl">{v.brand}</div>
                      <p className="mt-2 max-w-lg text-sm md:text-base text-foreground/85">
                        {v.tagline}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em]">
                        <span>Enter studio</span>
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* mobile dots */}
            <div className="mt-5 flex md:hidden justify-center gap-2">
              {verticals.map((vv, idx) => (
                <button
                  key={vv.key}
                  onClick={() => setI(idx)}
                  className="h-1.5 w-8 rounded-full transition-all"
                  style={{ background: idx === i ? vv.color : "hsl(var(--muted-foreground) / 0.3)" }}
                  aria-label={vv.label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* drifting marquee */}
        <div className="mt-16 overflow-hidden border-y border-border py-4">
          <div className="flex gap-10 animate-marquee whitespace-nowrap">
            {Array.from({ length: 3 }).flatMap((_, k) =>
              ["Tuscany", "Milan", "Shinjuku 02:14", "Veil", "Marble", "Neon", "Provence", "Lisbon Light", "Brick Lane", "Mumbai 05:40"].map((w, j) => (
                <span key={`${k}-${j}`} className="font-mono text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
                  {w} <span className="text-primary mx-2">●</span>
                </span>
              )),
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
