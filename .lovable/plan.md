## Problem

The `process-image` edge function hits **546 Memory limit exceeded**. The `@jsquash` WASM codecs decode the full image to raw RGBA in memory, then encode 3 sizes × 2 formats = 6 derivatives. For a 10MB JPEG that's ~100MB+ of raw pixels plus WASM heap — well over the 150MB edge-runtime cap.

WASM-based encoding on the edge is the wrong tool here. The fix is to stop encoding server-side and let Supabase Storage's built-in image transformation CDN do the resizing on demand.

## Plan

### 1. Rewrite `supabase/functions/process-image/index.ts`
Strip out all `@jsquash` / `resize` imports and logic. New flow:
- Verify auth + admin role (unchanged).
- Validate file (image mime, ≤25MB).
- Upload the **original** to `gallery/{uuid}/original.{ext}` via service role.
- Return a serialized `Photo` JSON that points at the original path (not signed URLs), e.g.
  ```json
  { "v": 2, "id": "...", "path": "uuid/original.jpg", "ext": "jpg" }
  ```
- No decode, no encode, no resize — peak memory ≈ file size only.

### 2. Client-side URL builder — update `src/lib/imageUrl.ts` (and `PhotoImg.tsx` as needed)
Resolve a `Photo` to a rendered URL using Supabase Storage's transform API:
```ts
supabase.storage.from('gallery').createSignedUrl(path, TTL, {
  transform: { width, height, resize: 'cover', quality, format: 'origin' }
})
```
Variant sizing stays the same (thumb 480 / grid 1280 / full 2400). Storage returns WebP automatically to browsers that send `Accept: image/webp`. AVIF is dropped (Storage transforms don't emit AVIF today); WebP+original fallback covers all modern browsers.

Cache signed-transform URLs in memory per session so we don't re-sign on every render.

### 3. Back-compat for already-stored photos
Existing rows store the v1 shape (`thumb/grid/full` with pre-signed avif+webp URLs). Keep the old resolver path: if `photo.v !== 2`, render as today. New uploads write v2 and use the transform CDN.

### 4. No changes needed to
- `resolvePending.ts`, `pendingUploads.ts`, `ImageUpload.tsx`, `useSiteContent.ts`, `useGalleryStore.ts` — they only care about the serialized string the edge function returns.

## Technical notes

- The `gallery` bucket stays private; transformed images are fetched via signed URLs that include the `transform` query (Storage validates the signature includes the transform params).
- Storage image transforms require the project's image-transformation add-on to be enabled (Lovable Cloud has it on by default for the `gallery`-style buckets).
- Memory after this change: edge function only buffers the upload → roughly the file size, well under 150MB even for 25MB inputs.
- Speed: one upload per image instead of 6 + WASM work. Expect ~3–10× faster Saves.

## Verification

1. Open Showcase admin, replace one slide, click Save → single `process-image` invocation succeeds (no 546), DB row has `v:2` JSON.
2. Page reload → `PhotoImg` renders via Storage transform URL; Network shows `image/webp` for the thumb/grid variants.
3. Old v1 rows still render correctly.
