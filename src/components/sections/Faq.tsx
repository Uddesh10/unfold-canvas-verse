import { Reveal } from "@/components/Reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useFaqStore } from "@/hooks/useFaqStore";

export const Faq = () => {
  const { items: faqs } = useFaqStore();
  return (
  <section id="faq" className="relative py-28 md:py-40">
    <div className="container mx-auto px-6 grid md:grid-cols-12 gap-10">
      <Reveal className="md:col-span-4">
        <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-5">03 — Common questions</div>
        <h2 className="font-display text-5xl md:text-6xl leading-[1.05]">Quietly,<br/><span className="italic text-gradient">answered.</span></h2>
      </Reveal>
      <Reveal delay={0.15} className="md:col-span-8">
        <div className="glass rounded-3xl p-2 md:p-4">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-border/40 last:border-0 px-4 md:px-6">
                <AccordionTrigger className="text-left text-base md:text-lg py-5 hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 text-base leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Reveal>
    </div>
  </section>
  );
};
