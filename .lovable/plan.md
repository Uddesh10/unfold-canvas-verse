# Restore previous grid look + raise upload cap

## 1. Grid tile shape (Weddings / masonry variant)

The screenshot shows the previous look: **landscape tiles** (~16:10), 3 across on desktop, with a small gap. Current code uses `aspect-[4/5]` (portrait), which is why the tiles now look tall.

Change in `src/components/Gallery.tsx` (masonry branch only):

- Tile aspect: `aspect-[4/5]` → `aspect-[16/10]` to match the reference screenshot.
- Keep the row-wise grid: `grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4` (mobile stays 2-per-row as previously requested).
- Keep `rounded-2xl` and infinite scroll (24 at a time) untouched.

No change to the `grid` variant or `AlbumDialog` (inside-album tiles stay as they are — user only flagged the outer Weddings grid).

## 2. Upload size cap → 50 MB

In `src/lib/imagePipeline.ts`:

- `MAX_BYTES = 25 * 1024 * 1024` → `50 * 1024 * 1024`
- Error message text: `(max 25MB)` → `(max 50MB)`

The presign edge function and S3 PUT don't enforce a smaller limit, so no backend change is needed.

## Files touched

- `src/components/Gallery.tsx` — one className change in the masonry branch.
- `src/lib/imagePipeline.ts` — constant + error string.
