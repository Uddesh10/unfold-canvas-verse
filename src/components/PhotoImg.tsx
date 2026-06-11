import { forwardRef, useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { parsePhoto, photoUrl, photoOriginalUrl, type Variant } from "@/lib/photoModel";
import { resolveImageUrl } from "@/lib/imageUrl";
import { isPendingToken, getPendingPreview } from "@/lib/pendingUploads";

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  photo: string;
  variant: Variant;
  pictureClassName?: string;
}

export const PhotoImg = forwardRef<HTMLImageElement, Props>(
  ({ photo, variant, pictureClassName: _pictureClassName, loading = "lazy", decoding = "async", onError, ...imgProps }, ref) => {
    const [resolved, setResolved] = useState<string>("");
    const triedFallback = useRef(false);

    const pendingPreview = isPendingToken(photo) ? getPendingPreview(photo) ?? "" : null;
    const parsed = pendingPreview === null ? parsePhoto(photo) : null;
    const legacyUrl = parsed?.kind === "legacy" ? resolveImageUrl(parsed.url) : null;
    const v2 = parsed?.kind === "v2" ? parsed.photo : null;

    useEffect(() => {
      if (!v2) return;
      let cancelled = false;
      triedFallback.current = false;
      photoUrl(photo, variant)
        .then((url) => { if (!cancelled) setResolved(url); })
        .catch(() => { if (!cancelled) setResolved(""); });
      return () => { cancelled = true; };
    }, [photo, variant, v2]);

    const src = pendingPreview ?? legacyUrl ?? resolved;

    return (
      <img
        ref={ref}
        src={src}
        loading={loading}
        decoding={decoding}
        onError={(e) => {
          if (v2 && !triedFallback.current) {
            triedFallback.current = true;
            photoOriginalUrl(photo).then((url) => setResolved(url)).catch(() => {});
            return;
          }
          onError?.(e);
        }}
        {...imgProps}
      />
    );
  }
);
PhotoImg.displayName = "PhotoImg";
