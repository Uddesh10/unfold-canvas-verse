## Plan

### 1. Infinite scroll on the Weddings album grid (24 at a time)
**`src/components/Gallery.tsx`** — Add pagination state to the `masonry` variant (used by Weddings):
- `const [visible, setVisible] = useState(24)`
- Render `items.slice(0, visible)` instead of `items`
- Add a sentinel `<div ref={sentinelRef}>` after the grid; an `IntersectionObserver` with `rootMargin: "600px"` bumps `visible` by 24 until all items are shown
- Reset `visible` to 24 when `items` changes

(Grid and collage variants are left alone since you didn't ask for changes there.)

### 2. Mobile = 2 albums per row (row-wise, not column-wise)
The current masonry uses CSS `columns-*`, which fills **column-by-column** (top-to-bottom, then next column). Switching to a real CSS Grid gives row-wise filling like Google Drive.

**`src/components/Gallery.tsx` (masonry variant)** — Replace `columns-1 sm:columns-2 lg:columns-3` with:
```
grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4
```
Each tile becomes a uniform `aspect-[4/5]` card with `object-cover` so rows are even (matches the existing "grid" variant look). Remove the `mb-4 break-inside-avoid` wrapper class.

**`src/components/AlbumDialog.tsx` (inside an album)** — Same change: replace `columns-1 md:columns-2 lg:columns-3` with `grid grid-cols-2 lg:grid-cols-3 gap-3` and switch each tile to an `aspect-[4/5]` `object-cover` card. This gives 2-per-row on mobile and fills row-wise.

> Note: this trades the variable-height masonry look for a clean Google-Drive-style uniform grid. If you'd rather keep variable heights but force row-wise filling on mobile, say the word and I'll use a JS-balanced masonry instead.

### 3. Browser tab title
**`index.html`** — `<title>Unfold Studios</title>` and update the matching `og:title`.
**`src/pages/Index.tsx`** — `<Seo title="Unfold Studios" … />` so the home route doesn't override it.

### 4. 404 on reload on Vercel (SPA fallback)
React Router + Vercel needs a rewrite so every path serves `index.html`. Add **`vercel.json`** at the project root:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
Redeploy on Vercel; reload/deep links will then work for `/weddings`, `/admin`, etc.

### 5. Album ordering
No change — keep the existing up/down arrows as-is (per your instruction).

### Files touched
- `src/components/Gallery.tsx`
- `src/components/AlbumDialog.tsx`
- `index.html`
- `src/pages/Index.tsx`
- `vercel.json` (new)
