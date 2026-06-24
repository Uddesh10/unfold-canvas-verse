# Plan: site polish + admin upgrades

## 1. Homepage caption + responsive Hero

**File:** `src/components/sections/Hero.tsx`

- Enlarge the tagline "storytelling through three perspectives": bump from `text-sm md:text-base` → `text-base md:text-xl`, widen `max-w-md` → `max-w-2xl`, increase tracking, add subtle italic for "three perspectives".
- Mobile fix: reduce `text-[14vw]` → `text-[16vw]` only on very small phones is too big; switch to clamp-style `text-[clamp(2.75rem,12vw,7rem)]` and add `pt-24` so headline sits below the fixed nav, not behind it. Tighten min-height to `min-h-[560px]` so it doesn't feel empty on short phones.

## 2. Showcase ("highlight") section cleanup

**File:** `src/components/sections/Showcase.tsx`

- Remove the progress bar from highlight.
- Arrows: left/right `ChevronLeft`/`ChevronRight` already exist on the stage. Make them more prominent (larger glass pill, always visible on mobile too — currently they overlap badge on small screens; nudge to `top-1/2` with `md:p-3 p-2` and `left-2 md:left-4`).
- Mobile: the side column with "01" + progress was order-2 below stage; make it `md:col-span-3 col-span-12` with index shrunk on phones and the progress bar inline under the stage.

## 3. Favourite Shots section (admin-managed)

**New tab in admin → new public section under Photographer.**

- **DB migration:** add row `('favourite_shots', '[]')` to `site_content` (already public-readable, admin-write). No schema change needed — just a new key.
- **New store hook:** `src/hooks/useFavouriteShotsStore.ts` mirroring `usePhotographerStore` — reads/writes `site_content` key `favourite_shots` as an array of `{ src: string; alt: string; caption?: string }`.
- **New admin editor:** `src/components/admin/FavouriteShotsEditor.tsx` — list of cards with `ImageUpload` (single + multi), alt text, caption, reorder arrows, delete, plus a "Save changes" bar. Add a new tab in `src/pages/Admin.tsx` between Photographer and FAQ: `<TabsTrigger value="favourites">Favourite Shots</TabsTrigger>`.
- **New public section:** `src/components/sections/FavouriteShots.tsx` — masonry (`columns-2 lg:columns-3 gap-3`) of the curated photos with hover caption, lightbox on click (reuse `Lightbox` + `useLightbox`). Heading: "Favourite Shots — A personal edit."
- **Wire into Index:** `src/pages/Index.tsx` add `<FavouriteShots />` after `<Photographer />`.

## 4. Event date in wedding gallery + albums

**Decision:** keep using the existing `caption` field (no schema change). Relabel the admin input from "Caption / location" → "Event date / location (e.g. Tuscany · June 2024)" so users naturally enter it.

- **File:** `src/components/admin/GalleryEditor.tsx` — change placeholder text on the caption Input (line ~145).
- **File:** `src/components/Gallery.tsx` — surface `caption` on each wedding tile (small chip at bottom-left with calendar icon).
- **File:** `src/components/AlbumDialog.tsx` — render `caption` as a date subline under the album title (currently shown above as small uppercase chip only when `item.client` present; show it always, with a `Calendar` lucide icon).

## 5. Fix "broken image at top left" after photographer upload

**Likely cause:** `defaultPhotographer.portrait` is a remote Unsplash URL; after upload, `ImageUpload` writes a CDN/S3 key. If the saved value isn't a full URL the `<motion.img src={resolveImageUrl(p.portrait)}>` in `src/components/sections/Photographer.tsx` still renders, but a stray broken `<img>` likely comes from somewhere else loading the same key without `resolveImageUrl`.

**Investigation step** (first action in build mode):

- Open the live site, identify which element renders the broken image at top-left, and which file outputs it. Most probable culprit is a logo/avatar in `Nav.tsx` or a stale reference in `HeroScene.tsx` pulling the photographer portrait.

**Fix:** ensure every `<img>` referencing photographer.portrait goes through `resolveImageUrl()`, and add an `onError` fallback to a placeholder so a missing image doesn't render a broken icon.

## 6. Per-photo hide/unhide

**Goal:** Admin can mark individual photos hidden; public site skips them.

- **Data shape change:** introduce a new field on `GalleryItem`: `hiddenPhotos?: string[]` (array of photo URLs to hide). Stored as JSON inside the same `gallery_items` row — **no DB migration** needed if we reuse `slideshow_photos` pattern; but cleanest is a new JSONB column. Plan: **add column `hidden_photos jsonb not null default '[]'**` via migration on `public.gallery_items`.
- **Admin (`GalleryEditor.tsx`):** add a second checkbox per photo row next to "Slideshow" labelled "Hidden". Toggling adds/removes the URL from `hiddenPhotos`. Add a visual dim on the row when hidden.
- **Store (`useGalleryStore.ts`):** map `hidden_photos` ↔ `hiddenPhotos` in read/write.
- **Public filtering (`AlbumDialog.tsx` + `Gallery.tsx`):** filter `photos`, `slideshowPhotos`, and the cover (if cover is hidden, fall back to first visible photo) by `!hiddenPhotos.includes(url)`.

## 7. Drag-and-drop photo order in admin

**Library:** `@dnd-kit/core` + `@dnd-kit/sortable` (lightweight, react-friendly).

- **Install:** `bun add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`.
- **File:** `src/components/admin/GalleryEditor.tsx` — wrap each album's photos list in `DndContext` + `SortableContext` (vertical list strategy). Each photo row becomes a `useSortable` item with a drag handle (grip icon on the left). On `onDragEnd`, reorder the `photos` array via `arrayMove` and call `update(i, { photos: next })`.
- **Optional extension:** also DnD the **albums themselves** so order can be set by drag (keeps existing up/down arrow buttons as a fallback — user requested arrows stay in album reorder, so we only add DnD inside an album, not for album order itself).

---

## Technical notes

- Migration adds `hidden_photos jsonb not null default '[]'` on `public.gallery_items` (no GRANT changes needed — table already has them).
- `site_content` already has anon-read + admin-write, so favourites need no migration beyond an initial insert (or just write on first save).
- Build order in implementation: (1) install dnd-kit → (2) DB migration for `hidden_photos` → (3) regenerate types → (4) refactor store/types → (5) editor + public-site changes → (6) Favourites + Hero + Showcase polish → (7) verify broken-image fix with Playwright.

## Out of scope

- No changes to album reorder arrows (kept per earlier instruction).
- No DB schema change for event date — reusing `caption`.