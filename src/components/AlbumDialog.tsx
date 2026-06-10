import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import type { GalleryItem } from "@/data/galleries";
import { resolveImageUrl } from "@/lib/imageUrl";
import { Lightbox, useLightbox } from "@/components/Lightbox";

interface Props {
  item: GalleryItem | null;
  onClose: () => void;
}

export const AlbumDialog = ({ item, onClose }: Props) => {
  const open = !!item;
  const pushedRef = useRef(false);
  const lightbox = useLightbox();

  const photoUrls = useMemo(
    () => (item ? (item.photos && item.photos.length > 0 ? item.photos : [item.src]) : []),
    [item],
  );
  const lightboxItems: GalleryItem[] = useMemo(
    () =>
      photoUrls.map((p, i) => ({
        src: p,
        alt: item ? `${item.alt} — ${i + 1}` : "",
      })),
    [photoUrls, item],
  );

  // Browser back closes the album (all verticals).
  useEffect(() => {
    if (!open) return;
    pushedRef.current = true;
    window.history.pushState({ album: true }, "");
    const onPop = () => {
      pushedRef.current = false;
      onClose();
    };
    window.addEventListener("popstate", onPop);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      // If we still own a pushed history entry (close came from UI, not popstate), pop it.
      if (pushedRef.current) {
        pushedRef.current = false;
        window.history.back();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => onClose();

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          className="fixed inset-0 z-[90] overflow-y-auto overscroll-contain bg-background/95 backdrop-blur-xl"
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <button
            aria-label="Close"
            onClick={handleClose}
            className="fixed top-6 right-6 z-[91] glass rounded-full p-3 hover:glow transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className="w-full max-w-[1600px] mx-auto px-4 md:px-6 py-10 md:py-14"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {item.client && (
                <div className="text-xs uppercase tracking-[0.4em] text-primary mb-3">
                  {item.caption ?? "Album"}
                </div>
              )}
              <h2 className="font-display text-4xl md:text-6xl italic text-gradient mb-10">
                {item.client ?? item.alt}
              </h2>

              {/* 1. Feedback / review */}
              {item.feedback && (
                <figure className="mb-10 glass rounded-3xl p-8 md:p-10">
                  <span className="font-display text-5xl text-gradient leading-none">"</span>
                  <blockquote className="mt-2 text-lg md:text-xl italic leading-relaxed">
                    {item.feedback}
                  </blockquote>
                  {item.client && (
                    <figcaption className="mt-6 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      — {item.client}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* 2. Videos */}
              {item.videos && item.videos.length > 0 && (
                <div className="mb-10">
                  <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-4">
                    Films
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {item.videos.map((v, i) => (
                      <div key={i} className="aspect-video rounded-2xl overflow-hidden bg-black">
                        <iframe
                          src={v}
                          title={`Film ${i + 1}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Photos */}
              <div>
                <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-4">
                  Photographs
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(item.photos && item.photos.length > 0 ? item.photos : [item.src]).map((p, i) => (
                    <motion.img
                      key={i}
                      src={resolveImageUrl(p)}
                      alt={`${item.alt} — ${i + 1}`}
                      loading="lazy"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.5 }}
                      className="w-full h-auto rounded-2xl object-cover"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
