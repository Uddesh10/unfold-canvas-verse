import { forwardRef, useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { parsePhoto, photoUrl, ensureCdnBase, type Variant } from "@/lib/photoModel";
import { resolveImageUrl } from "@/lib/imageUrl";
import { isPendingToken, getPendingPreview } from "@/lib/pendingUploads";

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  photo: string;
  variant: Variant;
  pictureClassName?: string;
  /** When true, skip IntersectionObserver gating (useful for hero/above-fold images). */
  eager?: boolean;
}

// Pre-warm CDN base at module load so the first viewport-visible image
// doesn't pay the round-trip cost.
ensureCdnBase().catch(() => {});

const RETRY_DELAYS_MS = [1500, 3000, 5000];

export const PhotoImg = forwardRef<HTMLImageElement, Props>(
  ({ photo, variant, pictureClassName: _pictureClassName, loading = "lazy", decoding = "async", eager, onError, ...imgProps }, ref) => {
    const [resolved, setResolved] = useState<string>("");
    const [retry, setRetry] = useState(0);
    const localRef = useRef<HTMLImageElement | null>(null);

    const pendingPreview = isPendingToken(photo) ? getPendingPreview(photo) ?? "" : null;
    const parsed = pendingPreview === null ? parsePhoto(photo) : null;
    const legacyUrl = parsed?.kind === "legacy" ? resolveImageUrl(parsed.url) : null;
    const needsResolve = parsed?.kind === "v2" || parsed?.kind === "v3";

    // IntersectionObserver gate: only fetch/sign URL once the img is near the viewport.
    const [inView, setInView] = useState<boolean>(!!eager);
    useEffect(() => {
      if (eager || inView) return;
      const el = localRef.current;
      if (!el || typeof IntersectionObserver === "undefined") {
        setInView(true);
        return;
      }
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              setInView(true);
              io.disconnect();
              break;
            }
          }
        },
        { rootMargin: "200px" }
      );
      io.observe(el);
      return () => io.disconnect();
    }, [eager, inView]);

    useEffect(() => {
      if (!needsResolve || !inView) return;
      let cancelled = false;
      photoUrl(photo, variant)
        .then((url) => { if (!cancelled) setResolved(url); })
        .catch(() => { if (!cancelled) setResolved(""); });
      return () => { cancelled = true; };
    }, [photo, variant, needsResolve, inView, retry]);

    // Retry on error a few times (Lambda may still be encoding right after upload).
    const handleError: React.ReactEventHandler<HTMLImageElement> = (e) => {
      if (needsResolve && retry < RETRY_DELAYS_MS.length) {
        const delay = RETRY_DELAYS_MS[retry];
        window.setTimeout(() => setRetry((r) => r + 1), delay);
      }
      onError?.(e);
    };

    const src = pendingPreview ?? legacyUrl ?? resolved;

    const setRef = (node: HTMLImageElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLImageElement | null>).current = node;
    };

    return (
      <img
        ref={setRef}
        src={src || undefined}
        loading={loading}
        decoding={decoding}
        onError={handleError}
        {...imgProps}
      />
    );
  }
);
PhotoImg.displayName = "PhotoImg";
