import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import type { GalleryItem } from "@/data/galleries";
import { resolveImageUrl } from "@/lib/imageUrl";

interface Props {
  item: GalleryItem | null;
  onClose: () => void;
}

export const AlbumDialog = ({ item, onClose }: Props) => {
  const open = !!item;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          className="fixed inset-0 z-[90] overflow-y-auto bg-background/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            aria-label="Close"
            onClick={onClose}
            className="fixed top-6 right-6 z-[91] glass rounded-full p-3 hover:glow transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className="container mx-auto px-6 py-20 max-w-5xl"
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
              <h2 className="font-display text-5xl md:text-6xl italic text-gradient mb-12">
                {item.client ?? item.alt}
              </h2>

              {/* Photos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(item.photos && item.photos.length > 0 ? item.photos : [item.src]).map((p, i) => (
                  <motion.img
                    key={i}
                    src={resolveImageUrl(p)}
                    alt={`${item.alt} — ${i + 1}`}
                    loading="lazy"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="w-full h-auto rounded-2xl object-cover"
                  />
                ))}
              </div>

              {/* Videos */}
              {item.videos && item.videos.length > 0 && (
                <div className="mt-12">
                  <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-5">
                    Films
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Feedback */}
              {item.feedback && (
                <figure className="mt-14 glass rounded-3xl p-8 md:p-10">
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
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
