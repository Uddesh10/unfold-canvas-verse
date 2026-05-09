import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { addSubmission } from "@/hooks/useSubmissionsStore";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Please enter a valid email").max(160),
  phone: z.string().trim().min(5, "Phone too short").max(30),
  category: z.enum(["weddings", "spaces", "stories"], { error: "Please choose a perspective" }),
  date: z.string().min(1, "Please choose a date"),
  message: z.string().trim().max(800).optional().or(z.literal("")),
});

type FormVals = z.infer<typeof schema>;

export const Booking = () => {
  const [submitted, setSubmitted] = useState(false);
  const {
    register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting },
  } = useForm<FormVals>({ resolver: zodResolver(schema), defaultValues: { category: undefined as unknown as FormVals["category"] } });

  const category = watch("category");

  const onSubmit = async (v: FormVals) => {
    await new Promise((r) => setTimeout(r, 900));
    addSubmission({
      name: v.name,
      email: v.email,
      phone: v.phone,
      category: v.category,
      date: v.date,
      message: v.message || undefined,
    });
    setSubmitted(true);
    reset();
  };

  return (
    <section id="book" className="relative py-28 md:py-40">
      <div className="container mx-auto px-6 grid md:grid-cols-12 gap-10">
        <Reveal className="md:col-span-5">
          <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-5">04 — Begin</div>
          <h2 className="font-display text-5xl md:text-6xl leading-[1.05]">
            Start your <span className="italic text-gradient">story.</span>
          </h2>
          <p className="mt-6 text-muted-foreground max-w-md">
            Tell us a little about you, the moment you'd like captured, and the date that matters. We reply within 48 hours, in your time zone.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="md:col-span-7">
          <div className="glass rounded-3xl p-8 md:p-10 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="thanks"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-10"
                >
                  <div className="font-display text-3xl mb-3 text-gradient">Thank you.</div>
                  <p className="text-muted-foreground">Your story has been received. We'll be in touch shortly.</p>
                  <Button variant="outline" className="mt-8" onClick={() => setSubmitted(false)}>Send another</Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="name" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Name</Label>
                      <Input id="name" {...register("name")} className="mt-2 bg-background/40 border-border/60 h-11" />
                      {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</Label>
                      <Input id="email" type="email" {...register("email")} className="mt-2 bg-background/40 border-border/60 h-11" />
                      {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Phone</Label>
                      <Input id="phone" {...register("phone")} className="mt-2 bg-background/40 border-border/60 h-11" />
                      {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="date" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Date</Label>
                      <Input id="date" type="date" {...register("date")} className="mt-2 bg-background/40 border-border/60 h-11" />
                      {errors.date && <p className="text-xs text-destructive mt-1">{errors.date.message}</p>}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Perspective</Label>
                    <Select value={category} onValueChange={(v) => setValue("category", v as FormVals["category"], { shouldValidate: true })}>
                      <SelectTrigger className="mt-2 bg-background/40 border-border/60 h-11">
                        <SelectValue placeholder="Choose a vertical" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weddings">Unfold Studios — Weddings</SelectItem>
                        <SelectItem value="spaces">Unfold Spaces — Interiors</SelectItem>
                        <SelectItem value="stories">Unfold Stories — Street</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tell us about it</Label>
                    <Textarea id="message" {...register("message")} rows={4} className="mt-2 bg-background/40 border-border/60" />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-xs uppercase tracking-[0.3em]">
                    {isSubmitting ? "Sending…" : "Start Your Story"}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
