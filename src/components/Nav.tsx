import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { verticals } from "@/data/themes";
import { cn } from "@/lib/utils";

export const Nav = () => {
  const { pathname } = useLocation();
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-5">
        <Link to="/" className="group flex items-center gap-2" aria-label="Unfold Studios — home">
          <span className="text-base font-display font-medium tracking-[0.25em] uppercase">
            Unfold
          </span>
          <span className="h-1 w-1 rounded-full bg-foreground/60 group-hover:bg-primary transition-colors" />
        </Link>

        <nav className="hidden md:flex items-center gap-1 glass rounded-full px-2 py-1.5">
          {verticals.map((v) => {
            const active = pathname === v.path;
            return (
              <Link
                key={v.key}
                to={v.path}
                className={cn(
                  "px-4 py-1.5 text-xs uppercase tracking-[0.2em] rounded-full transition-all",
                  active ? "bg-foreground text-background" : "text-foreground/70 hover:text-foreground"
                )}
              >
                {v.label}
              </Link>
            );
          })}
        </nav>

        <Link
          to="/#book"
          className="text-xs uppercase tracking-[0.2em] glass rounded-full px-4 py-2 hover:glow transition-all"
        >
          Book
        </Link>
      </div>
    </motion.header>
  );
};
