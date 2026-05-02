import { useEffect } from "react";
import type { ThemeKey } from "@/data/themes";

export function useTheme(theme: ThemeKey) {
  useEffect(() => {
    const html = document.documentElement;
    if (theme === "default") html.removeAttribute("data-theme");
    else html.setAttribute("data-theme", theme);
    return () => {
      html.removeAttribute("data-theme");
    };
  }, [theme]);
}
