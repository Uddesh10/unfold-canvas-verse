import { useLenis } from "@/hooks/useLenis";
import { useTheme } from "@/hooks/useTheme";
import { Seo } from "@/components/Seo";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Process } from "@/components/sections/Process";
import { Faq } from "@/components/sections/Faq";
import { Booking } from "@/components/sections/Booking";
import { Photographer } from "@/components/sections/Photographer";

const Index = () => {
  useLenis();
  useTheme("default");

  return (
    <div className="relative">
      <Seo
        title="Unfold Studios — Cinematic photography in three perspectives"
        description="A photography house of three studios — Weddings, Architecture and Street — built on quiet observation and luxurious craft."
        path="/"
      />
      <Nav />
      <main>
        <Hero />
        <About />
        <Process />
        <Booking />
        <Faq />
        <Photographer />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
