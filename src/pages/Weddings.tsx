import { useEffect, useRef, useState } from "react";
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
  const [index, setIndex] = useState(0);

  const total = testimonials.length;
  const safeIndex = total ? ((index % total) + total) % total : 0;
  const prevIdx = total ? (safeIndex - 1 + total) % total : 0;
  const nextIdx = total ? (safeIndex + 1) % total : 0;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);

  const prev = () => total && setIndex((i) => i - 1);
  const next = () => total && setIndex((i) => i + 1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  useEffect(() => {
    if (total <= 1) return;
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) {
        setIndex((i) => i + 1);
      }
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, safeIndex]);



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
              <div className="text-center mb-16">
                <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-4">Reviews</div>
                <h2 className="font-display text-4xl md:text-5xl font-light">
                  In their <span className="italic text-gradient">words.</span>
                </h2>
                <div className="w-12 h-px bg-primary/30 mx-auto mt-6" />
              </div>
            </Reveal>

            {total > 0 && (
              <div
                className="max-w-7xl mx-auto"
                onMouseEnter={() => { pausedRef.current = true; }}
                onMouseLeave={() => { pausedRef.current = false; }}
              >
                <div className="relative flex items-center gap-4 md:gap-8">
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Previous review"
                    className="hidden md:flex items-center justify-center w-12 h-12 rounded-full border border-foreground/10 hover:border-primary/40 transition-colors group shrink-0"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground/40 group-hover:text-primary transition-colors" />
                  </button>

                  <div className="flex-1 flex gap-6 items-stretch overflow-hidden">
                    {/* Left peek */}
                    <div className="hidden lg:block w-1/4 opacity-40 scale-95 transition-all">
                      <figure className="bg-white/40 border border-foreground/5 p-8 h-full flex flex-col justify-between rounded-sm">
                        <p className="text-foreground text-sm leading-relaxed line-clamp-4">{testimonials[prevIdx].q}</p>
                        <figcaption className="mt-8 block text-[10px] tracking-[0.2em] uppercase font-semibold text-foreground">
                          {testimonials[prevIdx].a}
                        </figcaption>
                      </figure>
                    </div>

                    {/* Featured */}
                    <div className="flex-1 lg:w-1/2 relative">
                      <AnimatePresence mode="wait">
                        <motion.figure
                          key={safeIndex}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="bg-white shadow-[0_20px_50px_rgba(45,41,38,0.05)] border border-foreground/5 p-10 md:p-14 relative rounded-sm h-full"
                        >
                          <span
                            className="absolute top-6 left-10 text-8xl text-primary/10 select-none italic font-display leading-none pointer-events-none"
                            aria-hidden
                          >
                            “
                          </span>
                          <div className="relative z-10">
                            <blockquote className="text-foreground text-lg md:text-xl leading-relaxed italic text-center font-light">
                              {testimonials[safeIndex].q}
                            </blockquote>
                            <figcaption className="mt-12 text-center">
                              <div className="w-8 h-px bg-primary/40 mx-auto mb-4" />
                              <span className="block text-xs tracking-[0.3em] uppercase font-semibold text-foreground">
                                {testimonials[safeIndex].a}
                              </span>
                            </figcaption>
                          </div>
                        </motion.figure>
                      </AnimatePresence>
                    </div>

                    {/* Right peek */}
                    <div className="hidden lg:block w-1/4 opacity-40 scale-95 transition-all">
                      <figure className="bg-white/40 border border-foreground/5 p-8 h-full flex flex-col justify-between rounded-sm">
                        <p className="text-foreground text-sm leading-relaxed line-clamp-4">{testimonials[nextIdx].q}</p>
                        <figcaption className="mt-8 block text-[10px] tracking-[0.2em] uppercase font-semibold text-foreground">
                          {testimonials[nextIdx].a}
                        </figcaption>
                      </figure>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next review"
                    className="hidden md:flex items-center justify-center w-12 h-12 rounded-full border border-foreground/10 hover:border-primary/40 transition-colors group shrink-0"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground/40 group-hover:text-primary transition-colors" />
                  </button>
                </div>

                {/* Mobile arrows */}
                <div className="flex md:hidden justify-center gap-4 mt-8">
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Previous review"
                    className="flex items-center justify-center w-11 h-11 rounded-full border border-foreground/10"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground/60" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next review"
                    className="flex items-center justify-center w-11 h-11 rounded-full border border-foreground/10"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground/60" />
                  </button>
                </div>

                {total > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-12">
                    {testimonials.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setIndex(i)}
                        aria-label={`Go to review ${i + 1}`}
                        className={`rounded-full transition-all ${
                          i === safeIndex
                            ? "w-2.5 h-2.5 bg-primary"
                            : "w-1.5 h-1.5 bg-foreground/10 hover:bg-primary/60"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
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
