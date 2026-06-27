import type { ReactNode } from "react";

export const StickyAdminHeader = ({ children }: { children: ReactNode }) => (
  <div className="sticky top-0 z-30 -mx-2 px-2 py-3 bg-background/95 backdrop-blur border-b border-border/60 space-y-3">
    {children}
  </div>
);
