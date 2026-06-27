import { HeroScene } from "@/three/HeroScene";

export const Hero = () => {
  return (
    <section className="relative h-[100svh] min-h-[520px] w-full overflow-hidden hero-bg">
      <HeroScene />
    </section>
  );
};
