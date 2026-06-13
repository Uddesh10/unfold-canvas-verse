## Issue

In the album dialog (opened when you click an album card), photos are laid out in a CSS grid where every row stretches to the tallest image. Shorter portrait/landscape images in the same row leave grey `bg-muted` space below them — what you see at the ends in the screenshot.

## Fix

1. **`src/components/AlbumDialog.tsx`** — replace the fixed `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with a masonry-style CSS columns layout (`columns-1 md:columns-2 lg:columns-3` + `break-inside-avoid` on each tile), matching the masonry variant already used elsewhere in the site. Each tile then takes its image's natural height with no leftover space. Drop `bg-muted` and `object-cover` on tiles since the image now defines tile height.

2. **`src/pages/Admin.tsx`** — remove the "Tools" tab and its `MigrateGalleryPanel` content (also drop the now-unused import). The file `src/components/admin/MigrateGalleryPanel.tsx` and the `migrate-gallery` edge function can stay on disk (harmless, in case you ever need to re-run) — say the word if you'd rather I delete them too.

## Out of scope

No changes to upload pipeline, CDN, or any other gallery surface — only the in-album grid and the admin tab.
