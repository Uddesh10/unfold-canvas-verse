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
import { Photographer } from "@/components/sections/Photographer";
import { Showcase } from "@/components/sections/Showcase";

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
        <Photographer />
        <Showcase />
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
