## Problem

1. **Hero slides don't load.** `HeroScene.tsx` and the `HeroSlidesEditor` thumbnail render slides with `<img src={resolveImageUrl(slide.src)}>`. When `src` is a v:2 JSON string (e.g. `{"v":2,"id":"e9fdad3a…","ext":"webp",…}`), `resolveImageUrl` returns the JSON string as-is and the browser can't load it. The Weddings gallery works because it uses `PhotoImg`, which parses the JSON and resolves a signed Storage URL.

2. **Weddings gallery falls back to the original file.** `PhotoImg`'s `onError` handler swaps the resolved variant URL for `photoOriginalUrl(...)` whenever the `<img>` fails to load even once. The user wants the gallery (thumbnails + lightbox) to stay on the encoded WebP variants and never download the multi-MB original.

## Plan

### 1. Render hero slides through `PhotoImg`

**`src/three/HeroScene.tsx`** — replace the raw `<img>` with `PhotoImg` using the `full` variant so v:2 photos get signed and legacy URLs still resolve via the existing `parsePhoto` legacy branch.

```tsx
<PhotoImg
  photo={slides[i].src}
  variant="full"
  alt={slides[i].caption}
  className="absolute inset-0 h-full w-full object-cover"
  draggable={false}
/>
```

Drop the now-unused `resolveImageUrl` import.

**`src/components/admin/HeroSlidesEditor.tsx`** — replace the small preview `<img src={resolveImageUrl(it.src)} …>` with `<PhotoImg photo={it.src} variant="thumb" …>` so the admin list also renders v:2 thumbnails. Drop the unused import.

### 2. Stop auto-falling back to the original in `PhotoImg`

**`src/components/PhotoImg.tsx`** — remove the `triedFallback` / `photoOriginalUrl` branch from `onError`. The fallback was the only path that ever requested `{id}/original.{ext}` from the Weddings gallery; without it, the grid stays on `grid.webp` and the lightbox stays on `full.webp`. `onError` simply forwards to the caller's handler (if any).

The `photoOriginalUrl` export stays in `photoModel.ts` for future "download original" UI; it just won't be invoked by `PhotoImg` anymore.

### 3. Verification

- Open the home page → hero slide for the v:2 photo renders (network shows a signed request to `gallery/<id>/full.webp`), and the caption/dots still cycle.
- Admin → Hero carousel: the row thumbnails render the uploaded photo instead of a broken image.
- Weddings → open the gallery and the album/lightbox: requests go to `grid.webp` and `full.webp` only; no `original.*` request fires even if a variant 404s.
- Legacy Unsplash slides/photos (plain URL strings) keep rendering as before.

## Files touched

- `src/three/HeroScene.tsx`
- `src/components/admin/HeroSlidesEditor.tsx`
- `src/components/PhotoImg.tsx`

No backend, schema, or storage policy changes.
