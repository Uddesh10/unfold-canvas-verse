import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      // wait a tick for sections to mount
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.scrollTo({ top: 0, left: 0 });
      }, 80);
      return;
    }
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname, hash]);
  return null;
};

export default ScrollToTop;
