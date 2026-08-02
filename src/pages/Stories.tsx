import { useLenis } from "@/hooks/useLenis";
import { useTheme } from "@/hooks/useTheme";
import { Seo } from "@/components/Seo";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CustomCursor } from "@/components/CustomCursor";
import { Reveal } from "@/components/Reveal";
import { Gallery } from "@/components/Gallery";
import { PageCarousel } from "@/components/PageCarousel";
import { useGalleryStore } from "@/hooks/useGalleryStore";
import { useStoriesHeroSlidesStore } from "@/hooks/useStoriesHeroSlidesStore";
import { useStoriesVideosStore } from "@/hooks/useStoriesVideosStore";
import { Link } from "react-router-dom";

const Stories = () => {
  useLenis();
  useTheme("stories");
  const { items } = useGalleryStore("stories");
  const { items: slides, loading } = useStoriesHeroSlidesStore();
  const { value: videos } = useStoriesVideosStore();

  return (
    <div className="relative">
      <Seo title="Unfold Stories — Street Photography" description="Documentary street photography. Raw, neon, unposed. Editorial commissions and prints." path="/stories" />
      <CustomCursor />
      <Nav />
      <main className="grain relative">
        {/* Hero carousel */}
        <section className="relative">
          <PageCarousel
            slides={slides}
            loading={loading}
            heightClass="h-[100svh] min-h-[520px]"
            centerTitle={{ brand: "Unfold Stories", tagline: "THE CITY,\nUNPOSED." }}
          />

        </section>

        {/* Videos */}
        {videos && videos.length > 0 && (
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-6">
              <Reveal>
                <div className="mb-8 flex items-baseline justify-between">
                  <h2 className="font-bold-display text-3xl md:text-4xl">FILMS</h2>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {videos.length} {videos.length === 1 ? "film" : "films"}
                  </span>
                </div>
              </Reveal>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.filter(Boolean).map((v, i) => (
                  <div key={i} className="aspect-video rounded-xl overflow-hidden bg-black">
                    <iframe
                      src={v}
                      title={`Film ${i + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gallery */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <Reveal>
              <div className="mb-8 flex items-baseline justify-between">
                <h2 className="font-bold-display text-3xl md:text-4xl">FRAMES</h2>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {items.length} {items.length === 1 ? "frame" : "frames"}
                </span>
              </div>
            </Reveal>
            <Gallery items={items} variant="masonry" />
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
