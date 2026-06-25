# Round of fixes

## 1. Hero slideshow — arrows + remove progress bar (`src/three/HeroScene.tsx`)
- Remove the bottom-left progress-dots row entirely.
- Remove the bottom-right caption/label block (it's part of the same "bars" pattern) — keep the slideshow visually clean.
- Add left/right chevron buttons (lucide `ChevronLeft`/`ChevronRight`) centered vertically at the screen edges, styled `glass rounded-full p-3`, with `aria-label` and hover glow. Click → `setI((i) => (i ± 1 + n) % n)`.
- Pause autoplay for ~6s after a manual click so it doesn't immediately advance.
- Hide arrows when only 1 slide is configured.

## 2. Albums not loading on Weddings / Spaces / Stories
Symptom: requests return 200 but grids stay empty. Root cause in `src/components/Gallery.tsx`:
```ts
const items = rawItems.map(visibleItem).filter((it) => !!it.src);
```
`visibleItem` blanks `src` to `""` when the cover image is in `hiddenPhotos` AND `photos` is empty, so every album whose cover URL coincidentally appears in `hidden_photos` (or any album with empty `photos`) is filtered out. Fix:
- In `visibleItem`, only blank `src` when there's a real replacement; otherwise keep the original `src` and let the album still render.
- Remove the blanket `!!it.src` filter (keep a softer guard: only drop items with no `src` AND no `photos`).
- Also defensively coerce `hidden_photos` / `slideshow_photos` to `[]` when DB returns `null` (already done in store, double-check).

I'll verify with Playwright after the fix that all three tabs render their albums.

## 3. Smooth album loading inside `AlbumDialog`
Current behavior: masonry columns reflow as each image decodes, so tiles "jump". Plan:
- Wrap each tile in a fixed-aspect placeholder using the image's natural ratio once known; until loaded, render a `Skeleton` (use `src/components/ui/skeleton.tsx`) at a default 4/5 ratio.
- Fade images in with `opacity` transition on `onLoad` (no layout shift).
- Replace the abrupt "Loading more…" sentinel with a small row of 6 skeleton tiles while the next page is mounting.
- Keep `columns-2 lg:columns-3` masonry; the per-tile aspect placeholder is what kills the jump.

(Same treatment applied to `Gallery.tsx` masonry list for parity.)

## 4. Architecture (Spaces) + Street (Stories) — same grid as Weddings
- `src/pages/Spaces.tsx`: change `<Gallery items={items} variant="grid" />` → `variant="masonry"`.
- `src/pages/Stories.tsx`: change `variant="collage"` → `variant="masonry"`.
- No changes to `Gallery.tsx` variant code (keeps grid/collage available for future use).

## 5. Hide / unhide entire albums (admin)
- DB: add `hidden boolean not null default false` to `public.gallery_items` (migration, with GRANTs already in place).
- `useGalleryStore.ts`: map `hidden` in/out, default `false`.
- `GalleryEditor.tsx`: add an "Eye / EyeOff" toggle button in the album header actions row (next to up/down/delete). Visually dim the card when hidden and append "· hidden" to the subtitle.
- Public pages (`Gallery.tsx`): filter out `it.hidden === true` before rendering.

## 6. Homepage mobile responsiveness (`src/components/sections/Hero.tsx`)
- Reduce headline upper clamp on mobile: `clamp(2.5rem, 11vw, 9rem)` so "Unfold Studios" fits one line on 360–390px screens.
- Add safe horizontal padding (`px-4 sm:px-6`) and `max-w-[92vw]` on the inner block.
- Tagline: `text-sm sm:text-base md:text-2xl` and `mt-4 sm:mt-6 md:mt-8` to tighten mobile spacing.
- `HeroScene` arrows: smaller hit target on mobile (`p-2 md:p-3`) and pulled in from the edge (`left-3 md:left-6`).
- Reduce `min-h-[560px]` → `min-h-[520px]` so the layout doesn't overflow short phones in landscape.

## Technical notes
- Migration must include `GRANT` re-affirmation only if needed; `ALTER TABLE ADD COLUMN` does not require new grants.
- Types file regenerates after the migration approval; only then do I touch the store/editor code that reads `hidden`.
- Build order: (a) migration → (b) store + editor + Gallery filter → (c) Hero + HeroScene UI → (d) AlbumDialog/Gallery skeleton loading → (e) Spaces/Stories variant swap → (f) Playwright verify all three album tabs render and homepage mobile viewport looks clean.
