## Hero & page carousel refinements

### 1. Hero title block (`src/three/HeroScene.tsx`)
- Remove the third row (the per-slide `current.caption` line under the tagline).
- Remove the `AnimatePresence` / `motion.div` wrapper around the center title so it stays static when the image changes. Keep it as a plain `<div>`.
- Increase the tagline "Story telling through three perspective" size: bump from `text-[10px] md:text-xs` to roughly `text-xs md:text-sm` with slightly wider tracking (still uppercase).

### 2. Hero bottom-right caption (`src/three/HeroScene.tsx`)
- Remove the `current.label` line (Weddings / Spaces / Stories).
- Keep only `current.caption`, increased in size from `text-[10px] md:text-[11px]` to roughly `text-sm md:text-base`, slightly bolder weight, retaining the glass card and fade/slide animation on slide change.

### 3. Mobile-specific carousel images (per-slide field)
- Extend `HeroSlide` type in `src/hooks/useHeroSlidesStore.ts` with optional `mobileSrc?: string`. Same shape is reused by Stories and Spaces hero stores.
- In admin editors (`HeroSlidesEditor.tsx`, `StoriesHeroEditor.tsx`, `SpacesHeroEditor.tsx`), add a second `ImageUpload` per slide labeled "Mobile image (portrait, optional)". Falls back to desktop image when empty.
- Rendering:
  - `HeroScene.tsx` and `PageCarousel.tsx` pick `isMobile ? (slide.mobileSrc || slide.src) : slide.src` via the existing `useIsMobile()` hook (already used in HeroScene; add it to PageCarousel).
  - Keep current `object-contain` on mobile / `object-cover` on desktop behavior in HeroScene; apply the same mobile/desktop image-fit logic in `PageCarousel` so portrait mobile images display fully.

### 4. Stories albums title (`src/pages/Stories.tsx`)
- Add a section header above the albums `<Gallery>` matching the FILMS header pattern (same typography, same right-side count). Title: **"FRAMES"** (creative name, parallel to FILMS).
- Show count as `{items.length} {items.length === 1 ? "frame" : "frames"}`.

### Files touched
- `src/three/HeroScene.tsx`
- `src/components/PageCarousel.tsx`
- `src/hooks/useHeroSlidesStore.ts` (type extension)
- `src/components/admin/HeroSlidesEditor.tsx`
- `src/components/admin/StoriesHeroEditor.tsx`
- `src/components/admin/SpacesHeroEditor.tsx`
- `src/pages/Stories.tsx`

No DB schema changes (slides are stored as JSON in `site_content`, so the new optional `mobileSrc` field is backward compatible).
