import { motion } from "framer-motion";
import { Mail, Instagram, MapPin, Palette } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { usePhotographerStore } from "@/hooks/usePhotographerStore";
import { resolveImageUrl } from "@/lib/imageUrl";

export const Photographer = () => {
  const { value: p } = usePhotographerStore();
  return (
    <section id="photographer" className="relative py-24 md:py-32">
      <div className="container mx-auto px-6 grid md:grid-cols-12 gap-10 items-center">
        <Reveal className="md:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl glass">
            <motion.img
              src={resolveImageUrl(p.portrait)}
              alt={p.name}
              loading="lazy"
              initial={{ scale: 1.08 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 1.4 }}
              viewport={{ once: true }}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
            <div className="absolute -inset-1 -z-10 rounded-3xl opacity-60 blur-2xl"
              style={{ background: "var(--gradient-text)" }} />
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.35em] text-foreground/80">
                Behind the lens
              </span>
              <span className="font-display italic text-2xl text-gradient">{p.name.split(" ")[0]}.</span>
            </div>
          </div>
        </Reveal>

        <div className="md:col-span-7 md:pl-6">
          <Reveal>
            <div className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4">
              The photographer
            </div>
            <h2 className="font-display text-5xl md:text-6xl leading-[1.05]">
              {p.name}
              <span className="block italic text-gradient text-3xl md:text-4xl mt-2">
                {p.role}
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-6 space-y-4 text-foreground/80 leading-relaxed text-base md:text-lg">
              {p.bio.split("\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> {p.location}
              </span>
              <a href={`mailto:${p.email}`} className="inline-flex items-center gap-2 hover:text-primary transition-colors" data-cursor-hover>
                <Mail className="h-3.5 w-3.5" /> {p.email}
              </a>
              <a href={p.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-primary transition-colors" data-cursor-hover>
                <Instagram className="h-3.5 w-3.5" /> Instagram
              </a>
              {p.behance && (
                <a href={p.behance} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-primary transition-colors" data-cursor-hover>
                  <Palette className="h-3.5 w-3.5" /> Behance
                </a>
              )}
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
              {p.stats.map((s) => (
                <div key={s.label} className="glass rounded-2xl p-4 text-center">
                  <div className="font-display text-3xl text-gradient">{s.value}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
