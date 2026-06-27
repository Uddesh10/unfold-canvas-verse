import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { PhotoImg } from "@/components/PhotoImg";
import { Lightbox, useLightbox } from "@/components/Lightbox";
import { useFavouriteShotsStore } from "@/hooks/useFavouriteShotsStore";
import type { GalleryItem } from "@/data/galleries";

export const FavouriteShots = () => {
  const { value: shots } = useFavouriteShotsStore();
  const lb = useLightbox();

  if (!shots || shots.length === 0) return null;

  const lightboxItems: GalleryItem[] = shots.map((s) => ({
    src: s.src,
    alt: s.alt,
    caption: s.caption,
  }));

  return (
    <section id="favourites" className="relative pt-6 md:pt-10 pb-24 md:pb-32">
      <div className="container mx-auto px-6">
        <Reveal>
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-4">
              A personal edit
            </div>
            <h2 className="font-display text-5xl md:text-6xl leading-[1.05]">
              Favourite <span className="italic text-gradient">Shots.</span>
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-muted-foreground text-sm md:text-base">
              Frames I keep coming back to — chosen by hand, across years and continents.
            </p>
          </div>
        </Reveal>

        <div className="columns-2 lg:columns-3 gap-3 md:gap-4 [column-fill:_balance]">
          {shots.map((s, i) => (
            <motion.button
              key={i}
              onClick={() => lb.open(i)}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: (i % 6) * 0.05, duration: 0.5 }}
              className="group mb-3 md:mb-4 break-inside-avoid inline-block w-full cursor-zoom-in rounded-2xl overflow-hidden bg-muted relative"
            >
              <PhotoImg
                photo={s.src}
                variant="grid"
                alt={s.alt}
                className="block w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {s.caption && (
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-white/90">
                    {s.caption}
                  </div>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        <Lightbox
          items={lightboxItems}
          index={lb.index}
          onClose={lb.close}
          onIndexChange={lb.set}
        />
      </div>
    </section>
  );
};
