import { useEffect, useState } from "react";
import { useLenis } from "@/hooks/useLenis";
import { useTheme } from "@/hooks/useTheme";
import { Seo } from "@/components/Seo";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { Gallery } from "@/components/Gallery";
import { useGalleryStore } from "@/hooks/useGalleryStore";
import { useWeddingTestimonialsStore } from "@/hooks/useTestimonialsStore";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { resolveImageUrl } from "@/lib/imageUrl";

const Weddings = () => {
  useLenis();
  useTheme("weddings");
  const { items } = useGalleryStore("weddings");
  const { items: testimonials } = useWeddingTestimonialsStore();

  // Hero carousel — cycles through wedding gallery covers
  const heroSlides = items.length > 0
    ? items.map((it) => ({ src: it.src, label: it.client ?? it.caption ?? "Wedding" }))
    : [{ src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=2200&q=85", label: "Wedding" }];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (heroSlides.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, [heroSlides.length]);

  return (
    <div className="relative">
      <Seo title="Unfold Studios — Wedding Photography" description="Romantic, cinematic wedding photography. Editorial coverage, fine-art delivery, worldwide." path="/weddings" />
      <Nav />
      <main>
        {/* Hero carousel */}
        <section className="relative h-[92svh] min-h-[600px] overflow-hidden">
          <AnimatePresence mode="sync">
            <motion.img
              key={i}
              src={resolveImageUrl(heroSlides[i].src)}
              alt={heroSlides[i].label}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/10 to-background" />
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

          {/* carousel dots */}
          <div className="absolute bottom-8 right-8 flex gap-2 z-10">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1 rounded-full transition-all ${idx === i ? "w-10 bg-primary" : "w-5 bg-foreground/30"}`}
              />
            ))}
          </div>
        </section>

        {/* Photo grid */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-6">
            <Gallery items={items} variant="masonry" />
          </div>
        </section>

        {/* Reviews / testimonials */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-6">
            <Reveal>
              <div className="text-center mb-12">
                <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-4">Reviews</div>
                <h2 className="font-display text-4xl md:text-5xl">
                  In their <span className="italic text-gradient">words.</span>
                </h2>
              </div>
            </Reveal>
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

        {/* CTA — Begin your wedding story */}
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
