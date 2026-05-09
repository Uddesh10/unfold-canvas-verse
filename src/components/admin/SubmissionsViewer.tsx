import { useSubmissionsStore } from "@/hooks/useSubmissionsStore";
import { Button } from "@/components/ui/button";
import { Trash2, Mail, Phone, Calendar, Tag } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export const SubmissionsViewer = () => {
  const { items, remove, clear } = useSubmissionsStore();

  if (items.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center text-muted-foreground text-sm">
        No submissions yet. When visitors send the booking form, they'll appear here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{items.length} submission{items.length === 1 ? "" : "s"}</div>
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

      <div className="space-y-3">
        {items.map((s) => (
          <div key={s.id} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <div className="font-display text-lg">{s.name}</div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    {new Date(s.createdAt).toLocaleString()}
                  </div>
                </div>
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
              <Button variant="ghost" size="icon" onClick={() => remove(s.id)} aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
