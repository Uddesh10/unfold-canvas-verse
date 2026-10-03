import { Link, useLocation } from "react-router-dom";
import { verticals } from "@/data/themes";
import { cn } from "@/lib/utils";

export const StudioRail = () => {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Photography studios"
      className="studio-rail flex items-center gap-1 p-1.5"
    >
      {verticals.map((vertical) => {
        const active = pathname === vertical.path;
        return (
          <Link
            key={vertical.key}
            to={vertical.path}
            aria-current={active ? "page" : undefined}
            className={cn(
              "studio-rail-link min-w-0 px-3 py-2 text-center text-[10px] font-medium uppercase transition-colors md:px-5 md:text-xs",
              active ? "studio-rail-link-active" : "text-carousel-foreground/70 hover:text-carousel-foreground",
            )}
          >
            {vertical.label}
          </Link>
        );
      })}
    </nav>
  );
};