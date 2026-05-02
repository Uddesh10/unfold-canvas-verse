import { Reveal } from "@/components/Reveal";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const steps = [
  { n: "01", t: "Consultation & Booking", d: "We meet — over coffee, video, or a shared playlist — and learn the shape of your story." },
  { n: "02", t: "Agreement & Confirmation", d: "A clear, considered proposal. Dates locked, scope shaped, expectations aligned." },
  { n: "03", t: "Capturing Moments", d: "We arrive light-footed and present. The work happens in the spaces between poses." },
  { n: "04", t: "Delivery of Memories", d: "A privately curated gallery, fine-art prints, optional heirloom albums. Yours, forever." },
];

export const Process = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.85], ["0%", "100%"]);

  return (
    <section id="process" className="relative py-28 md:py-40">
      <div className="container mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-5">
              02 — The process
            </div>
            <h2 className="font-display text-5xl md:text-6xl">A quiet, certain rhythm.</h2>
          </div>
        </Reveal>

        <div ref={ref} className="relative max-w-4xl mx-auto">
          {/* track */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border/60 -translate-x-1/2" />
          {/* progress line */}
          <motion.div
            style={{ height: lineHeight }}
            className="absolute left-6 md:left-1/2 top-0 w-px bg-gradient-to-b from-theme-1 via-theme-2 to-theme-3 -translate-x-1/2"
          />
          <ol className="space-y-14">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1} as="li" className={`relative grid md:grid-cols-2 gap-6 items-center ${i % 2 ? "md:[direction:rtl]" : ""}`}>
                <div className="md:[direction:ltr] pl-16 md:pl-0 md:px-10">
                  <div className="font-mono text-xs text-muted-foreground mb-2">STEP {s.n}</div>
                  <h3 className="font-display text-3xl mb-2">{s.t}</h3>
                  <p className="text-muted-foreground">{s.d}</p>
                </div>
                <div className="hidden md:block" />
                <span
                  aria-hidden
                  className="absolute left-6 md:left-1/2 top-2 -translate-x-1/2 h-3 w-3 rounded-full bg-foreground glow"
                />
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};
