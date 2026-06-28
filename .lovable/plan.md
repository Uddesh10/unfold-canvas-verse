# Plan

## 1. Hero bottom-right caption — show customer name
File: `src/three/HeroScene.tsx`

In the bottom-right glass card, prepend `current.label` above the caption when present:
```
{label}
{caption}
```
Style: label in small uppercase tracking (text-[10px] uppercase tracking-[0.3em] text-white/70), caption stays at text-sm md:text-base. No admin/data changes — `label` already exists on `HeroSlide` and is editable in `HeroSlidesEditor`.

## 2. Reduce vertical spacing between homepage sections
Files: `src/components/sections/About.tsx`, `Process.tsx`, `Booking.tsx`, `Faq.tsx`, `Photographer.tsx`, `FavouriteShots.tsx`

Replace section vertical padding roughly py-24/py-32 → py-12 md:py-16. Only top/bottom padding; no layout or content changes.

## 3. Spaces carousel overlays
File: `src/pages/Spaces.tsx` — add overlay props to `<PageCarousel>`.
File: `src/components/PageCarousel.tsx` — accept new optional props:
- `centerTitle?: { brand: string; tagline: string }`
- `bottomRightText?: string`

When provided, render:
- Centered overlay (same styling as Hero center block, no glass bg, drop-shadow): brand "Unfold Spaces" (display font) + tagline "Architecture, in its quietest voice." (uppercase tracking).
- Bottom-right glass card with the blurb: "Photography for architects, interior designers and hospitality brands. We make rooms hold their breath."

These overlays are static across slides (do not animate with slide change), matching the Hero pattern.

## 4. Stories carousel overlays
File: `src/pages/Stories.tsx` — pass same new props.
- Center: brand "Unfold Stories" + tagline "THE CITY, UNPOSED." (line break preserved).
- Bottom-right glass card: same "THE CITY, UNPOSED." text (as requested).

## Notes
- No DB/schema/edge-function changes.
- No admin UI changes.
- Reuses existing `glass`, `text-gradient`, and typography utilities from Hero for visual consistency.
