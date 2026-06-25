import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Lightbox, useLightbox } from "@/components/Lightbox";
import { AlbumDialog } from "@/components/AlbumDialog";
import { PhotoImg } from "@/components/PhotoImg";
import type { GalleryItem } from "@/data/galleries";
import { Reveal } from "@/components/Reveal";

interface Props {
  items: GalleryItem[];
  variant: "masonry" | "grid" | "collage";
  className?: string;
  caption?: ReactNode;
}

// Filter out hidden photos from item.photos / slideshow / cover.
const visibleItem = (it: GalleryItem): GalleryItem => {
  const hidden = it.hiddenPhotos ?? [];
  if (hidden.length === 0) return it;
  const photos = (it.photos ?? []).filter((p) => !hidden.includes(p));
  const slideshow = (it.slideshowPhotos ?? []).filter((p) => !hidden.includes(p));
  let src = it.src;
  if (hidden.includes(src)) {
    src = photos[0] ?? slideshow[0] ?? src;
  }
  return { ...it, src, photos, slideshowPhotos: slideshow };
};

// Mini slideshow on hover.
const SlideshowImage = ({ item }: { item: GalleryItem }) => {
  const slideshow = item.slideshowPhotos && item.slideshowPhotos.length > 0
    ? item.slideshowPhotos
    : [item.src];
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const [maxMounted, setMaxMounted] = useState(0);

  useEffect(() => {
    if (!hover || slideshow.length < 2) return;
    const t = setInterval(() => {
      setI((p) => {
        const next = (p + 1) % slideshow.length;
        setMaxMounted((m) => Math.max(m, next));
        return next;
      });
    }, 1500);
    return () => clearInterval(t);
  }, [hover, slideshow.length]);

  useEffect(() => {
    if (!hover) setI(0);
  }, [hover]);

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {slideshow.map((p, idx) => {
        if (idx > maxMounted) return null;
        return (
          <PhotoImg
            key={idx}
            photo={p}
            variant="grid"
            alt={item.alt}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              idx === i ? "opacity-100" : "opacity-0"
            }`}
          />
        );
      })}
      <PhotoImg
        photo={slideshow[0]}
        variant="grid"
        alt=""
        aria-hidden
        className="invisible w-full h-auto"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Always-visible event date chip (bottom-left) */}
      {item.caption && (
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-sm text-[10px] uppercase tracking-[0.2em] text-white">
          <Calendar className="h-3 w-3" />
          {item.caption}
        </span>
      )}

      {item.client && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="font-display text-2xl italic text-white text-right">{item.client}</div>
        </div>
      )}
    </div>
  );
};


export const Gallery = ({ items: rawItems, variant, className }: Props) => {
  const items = rawItems
    .filter((it) => !it.hidden)
    .map(visibleItem)
    .filter((it) => !!it.src || (it.photos && it.photos.length > 0));
  const lb = useLightbox();
  const [album, setAlbum] = useState<GalleryItem | null>(null);
  const PAGE = 24;
  const [visible, setVisible] = useState(PAGE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisible(PAGE);
  }, [rawItems]);

  useEffect(() => {
    if (variant !== "masonry") return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible((v) => Math.min(v + PAGE, items.length));
        }
      },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [variant, items.length, visible]);

  const onItemClick = (it: GalleryItem, i: number) => {
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

  const shown = items.slice(0, visible);
  return (
    <>
      <div className={`grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 ${className ?? ""}`}>
        {shown.map((it, i) => (
          <Reveal key={i} delay={(i % 5) * 0.06}>
            <button
              onClick={() => onItemClick(it, i)}
              className="group block w-full aspect-[16/10] overflow-hidden rounded-2xl relative bg-muted"
            >
              <SlideshowImage item={it} />
            </button>
          </Reveal>
        ))}
      </div>
      {visible < items.length && (
        <div ref={sentinelRef} className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4" aria-label="Loading more">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[16/10] rounded-2xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      )}
      <Lightbox items={items} index={lb.index} onClose={lb.close} onIndexChange={lb.set} />
      <AlbumDialog item={album} onClose={() => setAlbum(null)} />
    </>
  );
};
