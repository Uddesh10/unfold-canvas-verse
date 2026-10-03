import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { StudioRail } from "@/components/StudioRail";

export const Nav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const handleBook = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === "/") {
      document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/#book");
    }
  };
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="container mx-auto grid grid-cols-2 items-center gap-y-3 px-5 py-4 md:grid-cols-[1fr_auto_1fr] md:px-6 md:py-5">
        <Link to="/" className="group flex items-center gap-2" aria-label="Unfold Studios — home">
          <span className="text-base font-display font-medium tracking-[0.25em] uppercase">
            Unfold
          </span>
          <span className="h-1 w-1 rounded-full bg-foreground/60 group-hover:bg-primary transition-colors" />
        </Link>

        <div className="order-3 col-span-2 mx-auto md:order-none md:col-span-1">
          <StudioRail />
        </div>

        <a
          href="/#book"
          onClick={handleBook}
          className="justify-self-end text-xs uppercase tracking-[0.2em] glass rounded-full px-4 py-2 hover:glow transition-all cursor-pointer"
        >
          Book
        </a>
      </div>
    </motion.header>
  );
};
