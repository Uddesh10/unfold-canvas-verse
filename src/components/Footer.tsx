import { Link } from "react-router-dom";
import { Mail, Instagram, MapPin } from "lucide-react";
import { verticals } from "@/data/themes";
import { usePhotographerStore } from "@/hooks/usePhotographerStore";

export const Footer = () => {
  const { value: p } = usePhotographerStore();
  return (
    <footer className="editorial-footer relative mt-20 border-t border-footer-foreground/15 text-footer-foreground md:mt-24">
      <div className="container mx-auto grid gap-10 px-6 py-14 md:grid-cols-12 md:gap-8 md:py-20">
        <div className="border-b border-footer-foreground/15 pb-9 md:col-span-5 md:border-b-0 md:pb-0">
          <div className="font-display text-4xl leading-none md:text-5xl">
            Unfold <span className="italic text-footer-accent">Studios</span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-footer-foreground/55">
            Wedding, architectural and documentary photography shaped by light, place and honest moments.
          </p>
          <Link to="/#book" className="mt-8 inline-flex items-center gap-3 text-xs uppercase text-footer-foreground transition-colors hover:text-footer-accent">
            Book a commission <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="md:col-span-2">
          <div className="mb-5 text-[10px] uppercase text-footer-foreground/35">Studios</div>
          <ul className="space-y-3 text-sm">
            {verticals.map((v) => (
              <li key={v.key}>
                <Link to={v.path} className="transition-colors hover:text-footer-accent">{v.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <div className="mb-5 text-[10px] uppercase text-footer-foreground/35">Explore</div>
          <ul className="space-y-3 text-sm">
            <li><Link to="/#about" className="transition-colors hover:text-footer-accent">About</Link></li>
            <li><Link to="/#process" className="transition-colors hover:text-footer-accent">Process</Link></li>
            <li><Link to="/#faq" className="transition-colors hover:text-footer-accent">Questions</Link></li>
            <li><Link to="/#book" className="transition-colors hover:text-footer-accent">Book a shoot</Link></li>
          </ul>
        </div>
        <div className="md:col-span-3 md:text-right">
          <div className="mb-5 text-[10px] uppercase text-footer-foreground/35">Contact</div>
          <ul className="space-y-3 text-sm md:flex md:flex-col md:items-end">
            <li>
              <span className="inline-flex items-center gap-2 text-footer-foreground/55">
                <MapPin className="h-3.5 w-3.5" /> {p.location}
              </span>
            </li>
            <li>
              <a href={`mailto:${p.email}`} className="inline-flex items-center gap-2 transition-colors hover:text-footer-accent">
                <Mail className="h-3.5 w-3.5" /> {p.email}
              </a>
            </li>
            <li>
              <a href={p.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-footer-accent">
                <Instagram className="h-3.5 w-3.5" /> Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-footer-foreground/15">
        <div className="container mx-auto flex flex-col items-start justify-between gap-4 px-6 py-6 text-[10px] uppercase text-footer-foreground/35 md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} Unfold Studios. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to="/admin/login" className="transition-colors hover:text-footer-accent">
              Admin
            </Link>
            <span>Made for moments that matter.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
