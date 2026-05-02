import { useLenis } from "@/hooks/useLenis";
import { useTheme } from "@/hooks/useTheme";
import { Seo } from "@/components/Seo";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CustomCursor } from "@/components/CustomCursor";
import { Reveal } from "@/components/Reveal";
import { Gallery } from "@/components/Gallery";
import { storiesGallery } from "@/data/galleries";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const fieldNotes = [
  "TOKYO 02:14",
  "MUMBAI 05:40",
  "BERLIN 23:08",
  "BROOKLYN 18:47",
  "MEXICO CITY 16:22",
  "LAGOS 11:05",
  "ISTANBUL 21:33",
];

const Stories = () => {
  useLenis();
  useTheme("stories");

  return (
    <div className="relative">
      <Seo title="Unfold Stories — Street Photography" description="Documentary street photography. Raw, neon, unposed. Editorial commissions and prints." path="/stories" />
      <CustomCursor />
      <Nav />
      <main className="grain relative">
        {/* Hero */}
        <section className="relative h-[100svh] min-h-[640px] overflow-hidden flex items-end">
          <motion.img
            src="https://images.unsplash.com/photo-1517242810446-cc8951b2be40?auto=format&fit=crop&w=2400&q=85"
            alt="Neon street"
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.4 }}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background" />
          <div className="absolute inset-0 mix-blend-overlay opacity-50 bg-[radial-gradient(ellipse_at_20%_30%,hsl(var(--theme-1)/0.4),transparent_55%),radial-gradient(ellipse_at_80%_60%,hsl(var(--theme-2)/0.35),transparent_55%)]" />

          <div className="relative z-10 container mx-auto px-6 pb-16">
            <Reveal>
              <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent mb-6">/// Unfold Stories — Field Edition 07</div>
              <h1 className="font-bold-display text-[18vw] md:text-[12vw] leading-[0.85]">
                THE CITY,<br />
                <span className="text-gradient">UNPOSED.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-8 max-w-xl text-base md:text-lg text-foreground/80 font-mono">
                Documentary street work in 24 cities. Grain, contrast, neon, the truth of a moment seen from the kerb.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Marquee field notes */}
        <section className="py-8 border-y border-border bg-secondary/30 overflow-hidden">
          <div className="flex gap-12 animate-marquee whitespace-nowrap">
            {[...fieldNotes, ...fieldNotes, ...fieldNotes].map((n, i) => (
              <span key={i} className="font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground">
                {n} <span className="text-primary">●</span>
              </span>
            ))}
          </div>
        </section>

        {/* Asymmetric content */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-6 grid md:grid-cols-12 gap-6 items-end">
            <Reveal className="md:col-span-7">
              <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent mb-4">Manifesto</div>
              <h2 className="font-bold-display text-5xl md:text-7xl leading-[0.95]">
                NO POSE.<br />
                NO PROMPT.<br />
                <span className="text-gradient">ONLY THE STREET.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="md:col-span-4 md:col-start-9">
              <p className="text-foreground/80 leading-relaxed border-l-2 border-primary pl-5">
                We work on assignment for magazines, brands, and private collectors who want street work that hasn't been sanitised.
                Long lenses, longer waits, no permissions theatre. The city as it is.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Collage gallery */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <Reveal>
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-bold-display text-3xl md:text-4xl">EDITION 07 // FRAMES</h2>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{storiesGallery.length} captures</span>
              </div>
            </Reveal>
            <Gallery items={storiesGallery} variant="collage" />
          </div>
        </section>

        {/* Pull quote */}
        <section className="py-32">
          <div className="container mx-auto px-6">
            <Reveal>
              <blockquote className="font-bold-display text-4xl md:text-6xl leading-[1.1] max-w-5xl">
                "EVERY CITY IS A NOVEL <span className="text-gradient">WRITTEN BY ITS STRANGERS.</span> WE JUST PHOTOGRAPH THE PAGES."
              </blockquote>
              <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground mt-6">— Unfold Field Notes, vol. 03</div>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <Reveal>
              <div className="border border-primary/40 p-10 md:p-14 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary/30 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />
                <div className="relative grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent mb-2">/// Commissions open</div>
                    <h2 className="font-bold-display text-4xl md:text-5xl">SHOOT YOUR CITY.</h2>
                  </div>
                  <div className="md:text-right">
                    <Link
                      to="/#book"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-[0.3em] hover:scale-105 transition"
                    >
                      Send a brief →
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Stories;
