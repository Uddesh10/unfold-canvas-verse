import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Lightbox, useLightbox } from "@/components/Lightbox";
import type { GalleryItem } from "@/data/galleries";
import { Reveal } from "@/components/Reveal";

interface Props {
  items: GalleryItem[];
  variant: "masonry" | "grid" | "collage";
  className?: string;
  caption?: ReactNode;
}

export const Gallery = ({ items, variant, className }: Props) => {
  const lb = useLightbox();

  if (variant === "grid") {
    return (
      <>
        <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 ${className ?? ""}`}>
          {items.map((it, i) => (
            <Reveal key={i} delay={(i % 6) * 0.05}>
              <button
                onClick={() => lb.open(i)}
                className="group block w-full aspect-[4/5] overflow-hidden bg-muted relative"
                data-cursor-hover
              >
                <img
                  src={it.src}
                  alt={it.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                {it.caption && (
                  <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-[0.25em] text-white/90 bg-black/30 backdrop-blur px-2 py-1">
                    {it.caption}
                  </span>
                )}
              </button>
            </Reveal>
          ))}
        </div>
        <Lightbox items={items} index={lb.index} onClose={lb.close} onIndexChange={lb.set} />
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
              onClick={() => lb.open(i)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: (i % 5) * 0.04, duration: 0.5 }}
              className={`group relative overflow-hidden bg-muted ${spans[i % spans.length]}`}
              data-cursor-hover
            >
              <img src={it.src} alt={it.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {it.caption && (
                <span className="absolute bottom-2 left-2 font-mono text-[10px] uppercase tracking-widest text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                  {it.caption}
                </span>
              )}
            </motion.button>
          ))}
        </div>
        <Lightbox items={items} index={lb.index} onClose={lb.close} onIndexChange={lb.set} />
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
              onClick={() => lb.open(i)}
              className="group block w-full overflow-hidden rounded-2xl relative bg-muted"
              data-cursor-hover
            >
              <img src={it.src} alt={it.alt} loading="lazy" className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {it.caption && (
                <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-[0.25em] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  {it.caption}
                </span>
              )}
            </button>
          </Reveal>
        ))}
      </div>
      <Lightbox items={items} index={lb.index} onClose={lb.close} onIndexChange={lb.set} />
    </>
  );
};
