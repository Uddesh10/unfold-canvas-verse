# Plan — 9 site & admin updates

## 1. Open Sans everywhere
- Add Google Font Open Sans link in `index.html`.
- In `tailwind.config.ts` set both `font-sans` and `font-display` to `Open Sans`.
- Keep `italic` utility usage as-is (Open Sans has an italic variant).

## 2. Remove Weddings hero entirely
- In `src/pages/Weddings.tsx`, delete the hero `<section>` (carousel image, title, dots, slide state, `useEffect`).
- Page now starts directly with the photo grid. Move the "Where vows become forever" title (if desired) into a small heading above the grid? — **No**: remove hero entirely per answer; page opens straight into masonry grid under the existing Nav.

## 3. Replace URL fields with file upload (admin)
- Create a public Lovable Cloud storage bucket `gallery` with public read + admin write RLS on `storage.objects`.
- Build a reusable `<ImageUpload>` component (admin only): drag/drop or file picker → `supabase.storage.from('gallery').upload(...)` → returns public URL → stored in the same DB column previously holding a URL.
- Replace URL `<Input>` fields with `<ImageUpload>` in:
  - `GalleryEditor.tsx` (cover image + photos[] list)
  - `HeroSlidesEditor.tsx`
  - `PhotographerEditor.tsx`
  - `ShowcaseEditor.tsx`
- Videos list stays as URL input (YouTube/Vimeo embeds).
- `resolveImageUrl` keeps working for any legacy Drive/URL values still in DB.

## 4. Album dialog: wider layout + reorder
- In `AlbumDialog.tsx`:
  - Change container from `max-w-5xl` + `px-6 py-20` to `max-w-[1600px]` + `px-4 py-10` (full-screen feel, less padding).
  - Reorder sections: **Reviews (feedback) → Videos → Photos**.
  - Photo grid: 2 → 3 columns on `lg` for tighter packing.

## 5. Slideshow "featured" flag
- Add `slideshow` boolean array OR per-photo flag. Simplest: add a `slideshow_photos jsonb` column (array of indexes or URLs) — chosen approach: extend each photo to allow selection.
- **Implementation**: add `slideshow_photos jsonb default '[]'` column to `gallery_items`. If empty, fall back to first photo only (no slideshow). If populated, those URLs cycle on hover.
- `Gallery.tsx` `SlideshowImage`: use `item.slideshowPhotos` when present, else `[item.src]` (no cycle).
- Remove the small white progress bars at the bottom of the hover card.
- Admin `GalleryEditor.tsx`: for each photo in the album, add a checkbox "Show in slideshow" that toggles its URL in `slideshow_photos`.

## 6. Browser Back closes album popup (all verticals)
- In `AlbumDialog.tsx`, on open: `history.pushState({ album: true }, '')`; on `popstate` → call `onClose()`.
- On manual close, if current history state has `album: true`, call `history.back()` instead of just closing, so URL stays clean.
- Applies to Weddings, Spaces, Stories automatically since they all use `<AlbumDialog>`.

## 7. Fix hero carousel default-image flash
- In `useHeroSlidesStore`, expose `loading` flag (already returns items, add `ready` boolean).
- In `src/components/sections/Hero.tsx`: while `!ready`, render nothing (or a blank background) instead of the fallback default. Only mount carousel images once DB load completes.

## 8. Hero: remove vertical pills from carousel; add as top bar
- In `Hero.tsx`, remove the inline `Weddings / Architecture / Street` buttons currently inside the carousel area.
- Add a horizontal bar **below** the hero section (styled identically to the Weddings page sub-nav: small uppercase tracked text, primary underline on active) linking to `/weddings`, `/spaces`, `/stories`.
- Reuse the existing Weddings sub-bar styles for visual parity.

## 9. Renumber homepage sections
- In `src/pages/Index.tsx`, ensure section labels read:
  - 01 The Studio, 02 Process, **03 Begin**, **04 Common Questions**, 05 Founder (or current order with Begin=03, Questions=04). Update the small "0X" eyebrow labels in `Booking.tsx` and `Faq.tsx` accordingly.

---

## Technical: DB migration
```sql
ALTER TABLE public.gallery_items
  ADD COLUMN slideshow_photos jsonb NOT NULL DEFAULT '[]'::jsonb;
```
Plus a storage bucket `gallery` (public) with policies:
- public SELECT on `gallery` bucket
- authenticated INSERT/UPDATE/DELETE gated by `has_role(auth.uid(), 'admin')`

## Files touched
- `index.html`, `tailwind.config.ts`
- `src/pages/Weddings.tsx`, `src/pages/Index.tsx`
- `src/components/AlbumDialog.tsx`, `src/components/Gallery.tsx`
- `src/components/sections/Hero.tsx`, `src/components/sections/Booking.tsx`, `src/components/sections/Faq.tsx`
- `src/components/admin/ImageUpload.tsx` (new), `GalleryEditor.tsx`, `HeroSlidesEditor.tsx`, `PhotographerEditor.tsx`, `ShowcaseEditor.tsx`
- `src/hooks/useGalleryStore.ts`, `useHeroSlidesStore.ts`
- New migration + new storage bucket `gallery`
