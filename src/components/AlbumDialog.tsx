import { AnimatePresence, motion } from "framer-motion";
import { X, Calendar } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GalleryItem } from "@/data/galleries";
import { PhotoImg } from "@/components/PhotoImg";
import { Lightbox, useLightbox } from "@/components/Lightbox";

interface Props {
  item: GalleryItem | null;
  onClose: () => void;
}

const PAGE = 24;

const AlbumTile = ({ photo, alt, onClick }: { photo: string; alt: string; onClick: () => void }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      onClick={onClick}
      className="mb-3 break-inside-avoid inline-block w-full cursor-zoom-in hover:opacity-90 transition rounded-2xl overflow-hidden bg-muted relative"
    >
      {!loaded && (
        <div className="w-full animate-pulse bg-muted/70" style={{ aspectRatio: "4 / 5" }} />
      )}
      <PhotoImg
        photo={photo}
        variant="grid"
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`block w-full h-auto object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0 absolute inset-0"}`}
      />
    </div>
  );
};

export const AlbumDialog = ({ item, onClose }: Props) => {
  const open = !!item;
  const pushedRef = useRef(false);
  const lightbox = useLightbox();
  const [visible, setVisible] = useState(PAGE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const photoUrls = useMemo(
    () => {
      if (!item) return [];
      const hidden = item.hiddenPhotos ?? [];
      const all = item.photos && item.photos.length > 0 ? item.photos : [item.src];
      return all.filter((p) => !hidden.includes(p));
    },
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

  // Reset pagination when a new album opens.
  useEffect(() => {
    setVisible(PAGE);
  }, [item]);

  // Infinite scroll sentinel.
  useEffect(() => {
    if (!open) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible((v) => Math.min(v + PAGE, photoUrls.length));
        }
      },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [open, photoUrls.length, visible]);

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
      if (pushedRef.current) {
        pushedRef.current = false;
        window.history.back();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => onClose();
  const shown = photoUrls.slice(0, visible);

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
                  Album
                </div>
              )}
              <h2 className="font-display text-4xl md:text-6xl italic text-gradient mb-3">
                {item.client ?? item.alt}
              </h2>
              {item.caption && (
                <div className="inline-flex items-center gap-2 text-xs md:text-sm uppercase tracking-[0.3em] text-muted-foreground mb-10">
                  <Calendar className="h-4 w-4" />
                  {item.caption}
                </div>
              )}

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

              <div>
                <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-4 flex items-center justify-between">
                  <span>Photographs</span>
                  <span className="normal-case tracking-normal text-muted-foreground/70">
                    {Math.min(visible, photoUrls.length)} / {photoUrls.length}
                  </span>
                </div>
                <div className="columns-2 lg:columns-3 gap-3 [column-fill:_balance]">
                  {shown.map((p, i) => (
                    <AlbumTile
                      key={i}
                      photo={p}
                      alt={`${item.alt} — ${i + 1}`}
                      onClick={() => lightbox.open(i)}
                    />
                  ))}
                </div>
                {visible < photoUrls.length && (
                  <div
                    ref={sentinelRef}
                    className="mt-3 columns-2 lg:columns-3 gap-3"
                    aria-label="Loading more"
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="mb-3 break-inside-avoid w-full rounded-2xl bg-muted/50 animate-pulse"
                        style={{ height: 180 + (i % 3) * 80 }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
          {createPortal(
            <div
              className="fixed inset-0 z-[100] isolate"
              style={{ pointerEvents: lightbox.index !== null ? "auto" : "none" }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Lightbox
                items={lightboxItems}
                index={lightbox.index}
                onClose={lightbox.close}
                onIndexChange={lightbox.set}
              />
            </div>,
            document.body,
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
