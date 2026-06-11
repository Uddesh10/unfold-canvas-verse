## Goal

Remove the `process-image` edge function entirely. The client uploads originals directly to the `gallery` bucket and renders variants via Supabase Storage Image Transformations.

## Why this works

- The `gallery` bucket already has RLS that allows admins to INSERT/UPDATE/DELETE and anyone to SELECT (migration `20260607102210_*`).
- Admin auth happens client-side already; Supabase enforces the RLS check on upload.
- No server compute → no 546 memory errors, no signed-URL TTL management, no cold starts.

## Changes

### 1. Flip `gallery` bucket to public

Required so we can use `getPublicUrl(..., { transform })` without signing. RLS for writes remains admin-only (public buckets still respect INSERT/UPDATE/DELETE policies; only SELECT is bypassed, which the existing policy already permitted).

### 2. Rewrite `src/lib/imagePipeline.ts`

Replace `uploadViaEdge(file)` with a direct Storage upload:

- Generate `${uuid}/original.${ext}` path.
- `supabase.storage.from('gallery').upload(path, file, { contentType, upsert: false })`.
- Return a serialized v:2 Photo: `{ v:2, id, path, ext, w:0, h:0 }` — **no URLs stored**. Variants are computed at render time.

### 3. Update `src/lib/photoModel.ts`

v:2 stores only `{ v, id, path, ext, w, h }`. Drop the embedded `thumb/grid/full` URL objects from v:2 (still kept on v:1 for back-compat). Add a helper `photoUrl(photo, variant)` that calls `supabase.storage.from('gallery').getPublicUrl(path, { transform: { width, resize:'contain', quality } })` with the per-variant spec (thumb 480/q60, grid 1280/q70, full 2400/q78).

### 4. Update `src/components/PhotoImg.tsx`

For v:2, call `photoUrl(photo, variant)` to get the transform URL on render. v:1 and legacy branches unchanged.

### 5. Delete the edge function

- Remove `supabase/functions/process-image/` directory.
- Call `supabase--delete_edge_functions(["process-image"])` to remove the deployed function.

### 6. `resolvePending.ts`

No structural change — it still walks values and replaces `pending:*` tokens by calling the new `uploadViaEdge` (now a direct Storage upload). Rename optional; keep the export name to avoid touching `useSiteContent.ts` and `useGalleryStore.ts`.

## Back-compat

- Remove all backward compatibility this change will be latest

## Technical notes

- Public bucket may be blocked by `cloud_block_public_buckets`. If `storage_update_bucket` errors, fall back to keeping the bucket private and using `createSignedUrl(path, TTL, { transform })` from the **client** on demand, cached per session. Same end result, slightly more code.
- Storage image transforms only emit WebP/JPEG (no AVIF) — acceptable; covers all modern browsers via content negotiation.
- Max upload size is the bucket's default (50MB). Validate `≤25MB` and `image/*` mime client-side before upload.

## Verification

1. Showcase admin → replace a slide → Save. Network shows a single `PUT` to `/storage/v1/object/gallery/...` (no function invoke). DB row has v:2 JSON with `path`.
2. Reload page → image requests go to `/storage/v1/render/image/public/gallery/<path>?width=...` and return WebP.
3. Old v:1 rows still render.
4. Edge functions list no longer contains `process-image`.