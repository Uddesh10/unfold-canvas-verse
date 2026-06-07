import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X } from "lucide-react";
import { resolveImageUrl } from "@/lib/imageUrl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  value?: string;
  onChange: (url: string) => void;
  aspect?: string;
  label?: string;
  compact?: boolean;
}

// ~10 years in seconds — effectively permanent for a signed URL.
const SIGNED_TTL = 60 * 60 * 24 * 365 * 10;

export const ImageUpload = ({
  value,
  onChange,
  aspect = "aspect-[4/5]",
  label = "Upload image",
  compact = false,
}: Props) => {
  const [busy, setBusy] = useState(false);

  const handle = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please pick an image file");
      return;
    }
    setBusy(true);
    try {
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
      onChange(data.signedUrl);
      toast.success("Uploaded");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn("space-y-2", compact && "flex items-center gap-2 space-y-0")}>
      {value && !compact && (
        <div className={`${aspect} relative overflow-hidden rounded-lg bg-muted`}>
          <img src={resolveImageUrl(value)} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-background/80 rounded-full p-1 hover:bg-background"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {value && compact && (
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
        {busy ? "Uploading…" : value ? "Replace" : label}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handle(f);
            e.target.value = "";
          }}
        />
      </label>
      {value && compact && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-muted-foreground hover:text-foreground p-1"
          aria-label="Remove image"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
