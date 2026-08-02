# Plan

## Goal

Make the Spaces and Stories carousels look and behave exactly like the homepage Hero slideshow, while each page keeps its own slides from the admin editors.

## Changes

### `src/components/PageCarousel.tsx`

Align the markup and motion with `HeroScene`:

- Container: `bg-black` behind slides (matches Hero).
- Slide transition: `duration: 1.6`, `initial scale 1.08` (Hero values instead of 1.4 / 1.06).
- Vignette: always rendered, not conditional.
- Center title: same classes as Hero — `text-gradient` first word, light italic remainder, tagline at `text-xs md:text-sm tracking-[0.4em]`, static across slides.
- Bottom-right card: animate the whole glass card via `AnimatePresence` (as Hero does) rather than animating inner content inside a static card; keep the `bottomRightTag` line pinned above the animated label + caption.
- Arrow buttons: add `group` and `pointer-events-auto`, same sizing/styling as Hero.

### `src/pages/Spaces.tsx` and `src/pages/Stories.tsx`

- Use Hero's full-viewport height: `heightClass="h-[100svh] min-h-[520px]"`.
- Remove the `pt-24` offset on the hero section so the image is full-bleed under the nav, as on the homepage.
- Keep existing `centerTitle` and `bottomRightTag` values unchanged.

## Notes

- No changes to slide data, stores, admin editors, or backend — each page still reads its own `spaces_hero_slides` / `stories_hero_slides`.
- Mobile `mobileSrc` / `object-contain` behavior stays as-is (already matches Hero).
