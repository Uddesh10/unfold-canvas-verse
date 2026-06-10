import { useState } from "react";
import { useSubmissionsStore } from "@/hooks/useSubmissionsStore";
import { Button } from "@/components/ui/button";
import { Trash2, Mail, Phone, Calendar, Tag } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { CollapsibleCard } from "@/components/admin/CollapsibleCard";

export const SubmissionsViewer = () => {
  const { items, remove, clear } = useSubmissionsStore();
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const setOpen = (id: string, v: boolean) => setOpenMap((m) => ({ ...m, [id]: v }));
  const expandAll = () => setOpenMap(Object.fromEntries(items.map((s) => [s.id, true])));
  const collapseAll = () => setOpenMap({});

  if (items.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center text-muted-foreground text-sm">
        No submissions yet. When visitors send the booking form, they'll appear here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-sm text-muted-foreground">{items.length} submission{items.length === 1 ? "" : "s"}</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>Expand all</Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>Collapse all</Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm("Delete all submissions?")) {
                clear();
                toast({ title: "All submissions cleared" });
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5 mr-2" /> Clear all
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((s) => (
          <CollapsibleCard
            key={s.id}
            open={!!openMap[s.id]}
            onOpenChange={(v) => setOpen(s.id, v)}
            header={
              <div className="min-w-0">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <div className="text-sm font-medium truncate">{s.name}</div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    {new Date(s.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground truncate">{s.category} · {s.email}</div>
              </div>
            }
            actions={
              <Button variant="ghost" size="icon" onClick={() => remove(s.id)} aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            }
          >
            <div className="space-y-3 pt-3">
              <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> <a href={`mailto:${s.email}`} className="hover:text-foreground">{s.email}</a></div>
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> <a href={`tel:${s.phone}`} className="hover:text-foreground">{s.phone}</a></div>
                <div className="flex items-center gap-2"><Tag className="h-3.5 w-3.5" /> {s.category}</div>
                <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> {s.date}</div>
              </div>
              {s.message && (
                <p className="text-sm pt-2 border-t border-border/40 whitespace-pre-wrap">{s.message}</p>
              )}
            </div>
          </CollapsibleCard>
        ))}
      </div>
    </div>
  );
};
