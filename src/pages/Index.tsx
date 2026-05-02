import { useLenis } from "@/hooks/useLenis";
import { useTheme } from "@/hooks/useTheme";
import { Seo } from "@/components/Seo";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CustomCursor } from "@/components/CustomCursor";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Process } from "@/components/sections/Process";
import { Faq } from "@/components/sections/Faq";
import { Booking } from "@/components/sections/Booking";
import { Contact } from "@/components/sections/Contact";
import { Reveal } from "@/components/Reveal";
import { Link } from "react-router-dom";
import { verticals } from "@/data/themes";

const Index = () => {
  useLenis();
  useTheme("default");

  return (
    <div className="relative">
      <Seo
        title="Unfold Studios — Cinematic photography in three perspectives"
        description="A photography house of three studios — Weddings, Interiors and Street — built on quiet observation and luxurious craft."
        path="/"
      />
      <CustomCursor />
      <Nav />
      <main>
        <Hero />

        {/* Verticals overview */}
        <section className="relative py-24 md:py-32">
          <div className="container mx-auto px-6">
            <Reveal>
              <div className="text-center mb-14">
                <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-4">
                  The three studios
                </div>
                <h2 className="font-display text-5xl md:text-6xl">
                  One house. <span className="italic text-gradient">Three perspectives.</span>
                </h2>
              </div>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-5">
              {verticals.map((v, i) => (
                <Reveal key={v.key} delay={i * 0.12}>
                  <Link
                    to={v.path}
                    className="group relative block overflow-hidden rounded-3xl glass aspect-[3/4] hover:glow transition-all"
                    data-cursor-hover
                  >
                    <img
                      src={v.image}
                      alt={v.brand}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                    />
                    <div
                      className="absolute inset-0 transition-opacity duration-500 opacity-70 group-hover:opacity-90"
                      style={{
                        background: `linear-gradient(180deg, transparent 30%, ${v.color}33 70%, ${v.color}aa 100%), linear-gradient(180deg, transparent 50%, hsl(var(--background)) 100%)`,
                      }}
                    />
                    <div className="relative z-10 flex h-full flex-col justify-between p-7">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/80">
                        0{i + 1} — {v.label}
                      </div>
                      <div>
                        <div className="font-display text-3xl md:text-4xl mb-2">{v.brand}</div>
                        <p className="text-sm text-foreground/80 max-w-xs">{v.tagline}</p>
                        <div className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em]">
                          <span>Enter studio</span>
                          <span className="transition-transform group-hover:translate-x-1">→</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <About />
        <Process />
        <Faq />
        <Booking />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
