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
import { Link, useLocation } from "react-router-dom";
import { verticals } from "@/data/themes";
import { cn } from "@/lib/utils";

const PerspectiveBar = () => {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Studios"
      className="border-y border-border/40 bg-background/40 backdrop-blur-sm"
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-center">
        <div className="flex items-center gap-1 glass rounded-full px-2 py-1.5">
          {verticals.map((v) => {
            const active = pathname === v.path;
            return (
              <Link
                key={v.key}
                to={v.path}
                className={cn(
                  "px-4 py-1.5 text-xs uppercase tracking-[0.2em] rounded-full transition-all",
                  active
                    ? "bg-foreground text-background"
                    : "text-foreground/70 hover:text-foreground"
                )}
              >
                {v.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

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
        <PerspectiveBar />
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
