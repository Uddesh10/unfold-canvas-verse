import { Reveal } from "@/components/Reveal";

export const About = () => {
  return (
    <section id="about" className="relative py-28 md:py-40">
      <div className="container mx-auto px-6 grid md:grid-cols-12 gap-10 items-center">
        <Reveal className="md:col-span-5">
          <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-5">
            01 — The studio
          </div>
          <h2 className="font-display text-5xl md:text-6xl leading-[1.05]">
            We don't take photographs. <span className="italic text-gradient">We unfold them.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.15} className="md:col-span-7 md:col-start-7">
          <div className="glass rounded-3xl p-8 md:p-10 space-y-5">
            <p className="text-base md:text-lg leading-relaxed text-foreground/90">
              Unfold is a photography house built on a single belief: every subject — a couple, a room, a stranger on a corner — already holds its own story. Our work is to be quiet enough to see it, and patient enough to wait for it to open.
            </p>
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
              Three studios under one roof. Three temperaments, three palettes, one philosophy. Whether we're capturing the first dance of a wedding, the morning light across a marble counter, or a stranger's gaze in a rain-slicked street, the goal is the same: to return the moment to you, undiminished.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {["22 countries", "9 years", "180+ stories"].map((s) => (
                <span key={s} className="text-xs uppercase tracking-[0.2em] glass rounded-full px-4 py-2 text-muted-foreground">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
