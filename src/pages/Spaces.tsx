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
import { useSpacesHeroSlidesStore } from "@/hooks/useSpacesHeroSlidesStore";
import { Link } from "react-router-dom";

const Spaces = () => {
  useLenis();
  useTheme("spaces");
  const { items } = useGalleryStore("spaces");
  const { items: slides, loading } = useSpacesHeroSlidesStore();

  return (
    <div className="relative">
      <Seo title="Unfold Spaces — Interior Photography" description="Editorial interior photography for architects, designers and hospitality brands. Quiet, considered, premium." path="/spaces" />
      <CustomCursor />
      <Nav />
      <main>
        {/* Hero carousel */}
        <section className="relative pt-24">
          <PageCarousel
            slides={slides}
            loading={loading}
            heightClass="h-[80svh] min-h-[520px]"
            centerTitle={{ brand: "Unfold Spaces", tagline: "Architecture, in its quietest voice." }}
            bottomRightText={"Photography for architects, interior designers and hospitality brands.\nWe make rooms hold their breath."}
          />
        </section>

        {/* Strict grid gallery */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6">
            <Reveal>
              <div className="flex items-baseline justify-between mb-10 border-b border-border pb-4">
                <h2 className="font-light text-2xl tracking-tight">Projects</h2>
              </div>
            </Reveal>
            <Gallery items={items} variant="masonry" />
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <Reveal>
              <div className="border border-border p-12 md:p-16 grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="font-light text-3xl md:text-4xl tracking-tight">Commission a shoot.</h2>
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
