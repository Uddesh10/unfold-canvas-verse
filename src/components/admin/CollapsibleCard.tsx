import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  header: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CollapsibleCard = ({ header, actions, children, defaultOpen = false, open: controlled, onOpenChange }: Props) => {
  const [internal, setInternal] = useState(defaultOpen);
  const open = controlled ?? internal;
  const setOpen = (v: boolean) => {
    if (controlled === undefined) setInternal(v);
    onOpenChange?.(v);
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition"
          aria-expanded={open}
        >
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-0" : "-rotate-90"}`}
          />
          <div className="flex-1 min-w-0">{header}</div>
        </button>
        {actions && <div className="flex items-center gap-1 shrink-0">{actions}</div>}
      </div>
      {open && <div className="px-4 pb-4 pt-1 border-t border-border/40">{children}</div>}
    </div>
  );
};
