## Strategy

External Supabase project has **no Image Transformations add-on**, so we generate variants **in the browser at upload time** using `browser-image-compression` and store each variant as its own object. At render time we just sign the right pre-generated file — no transform endpoint needed.

## 1. Second Supabase client (external storage project)

New file `src/integrations/supabase/storageClient.ts`:

- Reads `VITE_STORAGE_SUPABASE_URL` and `VITE_STORAGE_SUPABASE_ANON_KEY` from env.
- Exports `storageSupabase` — used **only** for `storage.from('gallery')` calls.
- Existing `@/integrations/supabase/client` stays untouched for DB/auth.

You'll add those two env values after the plan is approved (publishable anon key is safe in code).

## 2. Browser encoding pipeline

Rewrite `src/lib/imagePipeline.ts`:

- Use `browser-image-compression` (pure JS, no wasm fetch issues).
- On upload, produce variants in parallel:
  - `thumb` — 480w, q0.60, WebP
  - `grid` — 1280w, q0.70, WebP
  - `full` — 2400w, q0.78, WebP
  - `original.jpg` — untouched JPEG fallback (for downloads / WebP-rejecting contexts)
- Upload all 4 to `gallery/{id}/{variant}.webp` (+ `original.jpg`) concurrently (limit 3).
- Surface progress in the existing toast.
- Persist v:2 JSON: `{ v:2, id, ext:"webp", w, h }` — `path` no longer needed; variant filenames are deterministic from `id`.

## 3. Render model

`src/lib/photoModel.ts`:

- `photoUrl(photoStr, variant)` signs `gallery/{id}/{variant}.webp` via `storageSupabase.storage.from('gallery').createSignedUrl(path, 7d)`.
- Session cache keyed by `id|variant` (already in place).
- Legacy plain-URL branch unchanged (seed/Unsplash images keep working).
- `PhotoImg.tsx` `onError`: retry once with `original.jpg` before giving up.

## 4. UI/admin tweaks

- `ImageUpload.tsx`: per-file progress (encoding → uploading).
- No changes to `Gallery.tsx`, `useSiteContent.ts`, or RLS.

## 5. Dependencies

- `browser-image-compression` (~30KB gz).

## What you'll need to provide

1. External Supabase project's **URL** and **anon (publishable) key** → `VITE_STORAGE_SUPABASE_URL` / `VITE_STORAGE_SUPABASE_ANON_KEY`.
2. Confirm the bucket name is `gallery` in the external project (or tell me the actual name).
3. Confirm the external project has RLS policies on `storage.objects` allowing **admins to insert** and **public (or authenticated) to select** for that bucket — if not, I'll provide the SQL for you to run there.

## Why this beats the alternatives

| Approach | Cost | Latency | Complexity |
|---|---|---|---|
| **Browser-encode + multi-upload (this plan)** | $0 | Fast (signed-URL caching) | Medium upload work, simple render |
| Enable Image Transformations add-on | $ monthly | Fast | Trivial code |
| External CDN (Cloudflare Images, imgproxy) | $ per image | Fast | Extra infra |
| Runtime browser-resize on read | $0 | Slow, re-does work every view | Bad UX |

## Verification

1. Admin uploads a photo → Network shows 4 PUTs to `/storage/v1/object/gallery/<id>/...`, DB row is v:2 JSON.
2. Reload `/` → grid loads 1280w WebP (~80–150KB), lightbox loads 2400w.
3. Legacy Unsplash/Drive URLs still render unchanged.
