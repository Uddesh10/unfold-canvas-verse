
## 1. Homepage

- **Hero caption overlay** (`src/components/sections/Hero.tsx` + `HeroScene.tsx`)
  - Read current slide index/caption from `useHeroSlidesStore` (lift index into Hero or expose via context/prop callback from `HeroScene`).
  - Render an additional centered overlay: glass card (`glass` util, `backdrop-blur`, soft border, rounded-2xl) containing:
    - Slide caption (per-slide `caption` field) in small uppercase tracking text.
    - "Unfold Studios" wordmark (already present) repositioned inside the card for readability.
  - Animate caption with framer-motion fade on slide change.
- **Photographer ↔ Favourite Shots gap**: reduce top padding on `FavouriteShots` from `py-24 md:py-32` → `pt-6 md:pt-10 pb-24 md:pb-32`.
- **Remove Behance link**: drop the Behance `<a>` block (and the `Palette` import) in `Photographer.tsx`. Keep field in data store untouched.
- **Mobile hero cropping**: in `HeroScene.tsx` the `PhotoImg` uses `object-cover`. Add `object-center` and switch hero `<section>` to fill height with `object-cover` plus a smaller-DPR aware container; specifically on `<md` use `object-[center_30%]` and ensure the picture uses the `full` variant. Verify wrapper is `h-[100svh] min-h-[560px]` (no aspect crop). Add `sm:object-cover object-contain bg-black` fallback only if user reports it still crops faces (default keep cover but anchor center).

## 2. Weddings

- **Tile name not italic**: in `Gallery.tsx` `SlideshowImage`, change `font-display italic` → `font-display` (non-italic) on the client name.
- **Album grid stable layout**: in `AlbumDialog.tsx` the masonry columns shift while images load. Switch each `AlbumTile` to render a fixed aspect placeholder derived from a default ratio (`4/5`) AND, once loaded, snap the image inline so columns don't re-balance. Concretely: keep skeleton with `aspectRatio: 4/5`, and on `<img>` add `style={{ aspectRatio: w/h }}` after `onLoad` reads `naturalWidth/Height`. Use `column-fill: balance` only once images finish (`column-fill: auto` initially) — simplest fix: replace CSS columns masonry with a JS-balanced 3-column array (split `shown` into N column buckets and render N flex columns) so each new image only extends its own column.
- **Smoother review transitions**: in `Weddings.tsx` reviews, replace the y-slide AnimatePresence with a crossfade + slight scale (duration 0.7, ease `[0.22,1,0.36,1]`), animate the peek cards too (fade their content key with `AnimatePresence`). Increase auto-advance to 6s.
- **Mobile album hover**:
  - On `<md`, hide the hover overlay entirely and instead always render a compact 2-line caption block UNDER the image (title + date), so they never overlap.
  - In `SlideshowImage`: wrap the bottom-left date chip + bottom-right name into responsive variants — desktop keeps current absolute overlay, mobile renders below the tile via a sibling `<div className="md:hidden mt-2">`. Shrink mobile name to `text-base` non-italic.
  - **Disable mobile slideshow**: detect `useIsMobile()` (already in repo) and skip the interval + only render the cover `PhotoImg`.

## 3. Stories (renamed everywhere — already called Stories in code, but vertical label is "Street")

- **Rename Street → Stories**: in `src/data/themes.ts` set `stories.label = "Stories"`. Audit `Nav.tsx`, `PerspectiveBar`, `Footer`, any "Street" string → "Stories".
- **Per-page hero carousel**: new admin editor `StoriesHeroEditor` writing `site_content` key `stories_hero_slides` (reuse `HeroSlide[]` shape). New hook `useStoriesHeroSlidesStore`. Replace the static `<motion.img>` block in `Stories.tsx` hero with a new `PageCarousel` component (extracted from `HeroScene` minus the brand overlay) that takes `slides` prop. Keep section heading/tagline above or below as today, just no "Unfold / three perspectives" caption.
- **Videos section above gallery**: new `site_content` key `stories_videos: string[]` (YouTube/Vimeo embed URLs). New `StoriesVideosEditor` (collapsible card per video, URL input, reorder + delete, Save). Render a new section in `Stories.tsx` directly above the "EDITION 07 // FRAMES" section: responsive grid of `aspect-video` iframes.
- **Remove**: marquee field-notes section, the manifesto two-column section, and the "EDITION 07 // FRAMES" heading row (keep the gallery, swap heading to just "Frames" + count or drop heading entirely per a minimal look — will drop heading).

## 4. Footer (`src/components/Footer.tsx`)

- Remove tagline paragraph under the brand.
- Brand text: "Unfold" → "Unfold Studios".
- Replace Contact section content with the same links rendered in `Photographer.tsx`: Email, Instagram, Location (from `usePhotographerStore`). Behance already being removed globally — exclude.

## 5. Spaces (Architecture → Spaces)

- **Rename Architecture → Spaces everywhere**: `src/data/themes.ts` `spaces.label = "Spaces"`. Audit all UI strings ("Architecture" → "Spaces") in `Nav`, perspective bar, `Footer`, gallery filters, SEO copy.
- **Per-page hero carousel**: same pattern as Stories — new `SpacesHeroEditor`, `site_content` key `spaces_hero_slides`, `useSpacesHeroSlidesStore`. Replace the single `<motion.img>` and the "Architecture, in its quietest voice." headline block with the shared `PageCarousel` component (no brand overlay).
- Remove the "Two-column note" section (`Approach / Light first…`).
- Change "Selected projects" → "Projects".
- Remove `{items.length} works · 2022—2025` text.
- Remove the "Day rates and project packages. Travel worldwide" paragraph in the CTA block (keep heading + button).

## 6. Admin

- **Image expand modal**: in `ImageUpload.tsx` add a small "Expand" (Maximize2) button overlay on every preview thumb (both `compact` and full variants). Clicking opens a centered modal (Radix `Dialog`, `max-w-2xl`, `aspect-auto`, image fits) using `PhotoImg variant="full"`. Close on backdrop / Esc.
- **Sticky expand/collapse bar**: `GalleryEditor`, `HeroSlidesEditor`, `TestimonialsEditor`, `FaqEditor`, `FavouriteShotsEditor` — wrap the existing header row (Expand all / Collapse all + Save) in a `sticky top-0 z-20 bg-background/95 backdrop-blur border-b py-3 -mx-* px-*` container so it stays visible while scrolling each tab.

## Database

- No schema changes required — new content uses existing `site_content` (jsonb key/value) table:
  - `stories_hero_slides` (HeroSlide[])
  - `spaces_hero_slides` (HeroSlide[])
  - `stories_videos` (string[])

## New / modified files (high level)

- New: `src/components/PageCarousel.tsx`, `src/hooks/useStoriesHeroSlidesStore.ts`, `src/hooks/useSpacesHeroSlidesStore.ts`, `src/hooks/useStoriesVideosStore.ts`, `src/components/admin/StoriesHeroEditor.tsx`, `src/components/admin/SpacesHeroEditor.tsx`, `src/components/admin/StoriesVideosEditor.tsx`, `src/components/admin/ImageExpandModal.tsx`.
- Modified: `Hero.tsx`, `HeroScene.tsx`, `Photographer.tsx`, `FavouriteShots.tsx`, `Gallery.tsx`, `AlbumDialog.tsx`, `Weddings.tsx`, `Stories.tsx`, `Spaces.tsx`, `Footer.tsx`, `Nav.tsx`, `themes.ts`, `Admin.tsx`, `ImageUpload.tsx`, all editors mentioned for sticky header, `pendingUploads.ts` (no change), `useSiteContent.ts` (no change).

## Not touched

- DB schema, AWS pipeline, auth flow, image pipeline.
