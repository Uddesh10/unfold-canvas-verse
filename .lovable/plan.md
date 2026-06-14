## Change

In `src/components/AlbumDialog.tsx`, change the Photographs section from a uniform grid to a CSS-columns masonry layout (similar to before) so portrait/landscape photos keep their natural aspect ratios.

### Edits (Photographs block only)

- Replace container `grid grid-cols-2 lg:grid-cols-3 gap-3` with `columns-2 lg:columns-3 gap-3 [column-fill:_balance]`.
- Each tile:
  - Remove `aspect-[4/5]` and fixed-height behavior.
  - Add `mb-3 break-inside-avoid inline-block w-full` so items don't split across columns.
  - `PhotoImg` becomes `block w-full h-auto object-cover` (natural aspect ratio).
- Keep: infinite scroll sentinel (24 per page), lightbox open on click, fade-in motion, rounded corners, hover opacity.

No other files touched. Wedding grid (`Gallery.tsx`) and admin remain unchanged.
