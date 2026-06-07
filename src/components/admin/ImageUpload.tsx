import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X } from "lucide-react";
import { resolveImageUrl } from "@/lib/imageUrl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  value?: string;
  onChange?: (url: string) => void;
  aspect?: string;
  label?: string;
  compact?: boolean;
  multiple?: boolean;
  onUploadMany?: (urls: string[]) => void;
}

// ~10 years in seconds — effectively permanent for a signed URL.
const SIGNED_TTL = 60 * 60 * 24 * 365 * 10;

async function uploadOne(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("gallery")
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage
    .from("gallery")
    .createSignedUrl(path, SIGNED_TTL);
  if (signErr || !data?.signedUrl) throw signErr ?? new Error("Sign failed");
  return data.signedUrl;
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
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const handleSingle = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please pick an image file");
      return;
    }
    setBusy(true);
    try {
      const url = await uploadOne(file);
      onChange?.(url);
      toast.success("Uploaded");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleMany = async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith("image/"));
    const skipped = files.length - images.length;
    if (skipped > 0) toast.warning(`Skipped ${skipped} non-image file${skipped === 1 ? "" : "s"}`);
    if (images.length === 0) return;
    setBusy(true);
    setProgress({ done: 0, total: images.length });
    let done = 0;
    const results = await Promise.allSettled(
      images.map(async (file) => {
        const url = await uploadOne(file);
        done += 1;
        setProgress({ done, total: images.length });
        return url;
      })
    );
    const urls: string[] = [];
    let failed = 0;
    for (const r of results) {
      if (r.status === "fulfilled") urls.push(r.value);
      else failed += 1;
    }
    if (urls.length > 0) onUploadMany?.(urls);
    if (failed > 0) toast.error(`${failed} upload${failed === 1 ? "" : "s"} failed`);
    if (urls.length > 0) toast.success(`Uploaded ${urls.length} image${urls.length === 1 ? "" : "s"}`);
    setBusy(false);
    setProgress(null);
  };

  const buttonLabel = busy
    ? progress
      ? `Uploading ${progress.done}/${progress.total}…`
      : "Uploading…"
    : multiple
    ? label
    : value
    ? "Replace"
    : label;

  return (
    <div className={cn("space-y-2", compact && "flex items-center gap-2 space-y-0")}>
      {!multiple && value && !compact && (
        <div className={`${aspect} relative overflow-hidden rounded-lg bg-muted`}>
          <img src={resolveImageUrl(value)} alt="" className="h-full w-full object-cover" />
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
          <img src={resolveImageUrl(value)} alt="" className="h-full w-full object-cover" />
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
