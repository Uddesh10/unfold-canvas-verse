import { useLenis } from "@/hooks/useLenis";
import { useTheme } from "@/hooks/useTheme";
import { Seo } from "@/components/Seo";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CustomCursor } from "@/components/CustomCursor";
import { Reveal } from "@/components/Reveal";
import { Gallery } from "@/components/Gallery";
import { useGalleryStore } from "@/hooks/useGalleryStore";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const testimonials = [
  { q: "We cried when we opened the gallery. Every quiet moment we'd missed was waiting for us, perfectly held.", a: "Anika & Rohan — Udaipur" },
  { q: "Cinema. There's no other word. Our day, returned to us as a film without a frame.", a: "Sophie & Léo — Provence" },
  { q: "The crew were invisible until we needed them. Our families haven't stopped talking about the photos.", a: "Maya & Daniel — Kyoto" },
];

const Weddings = () => {
  useLenis();
  useTheme("weddings");
  const { items } = useGalleryStore("weddings");
  return (
    <div className="relative">
      <Seo title="Unfold Studios — Wedding Photography" description="Romantic, cinematic wedding photography. Editorial coverage, fine-art delivery, worldwide." path="/weddings" />
      <CustomCursor />
      <Nav />
      <main>
        {/* Hero */}
        <section className="relative h-[92svh] min-h-[600px] overflow-hidden">
          <motion.img
            src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=2200&q=85"
            alt="Couple in golden light"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/10 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,hsl(var(--theme-1)/0.35),transparent_60%)] mix-blend-soft-light" />
          <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-end pb-24">
            <Reveal>
              <div className="text-xs uppercase tracking-[0.4em] text-primary mb-4">Unfold Studios</div>
              <h1 className="font-display text-6xl md:text-8xl leading-[0.95] max-w-4xl">
                Where vows become <span className="italic text-gradient">forever.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base md:text-lg text-foreground/80">
                Editorial wedding photography for couples who want their day remembered the way it actually felt — luminous, slow, and theirs.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Intro */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-6 grid md:grid-cols-12 gap-10">
            <Reveal className="md:col-span-5">
              <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">The work</div>
              <h2 className="font-display text-5xl md:text-6xl leading-[1.05]">A film for the rest of your life.</h2>
            </Reveal>
            <Reveal delay={0.15} className="md:col-span-6 md:col-start-7 text-foreground/80 text-lg leading-relaxed space-y-4">
              <p>We approach every wedding as an editorial shoot wrapped around a love story. Our lenses chase the softest light; our crew choreographs nothing.</p>
              <p>What you're left with is a private archive — fine-art prints, a curated gallery, and an heirloom album made in linen and Italian leather.</p>
            </Reveal>
          </div>
        </section>

        {/* Gallery */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-6">
            <Reveal>
              <div className="flex items-end justify-between mb-10">
                <h2 className="font-display text-4xl md:text-5xl">Selected stories</h2>
                <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground hidden md:block">2023 — 2025</span>
              </div>
            </Reveal>
            <Gallery items={items} variant="masonry" />
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <figure className="glass rounded-3xl p-8 h-full">
                    <span className="font-display text-5xl text-gradient leading-none">"</span>
                    <blockquote className="mt-2 text-base leading-relaxed">{t.q}</blockquote>
                    <figcaption className="mt-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">— {t.a}</figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <Reveal>
              <div className="glass rounded-3xl p-12 md:p-16 text-center glow">
                <h2 className="font-display text-4xl md:text-5xl">Begin your wedding story.</h2>
                <p className="mt-4 text-muted-foreground max-w-xl mx-auto">A handful of weddings each year. Bookings open 6–9 months ahead.</p>
                <Link
                  to="/#book"
                  className="inline-flex items-center gap-2 mt-8 px-8 py-3 rounded-full bg-primary text-primary-foreground text-xs uppercase tracking-[0.3em] hover:scale-105 transition"
                >
                  Book a shoot →
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Weddings;
