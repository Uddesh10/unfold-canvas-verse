import { Link } from "react-router-dom";
import { Mail, Instagram, MapPin } from "lucide-react";
import { verticals } from "@/data/themes";
import { usePhotographerStore } from "@/hooks/usePhotographerStore";

export const Footer = () => {
  const { value: p } = usePhotographerStore();
  return (
    <footer className="relative border-t border-border/40 mt-24">
      <div className="container mx-auto px-6 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="font-display text-2xl tracking-[0.2em] uppercase">Unfold Studios</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Verticals</div>
          <ul className="space-y-2 text-sm">
            {verticals.map((v) => (
              <li key={v.key}>
                <Link to={v.path} className="hover:text-primary transition-colors">{v.brand}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Studio</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/#about" className="hover:text-primary transition-colors">About</Link></li>
            <li><Link to="/#process" className="hover:text-primary transition-colors">Process</Link></li>
            <li><Link to="/#faq" className="hover:text-primary transition-colors">FAQ</Link></li>
            <li><Link to="/#book" className="hover:text-primary transition-colors">Book a shoot</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Contact</div>
          <ul className="space-y-2 text-sm">
            <li>
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {p.location}
              </span>
            </li>
            <li>
              <a href={`mailto:${p.email}`} className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-3.5 w-3.5" /> {p.email}
              </a>
            </li>
            <li>
              <a href={p.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                <Instagram className="h-3.5 w-3.5" /> Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40">
        <div className="container mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Unfold Studios. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to="/admin/login" className="hover:text-primary transition-colors uppercase tracking-[0.25em]">
              Admin
            </Link>
            <span className="font-mono">Made for moments that matter.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
