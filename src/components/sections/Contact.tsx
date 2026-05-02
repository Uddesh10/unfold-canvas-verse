import { Reveal } from "@/components/Reveal";
import { Mail, Phone, Instagram, MapPin } from "lucide-react";

export const Contact = () => (
  <section id="contact" className="relative py-24">
    <div className="container mx-auto px-6">
      <Reveal>
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-4">05 — Reach us</div>
          <h2 className="font-display text-4xl md:text-5xl">Stay in touch.</h2>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            { icon: Mail, label: "Email", value: "hello@unfold.studio", href: "mailto:hello@unfold.studio" },
            { icon: Phone, label: "Phone", value: "+44 20 4577 1010", href: "tel:+442045771010" },
            { icon: Instagram, label: "Instagram", value: "@unfold.studios", href: "https://instagram.com" },
            { icon: MapPin, label: "Studio", value: "London · Lisbon · Tokyo" },
          ].map(({ icon: Icon, label, value, href }) => {
            const Wrapper: any = href ? "a" : "div";
            return (
              <Wrapper
                key={label}
                {...(href ? { href, target: href.startsWith("http") ? "_blank" : undefined, rel: "noreferrer" } : {})}
                className="glass rounded-2xl p-6 block hover:glow transition-all"
              >
                <Icon className="w-5 h-5 text-primary mb-4" />
                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-1">{label}</div>
                <div className="text-sm">{value}</div>
              </Wrapper>
            );
          })}
        </div>
      </Reveal>
    </div>
  </section>
);
