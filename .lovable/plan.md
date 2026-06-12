## Goals

1. Replace browser-side image encoding + Lovable Cloud Storage with **S3 + Lambda + CloudFront**.
2. Migrate existing photos by re-uploading their **originals** to S3 so Lambda regenerates variants (single, consistent encoding path).
3. Fix lazy loading: images currently fetch eagerly because `PhotoImg` signs every v:2 URL on mount regardless of viewport, and `SlideshowImage` mounts every slideshow frame at once.

---

## Part A — AWS provisioning (you do in AWS console; I'll provide exact steps in chat)

You'll hand me 5 values when done: bucket name, region, CloudFront domain, IAM access key id, secret.

1. **S3 bucket** (e.g. `unfold-studios-gallery`), Block Public Access **ON**, CORS allowing `PUT/GET/HEAD` from your origins. Layout `gallery/{id}/original.{ext}` (client/migrator) → Lambda writes `gallery/{id}/{thumb|grid|full}.webp`.
2. **Lambda `gallery-encoder`** (Node 20, `sharp` layer, 1024 MB, 60 s). S3 ObjectCreated trigger with **suffix filter** on original extensions (`original.jpg|.jpeg|.png|.webp`) so it doesn't loop on its own outputs. I'll provide the full handler (`aws/lambda/index.mjs`) with the existing encoding params (480w q60, 1280w q70, 2400w q78) and `Cache-Control: public, max-age=31536000, immutable`.
3. **CloudFront** distribution, origin = bucket via **Origin Access Control**, `CachingOptimized` cache policy. Note the `*.cloudfront.net` domain.
4. **IAM user `gallery-uploader`** with `s3:PutObject` on `gallery/*`. Save key + secret.

---

## Part B — Backend (Lovable Cloud edge functions)

### B1. Secrets (via secrets tool)
`AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `CLOUDFRONT_DOMAIN`.

### B2. `supabase/functions/presign-upload/index.ts`
Admin-only (JWT verified + `has_role`). Input `{ ext, contentType }` → returns `{ id, url, key }` where `url` is a 5-min presigned PUT for `gallery/{id}/original.{ext}`. Signs with `aws4fetch` (zero-dep, Deno-friendly).

### B3. `supabase/functions/migrate-gallery/index.ts`
Admin-only, one-shot, idempotent, batched (~20/call, returns counts for progress).

For each known photo id (scan Lovable Cloud Storage `gallery/` prefix):
1. If S3 already has `gallery/{id}/original.*` → **skip** (idempotent).
2. Else try to fetch `gallery/{id}/original.{ext}` from Lovable Cloud Storage. If present → stream PUT to same S3 key. The S3 trigger fires Lambda → variants generated automatically.
3. If no original exists (legacy row that only has variants) → fall back to fetching `gallery/{id}/full.webp` and uploading it as `gallery/{id}/original.webp` so Lambda still has an input.
4. Return `{ batch, totalListed, migrated, skipped, failed: [{id, reason}] }`.

### B4. Cleanup migration (run later, after migration verified)
Drop `storage.objects` policies for the `gallery` bucket. Keep the Lovable Cloud bucket itself for now as safety net.

---

## Part C — Frontend

### C1. `src/lib/photoModel.ts`
- Add **v:3** photo shape (same fields as v:2, new version marker for CloudFront hosting).
- `CDN_BASE = import.meta.env.VITE_CLOUDFRONT_BASE`.
- New sync `photoUrlSync(input, variant)`:
  - v:3 → `${CDN_BASE}/gallery/${id}/${variant}.webp`.
  - legacy plain URL → returned as-is.
  - v:2 → returns empty string (will be resolved async via existing `photoUrl`).
- Keep async `photoUrl` for v:2 legacy back-compat.
- After migration is finished, you can also flip v:2 reads to CloudFront (add a feature flag — out of scope for first build).

### C2. `src/lib/imagePipeline.ts` — full rewrite
Remove `browser-image-compression` and all encoding. New `uploadViaEdge(file)`:
1. `supabase.functions.invoke('presign-upload', { body:{ ext, contentType } })` → `{ id, url }`.
2. `fetch(url, { method:'PUT', headers:{'Content-Type':contentType}, body:file })`.
3. Read dimensions client-side (existing helper).
4. Return `serializePhoto({ v:3, id, ext, w, h })`.

Remove `browser-image-compression` from `package.json`.

### C3. `.env` — add `VITE_CLOUDFRONT_BASE`.

### C4. `src/components/PhotoImg.tsx` — fix lazy loading

**Problem today:** `useEffect` triggers `photoUrl()` for every v:2 photo on mount, signing URLs and downloading bytes regardless of viewport. Native `loading="lazy"` only defers the network request once `src` is set; since we set src after signing, lazy loading is effectively bypassed for v:2. For v:3 we can use plain CloudFront URLs, so native lazy loading just works.

**Fix:**
- v:3 path: set `src` synchronously to the CloudFront URL → native `loading="lazy"` works as intended; no JS, no signing.
- v:2 path: gate the signing `useEffect` behind an `IntersectionObserver` (root-margin `200px`) attached to a wrapping `<picture>` (or the `img` itself via ref). Only sign + assign `src` once the image enters the viewport. Until then, render `<img>` with no `src` (or a tiny 1×1 placeholder) so layout is preserved.
- Add a small encoded-variant retry on `onError` (3 tries, 1.5 s backoff) so first render right after a fresh upload doesn't show broken for the ~2 s Lambda needs.
- Forward existing `loading` / `decoding` defaults unchanged.

### C5. `src/components/Gallery.tsx` — fix slideshow over-fetch
`SlideshowImage` currently mounts `<PhotoImg>` for **every** slideshow frame at once (just hidden via `opacity-0`). That triggers loads for all frames even if the user never hovers.

Fix: only render the **cover** photo and the **currently-active** slideshow frame; lazy-mount remaining frames after first hover. The aspect-spacer image stays (it only needs layout, native lazy still applies).

### C6. Admin one-shot migration button
Small button in Admin page → calls `migrate-gallery` in a loop until counts settle, shows toast progress. Removable later.

---

## Part D — Verification

1. Fresh upload from admin → network shows PUT to S3, then GET to CloudFront `gallery/{id}/full.webp` within ~2 s.
2. Open Weddings page with DevTools Network panel → only images in the viewport fetch. Scroll → new requests appear as items enter view.
3. Hover a slideshow card → additional frames load on demand.
4. Click migration button → CloudWatch shows one Lambda invocation per migrated original, S3 contains variant siblings, old photos render via CloudFront after refresh.
5. Bundle size drops (`browser-image-compression` gone, ~150 kB gzipped).
6. Lighthouse "Defer offscreen images" passes.

---

## Files touched (build phase)

**Created**
- `supabase/functions/presign-upload/index.ts`
- `supabase/functions/migrate-gallery/index.ts`
- `aws/lambda/index.mjs` + `aws/lambda/README.md` (deploy notes; not part of running app)

**Modified**
- `src/lib/imagePipeline.ts` (rewrite)
- `src/lib/photoModel.ts` (add v:3 + sync CDN URL)
- `src/components/PhotoImg.tsx` (sync v:3 src, IntersectionObserver-gated v:2 signing, retry-on-error)
- `src/components/Gallery.tsx` (`SlideshowImage` lazy-mounts non-active frames)
- `.env` (add `VITE_CLOUDFRONT_BASE`)
- `src/pages/Admin.tsx` (one-shot migration button)
- `package.json` (remove `browser-image-compression`)

No DB schema changes.
