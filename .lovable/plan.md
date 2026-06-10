## 1. Collapsible items in admin editors

Wrap each album/entry card in the admin editors with a collapsible header so the long list can be minimized to just the title row.

- **`GalleryEditor.tsx`** (used by Weddings, Spaces, Stories tabs): Each album card becomes a collapsible. Header row shows: small cover thumbnail, client name (or "Untitled"), caption, photo/video counts, plus the existing move-up/down/delete buttons and a chevron toggle. Body (cover upload, fields, photos list, videos, feedback) is hidden when collapsed. Default state: collapsed. Add "Expand all / Collapse all" buttons next to "Add album".
- Apply the same collapsible pattern to the other list-style editors so the request covers the whole admin area:
  - **`HeroSlidesEditor.tsx`** — collapse each slide row.
  - **`TestimonialsEditor.tsx`** — collapse each testimonial.
  - **`FaqEditor.tsx`** — collapse each Q&A.
  - **`SubmissionsViewer.tsx`** — collapse each submission entry.
- Use the existing Radix `Collapsible` primitive (`@/components/ui/collapsible`) with local `useState` per row for open/closed. No persistence across reloads (keeps it simple).

## 2. Click-to-zoom photos inside the wedding album popup

In `src/components/AlbumDialog.tsx` (the popup that opens when a user clicks a wedding album cover), make each photo inside the "Photographs" grid clickable to open a fullscreen lightbox.

- Reuse the existing `Lightbox` component (`src/components/Lightbox.tsx`) plus `useLightbox` hook.
- Build a lightweight `GalleryItem[]` from the album's `photos` array (fallback to `[item.src]` like today), pass to `Lightbox`.
- Clicking a thumbnail calls `open(idx)`; arrow keys / prev-next buttons already work inside `Lightbox`.
- Add `cursor-zoom-in` to the photo thumbnails for affordance.
- Videos remain unchanged (iframes already interactive).

## Out of scope

- No changes to the public Weddings page layout, reviews carousel, or data model.
- No persistence of collapsed/expanded state.
- No bulk actions beyond expand/collapse all in `GalleryEditor`.
