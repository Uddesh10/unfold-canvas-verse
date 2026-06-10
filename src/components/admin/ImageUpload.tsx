import { useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { processAndUploadSerialized, type UploadProgress } from "@/lib/imagePipeline";
import { PhotoImg } from "@/components/PhotoImg";

interface Props {
  value?: string;
  onChange?: (url: string) => void;
  aspect?: string;
  label?: string;
  compact?: boolean;
  multiple?: boolean;
  onUploadMany?: (urls: string[]) => void;
}

export const ImageUpload = ({
  value,
  onChange,
  aspect = "aspect-[4/5]",
  label = "Upload image",
  compact = false,
  multiple = false,
  onUploadMany,
}: Props) => {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; stage: UploadProgress["stage"] } | null>(null);
  const [batch, setBatch] = useState<{ done: number; total: number } | null>(null);

  const handleSingle = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please pick an image file");
      return;
    }
    setBusy(true);
    try {
      const json = await processAndUploadSerialized(file, (p) => setProgress(p));
      onChange?.(json);
      toast.success("Uploaded");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      toast.error(msg);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const handleMany = async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith("image/"));
    const skipped = files.length - images.length;
    if (skipped > 0) toast.warning(`Skipped ${skipped} non-image file${skipped === 1 ? "" : "s"}`);
    if (images.length === 0) return;
    setBusy(true);
    setBatch({ done: 0, total: images.length });
    // Process serially — each photo's WASM encode is already CPU-heavy.
    const urls: string[] = [];
    let failed = 0;
    for (let i = 0; i < images.length; i++) {
      try {
        const json = await processAndUploadSerialized(images[i], (p) => setProgress(p));
        urls.push(json);
      } catch (e) {
        failed += 1;
        console.error("Upload failed", e);
      }
      setBatch({ done: i + 1, total: images.length });
    }
    if (urls.length > 0) onUploadMany?.(urls);
    if (failed > 0) toast.error(`${failed} upload${failed === 1 ? "" : "s"} failed`);
    if (urls.length > 0) toast.success(`Uploaded ${urls.length} image${urls.length === 1 ? "" : "s"}`);
    setBusy(false);
    setProgress(null);
    setBatch(null);
  };

  const stageLabel = progress
    ? progress.stage === "decode"
      ? "Reading…"
      : progress.stage === "encode"
      ? "Compressing…"
      : progress.stage === "upload"
      ? "Uploading…"
      : "Finishing…"
    : "Working…";

  const buttonLabel = busy
    ? batch
      ? `${stageLabel} ${batch.done}/${batch.total}`
      : stageLabel
    : multiple
    ? label
    : value
    ? "Replace"
    : label;

  return (
    <div className={cn("space-y-2", compact && "flex items-center gap-2 space-y-0")}>
      {!multiple && value && !compact && (
        <div className={`${aspect} relative overflow-hidden rounded-lg bg-muted`}>
          <PhotoImg photo={value} variant="grid" alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange?.("")}
            className="absolute top-2 right-2 bg-background/80 rounded-full p-1 hover:bg-background"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {!multiple && value && compact && (
        <div className="h-10 w-10 shrink-0 rounded overflow-hidden bg-muted">
          <PhotoImg photo={value} variant="thumb" alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <label
        className={cn(
          "inline-flex items-center gap-2 px-3 h-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm cursor-pointer transition-colors",
          busy && "opacity-50 pointer-events-none"
        )}
      >
        <Upload className="h-3.5 w-3.5" />
        {buttonLabel}
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length > 0) {
              if (multiple) handleMany(files);
              else handleSingle(files[0]);
            }
            e.target.value = "";
          }}
        />
      </label>
      {!multiple && value && compact && (
        <button
          type="button"
          onClick={() => onChange?.("")}
          className="text-muted-foreground hover:text-foreground p-1"
          aria-label="Remove image"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
