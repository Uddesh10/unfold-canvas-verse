import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Lightbox, useLightbox } from "@/components/Lightbox";
import { AlbumDialog } from "@/components/AlbumDialog";
import type { GalleryItem } from "@/data/galleries";
import { Reveal } from "@/components/Reveal";
import { resolveImageUrl } from "@/lib/imageUrl";

interface Props {
  items: GalleryItem[];
  variant: "masonry" | "grid" | "collage";
  className?: string;
  caption?: ReactNode;
}

// Mini slideshow on hover — cycles through photos[] when hovered.
const SlideshowImage = ({ item }: { item: GalleryItem }) => {
  const photos = item.photos && item.photos.length > 0 ? item.photos : [item.src];
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!hover || photos.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % photos.length), 1500);
    return () => clearInterval(t);
  }, [hover, photos.length]);

  useEffect(() => {
    if (!hover) setI(0);
  }, [hover]);

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {photos.map((p, idx) => (
        <img
          key={idx}
          src={resolveImageUrl(p)}
          alt={item.alt}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            idx === i ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {/* fallback static for layout when image is masonry-auto */}
      <img
        src={resolveImageUrl(photos[0])}
        alt=""
        aria-hidden
        className="invisible w-full h-auto"
      />

      {/* hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      {item.client && (
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="font-display text-2xl italic text-white">{item.client}</div>
          {photos.length > 1 && (
            <div className="flex gap-1">
              {photos.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1 w-4 rounded-full transition-all ${
                    idx === i ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
      {!item.client && item.caption && (
        <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-[0.25em] text-white opacity-0 group-hover:opacity-100 transition-opacity">
          {item.caption}
        </span>
      )}
    </div>
  );
};

export const Gallery = ({ items, variant, className }: Props) => {
  const lb = useLightbox();
  const [album, setAlbum] = useState<GalleryItem | null>(null);

  const onItemClick = (it: GalleryItem, i: number) => {
    // If the item is rich (client/photos/videos/feedback), open the album dialog.
    if (it.client || (it.photos && it.photos.length > 0) || (it.videos && it.videos.length > 0) || it.feedback) {
      setAlbum(it);
    } else {
      lb.open(i);
    }
  };

  if (variant === "grid") {
    return (
      <>
        <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 ${className ?? ""}`}>
          {items.map((it, i) => (
            <Reveal key={i} delay={(i % 6) * 0.05}>
              <button
                onClick={() => onItemClick(it, i)}
                className="group block w-full aspect-[4/5] overflow-hidden bg-muted relative"
              >
                <SlideshowImage item={it} />
              </button>
            </Reveal>
          ))}
        </div>
        <Lightbox items={items} index={lb.index} onClose={lb.close} onIndexChange={lb.set} />
        <AlbumDialog item={album} onClose={() => setAlbum(null)} />
      </>
    );
  }

  if (variant === "collage") {
    const spans = ["col-span-2 row-span-2", "col-span-1 row-span-1", "col-span-1 row-span-2", "col-span-2 row-span-1", "col-span-1 row-span-1", "col-span-2 row-span-2", "col-span-1 row-span-1", "col-span-1 row-span-1", "col-span-2 row-span-1"];
    return (
      <>
        <div className={`grid grid-cols-3 md:grid-cols-4 auto-rows-[120px] md:auto-rows-[180px] gap-2 ${className ?? ""}`}>
          {items.map((it, i) => (
            <motion.button
              key={i}
              onClick={() => onItemClick(it, i)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: (i % 5) * 0.04, duration: 0.5 }}
              className={`group relative overflow-hidden bg-muted ${spans[i % spans.length]}`}
            >
              <SlideshowImage item={it} />
            </motion.button>
          ))}
        </div>
        <Lightbox items={items} index={lb.index} onClose={lb.close} onIndexChange={lb.set} />
        <AlbumDialog item={album} onClose={() => setAlbum(null)} />
      </>
    );
  }

  // masonry
  return (
    <>
      <div className={`columns-1 sm:columns-2 lg:columns-3 gap-4 ${className ?? ""}`}>
        {items.map((it, i) => (
          <Reveal key={i} delay={(i % 5) * 0.06} className="mb-4 break-inside-avoid">
            <button
              onClick={() => onItemClick(it, i)}
              className="group block w-full overflow-hidden rounded-2xl relative bg-muted"
            >
              <SlideshowImage item={it} />
            </button>
          </Reveal>
        ))}
      </div>
      <Lightbox items={items} index={lb.index} onClose={lb.close} onIndexChange={lb.set} />
      <AlbumDialog item={album} onClose={() => setAlbum(null)} />
    </>
  );
};
