import { useLenis } from "@/hooks/useLenis";
import { useTheme } from "@/hooks/useTheme";
import { Seo } from "@/components/Seo";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CustomCursor } from "@/components/CustomCursor";
import { Reveal } from "@/components/Reveal";
import { Gallery } from "@/components/Gallery";
import { spacesGallery } from "@/data/galleries";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const clients = ["Casa Lume", "Hauser Atelier", "North Wing", "Volta House", "Studio Berge", "Mahon & Co", "Linnea Form"];

const Spaces = () => {
  useLenis();
  useTheme("spaces");

  return (
    <div className="relative">
      <Seo title="Unfold Spaces — Interior Photography" description="Editorial interior photography for architects, designers and hospitality brands. Quiet, considered, premium." path="/spaces" />
      <CustomCursor />
      <Nav />
      <main>
        {/* Hero — symmetrical, minimal */}
        <section className="relative pt-40 pb-24">
          <div className="container mx-auto px-6">
            <Reveal>
              <div className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground mb-6">Unfold Spaces</div>
              <h1 className="font-light text-5xl md:text-7xl leading-[1.05] max-w-4xl tracking-tight">
                Architecture, in its quietest voice.
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-8 max-w-xl text-base md:text-lg text-muted-foreground">
                Photography for architects, interior designers and hospitality brands. We make rooms hold their breath.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.3}>
            <motion.img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85"
              alt="Minimal interior"
              className="mt-16 w-full h-[60vh] object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.6 }}
            />
          </Reveal>
        </section>

        {/* Two-column note */}
        <section className="py-24">
          <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16">
            <Reveal>
              <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-4">Approach</div>
              <h2 className="font-light text-3xl md:text-4xl leading-snug tracking-tight">
                Light first. Then line. Then story.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-muted-foreground leading-relaxed">
                We arrive before sunrise and leave after dusk. We chart the light room by room and shoot only when geometry, shadow and material align. The result is a portfolio that holds up at any size, on any wall.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Strict grid gallery */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <Reveal>
              <div className="flex items-baseline justify-between mb-10 border-b border-border pb-4">
                <h2 className="font-light text-2xl tracking-tight">Selected projects</h2>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{spacesGallery.length} works · 2022—2025</span>
              </div>
            </Reveal>
            <Gallery items={spacesGallery} variant="grid" />
          </div>
        </section>

        {/* Client wordmarks */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <Reveal>
              <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground text-center mb-10">Selected clients</div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-muted-foreground/80">
                {clients.map((c) => (
                  <span key={c} className="font-light text-xl md:text-2xl tracking-tight">{c}</span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <Reveal>
              <div className="border border-border p-12 md:p-16 grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="font-light text-3xl md:text-4xl tracking-tight">Commission a shoot.</h2>
                  <p className="mt-3 text-muted-foreground">Day rates and project packages. Travel worldwide.</p>
                </div>
                <div className="md:text-right">
                  <Link
                    to="/#book"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-[0.3em] hover:scale-105 transition"
                  >
                    Start a brief →
                  </Link>
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

export default Spaces;
