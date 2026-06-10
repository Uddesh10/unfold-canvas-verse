## Goal

Cut storage + egress for 2000+ wedding photos (10–20 MB each) by compressing on upload, generating multiple size variants, serving the right size in the right place, and lazy-loading + paginating the album view.

## Format choice — AVIF + WebP fallback

- **AVIF**: ~50% smaller than JPEG at equal quality. Native in Chrome, Edge, Firefox, Safari 16+.
- **WebP** fallback for the small slice of older Safari users.
- Served via `<picture>` with `<source type="image/avif">`, `<source type="image/webp">`, and the WebP source as the `<img>` fallback.
- Browser-side encode using `@jsquash/avif` + `@jsquash/webp` + `@jsquash/resize` (WASM, no server work — fits Lovable Cloud).

## Size variants generated per upload

| Variant | Long edge | Quality | Used in                              |
|---------|-----------|---------|--------------------------------------|
| thumb   | 480 px    | 55      | Admin previews, grid hover slideshow |
| grid    | 1280 px   | 65      | Public gallery grid, album dialog    |
| full    | 2400 px   | 72      | Lightbox / fullscreen view           |

Each variant in both AVIF and WebP → **6 files per upload**. Expected total per photo ≈ 600 KB–1.5 MB vs 15 MB original → roughly **10× storage + egress reduction**.

Originals are **not** kept (they would defeat the purpose). Admin UI will warn before upload.

## Storage layout

Existing `gallery` bucket, new prefix per photo:
```
{uuid}/thumb.avif   {uuid}/thumb.webp
{uuid}/grid.avif    {uuid}/grid.webp
{uuid}/full.avif    {uuid}/full.webp
```

## DB shape

No schema change. `photos text[]` keeps storing strings — each new entry is a JSON-encoded blob:
```json
{"id":"uuid","thumb":{"avif":"…","webp":"…"},"grid":{…},"full":{…},"w":2400,"h":1600}
```
A `parsePhoto(str)` helper returns either the parsed object or a legacy `{ src: str }` for old plain-URL entries, so existing 2000+ photos keep working untouched.

## Lazy loading

- All photo `<img>` already use `loading="lazy"`. Add `decoding="async"` and explicit `width`/`height` (from stored `w`/`h`) so the masonry/grid doesn't shift as images decode.
- Switch each `<img>` to a small `<PhotoImg>` component that emits `<picture>` with AVIF/WebP sources and the correct variant for its context.

## Album dialog — infinite scroll

- Render first **24** photos immediately.
- IntersectionObserver sentinel at the bottom triggers loading the next 24 as the user scrolls.
- Lightbox still receives the full photo list so prev/next/keyboard navigation spans every photo, not just the loaded slice.
- Grid uses the `grid` variant; opening lightbox swaps to `full`.

## Files to add / change

**New**
- `src/lib/imagePipeline.ts` — pick file → decode → resize to 3 sizes → encode AVIF + WebP → upload all 6 to `gallery` bucket → return serialized photo JSON. Progress callback for the admin UI.
- `src/lib/photoModel.ts` — `Photo` type, `parsePhoto`, `serializePhoto`, `pickVariant(photo, "thumb"|"grid"|"full")`.
- `src/components/PhotoImg.tsx` — `<picture>` wrapper with AVIF/WebP/legacy sources, `loading="lazy"`, `decoding="async"`, intrinsic width/height.

**Changed**
- `src/components/admin/ImageUpload.tsx` — route uploads through `imagePipeline`; show "Compressing… / Uploading…" progress; emit serialized photo strings.
- `src/components/admin/GalleryEditor.tsx` — display admin thumbnails via `PhotoImg` (`thumb` variant); store serialized strings in `photos[]`.
- `src/components/Gallery.tsx` — `SlideshowImage` uses `PhotoImg` with `thumb` for cover, `grid` for hovered slideshow frames.
- `src/components/AlbumDialog.tsx` — paginated render (24 at a time, IntersectionObserver sentinel), `PhotoImg` with `grid` variant.
- `src/components/Lightbox.tsx` — `PhotoImg` with `full` variant.
- `src/lib/imageUrl.ts` — pass-through for object-shaped photos (only normalize legacy URL strings).

**Not changed**
- Database schema (`gallery_items` table, `photos text[]` column).
- Storage bucket (`gallery`, still private + signed URLs).
- The existing 2000+ photos — they keep serving from their current URLs via the legacy code path. (No re-processing.)

## Dependencies to add

- `@jsquash/avif`
- `@jsquash/webp`
- `@jsquash/resize`

All MIT, WASM-based, ~1.5 MB total — loaded only inside the admin route, dynamically imported so they don't bloat the public bundle.

## Expected impact

- **New** uploads: ~10× smaller in storage + egress vs originals.
- Public pages serve `grid` (≈150–300 KB) instead of full originals (≈15 MB) → enormous bandwidth win even before counting AVIF.
- Lightbox uses `full` only when opened, not preloaded.
- Album dialog renders 24 images at a time instead of all N at once.

## Out of scope

- Re-processing the existing 2000+ photos (per your choice — leaving them as-is).
- CDN in front of Supabase Storage (revisit if egress is still high after rollout).
- Blurhash / LQIP placeholders.
