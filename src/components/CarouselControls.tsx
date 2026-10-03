import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarouselControlsProps {
  current: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const CarouselControls = ({ current, total, onPrevious, onNext }: CarouselControlsProps) => {
  if (total < 2) return null;

  const progress = `${((current + 1) / total) * 100}%`;

  return (
    <div className="absolute inset-x-5 bottom-5 z-20 flex items-end justify-between gap-4 md:inset-x-10 md:bottom-10">
      <div className="hidden w-40 text-carousel-foreground md:block">
        <div className="mb-3 flex items-end justify-between">
          <span className="font-display text-3xl leading-none">{String(current + 1).padStart(2, "0")}</span>
          <span className="text-[9px] uppercase text-carousel-foreground/55">Total {String(total).padStart(2, "0")}</span>
        </div>
        <div className="h-px overflow-hidden bg-carousel-foreground/25">
          <div className="h-full bg-carousel-foreground transition-[width] duration-700" style={{ width: progress }} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          aria-label="Previous slide"
          className="carousel-control h-11 w-11 rounded-full text-carousel-foreground hover:text-carousel-foreground md:h-12 md:w-12"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onNext}
          aria-label="Next slide"
          className="carousel-control h-11 w-11 rounded-full text-carousel-foreground hover:text-carousel-foreground md:h-12 md:w-12"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};