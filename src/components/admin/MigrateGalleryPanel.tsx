import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type BatchResult = {
  totalListed: number;
  offset: number;
  limit: number;
  processed: number;
  migrated: number;
  skipped: number;
  failed: { id: string; reason: string }[];
  done: boolean;
};

export const MigrateGalleryPanel = () => {
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [totals, setTotals] = useState({ migrated: 0, skipped: 0, failed: 0 });

  const run = async () => {
    setRunning(true);
    setLog([]);
    setTotals({ migrated: 0, skipped: 0, failed: 0 });
    const toastId = toast.loading("Starting migration…");
    try {
      let offset = 0;
      const limit = 20;
      let totalListed = 0;
      let migrated = 0, skipped = 0;
      const failed: { id: string; reason: string }[] = [];
      while (true) {
        const { data, error } = await supabase.functions.invoke("migrate-gallery", {
          body: { offset, limit },
        });
        if (error) throw error;
        const r = data as BatchResult;
        totalListed = r.totalListed;
        migrated += r.migrated;
        skipped += r.skipped;
        failed.push(...r.failed);
        setTotals({ migrated, skipped, failed: failed.length });
        setLog((l) => [...l, `Batch ${offset}-${offset + r.processed} of ${totalListed}: +${r.migrated} migrated, +${r.skipped} skipped, +${r.failed.length} failed`]);
        toast.loading(`Migrating ${Math.min(offset + r.processed, totalListed)}/${totalListed}…`, { id: toastId });
        if (r.done || r.processed === 0) break;
        offset += r.processed;
      }
      toast.success(`Done. ${migrated} migrated, ${skipped} skipped, ${failed.length} failed`, { id: toastId });
      if (failed.length > 0) setLog((l) => [...l, "Failed:", ...failed.map((f) => `  ${f.id} — ${f.reason}`)]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Migration failed", { id: toastId });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-display text-xl">Migrate gallery to S3</h3>
        <p className="text-sm text-muted-foreground">
          One-shot: copies originals from Lovable Cloud Storage to S3 so AWS Lambda regenerates
          variants. Idempotent — safe to re-run.
        </p>
      </div>
      <Button onClick={run} disabled={running}>
        {running ? "Migrating…" : "Run migration"}
      </Button>
      {(totals.migrated || totals.skipped || totals.failed) > 0 && (
        <div className="text-sm">
          Migrated: <strong>{totals.migrated}</strong> · Skipped: <strong>{totals.skipped}</strong> · Failed: <strong>{totals.failed}</strong>
        </div>
      )}
      {log.length > 0 && (
        <pre className="text-xs bg-muted/40 p-3 rounded max-h-96 overflow-auto whitespace-pre-wrap">
          {log.join("\n")}
        </pre>
      )}
    </div>
  );
};
