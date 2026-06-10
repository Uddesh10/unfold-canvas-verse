import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { stageFile, isPendingToken } from "@/lib/pendingUploads";
import { PhotoImg } from "@/components/PhotoImg";

interface Props {
  value?: string;
  onChange?: (token: string) => void;
  aspect?: string;
  label?: string;
  compact?: boolean;
  multiple?: boolean;
  onUploadMany?: (tokens: string[]) => void;
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
  const handleSingle = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please pick an image file");
      return;
    }
    const token = stageFile(file);
    onChange?.(token);
  };

  const handleMany = (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith("image/"));
    const skipped = files.length - images.length;
    if (skipped > 0) toast.warning(`Skipped ${skipped} non-image file${skipped === 1 ? "" : "s"}`);
    if (images.length === 0) return;
    const tokens = images.map((f) => stageFile(f));
    onUploadMany?.(tokens);
    toast.message(`${tokens.length} photo${tokens.length === 1 ? "" : "s"} staged — click Save to upload`);
  };

  const pending = !!value && isPendingToken(value);
  const buttonLabel = multiple ? label : value ? "Replace" : label;

  return (
    <div className={cn("space-y-2", compact && "flex items-center gap-2 space-y-0")}>
      {!multiple && value && !compact && (
        <div className={`${aspect} relative overflow-hidden rounded-lg bg-muted`}>
          <PhotoImg photo={value} variant="grid" alt="" className="h-full w-full object-cover" />
          {pending && (
            <div className="absolute bottom-2 left-2 text-[10px] uppercase tracking-wider bg-background/80 px-2 py-0.5 rounded">
              Pending
            </div>
          )}
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
        <div className="h-10 w-10 shrink-0 rounded overflow-hidden bg-muted relative">
          <PhotoImg photo={value} variant="thumb" alt="" className="h-full w-full object-cover" />
          {pending && (
            <div className="absolute inset-0 ring-1 ring-primary/60 rounded pointer-events-none" />
          )}
        </div>
      )}
      <label
        className={cn(
          "inline-flex items-center gap-2 px-3 h-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm cursor-pointer transition-colors"
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
