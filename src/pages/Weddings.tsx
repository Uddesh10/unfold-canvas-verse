import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

const Weddings = () => {
  useLenis();
  useTheme("weddings");
  const { items } = useGalleryStore("weddings");
  const { items: testimonials } = useWeddingTestimonialsStore();
  const [page, setPage] = useState(0);
  const [perView, setPerView] = useState(typeof window !== "undefined" && window.innerWidth >= 768 ? 3 : 1);

  useEffect(() => {
    const onResize = () => setPerView(window.innerWidth >= 768 ? 3 : 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const total = testimonials.length;
  const pages = Math.max(1, total - perView + 1);
  const safePage = Math.min(page, pages - 1);
  const visible = total > 0 ? testimonials.slice(safePage, safePage + perView) : [];
  const prev = () => setPage((p) => (p - 1 + pages) % pages);
  const next = () => setPage((p) => (p + 1) % pages);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pages]);


  return (
    <div className="relative">
      <Seo title="Unfold Studios — Wedding Photography" description="Romantic, cinematic wedding photography. Editorial coverage, fine-art delivery, worldwide." path="/weddings" />
      <Nav />
      <main className="pt-28 md:pt-32">
        {/* Photo grid */}
        <section className="py-10 md:py-14">
          <div className="container mx-auto px-6">
            <Reveal>
              <div className="mb-10 text-center">
                <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-3">Unfold Studios</div>
                <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">
                  Where vows become <span className="italic text-gradient">forever.</span>
                </h1>
              </div>
            </Reveal>
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
