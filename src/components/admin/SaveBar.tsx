import { Button } from "@/components/ui/button";
import { Save, Check } from "lucide-react";
import { toast } from "sonner";

interface Props {
  dirty: boolean;
  saving: boolean;
  save: () => Promise<void>;
  label?: string;
}

export const SaveBar = ({ dirty, saving, save, label = "Save changes" }: Props) => {
  const handle = async () => {
    try {
      await save();
      toast.success("Saved");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save");
    }
  };
  return (
    <div className="sticky top-0 z-10 -mx-2 mb-4 flex items-center justify-between gap-3 rounded-xl bg-background/80 backdrop-blur px-3 py-2 border border-border/60">
      <div className="text-xs text-muted-foreground">
        {dirty ? "Unsaved changes" : (
          <span className="inline-flex items-center gap-1"><Check className="h-3 w-3" /> All changes saved</span>
        )}
      </div>
      <Button size="sm" onClick={handle} disabled={!dirty || saving}>
        <Save className="h-3.5 w-3.5 mr-2" /> {saving ? "Saving…" : label}
      </Button>
    </div>
  );
};
