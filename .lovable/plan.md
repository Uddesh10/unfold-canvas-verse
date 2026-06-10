## Goal

Make admin image uploads fast and only commit them when the user clicks **Save changes**.

Two changes work together:

1. **Server-side image processing** via a new edge function (no more in-browser WASM).
2. **Deferred upload**: selected files stay local (object URLs) until Save runs.

---

## 1. Edge function: `process-image`

New function at `supabase/functions/process-image/index.ts`.

- Accepts `multipart/form-data` with a single `file` field (admin-only; verifies the caller has the `admin` role via `has_role`).
- Decodes the image and produces 6 derivatives — `thumb/grid/full` × `avif/webp` — using Deno-native image libs (`@jsquash/avif`, `@jsquash/webp`, `@jsquash/resize` via `npm:` specifiers). WASM runs server-side once per cold start, so the user's browser does no heavy work.
- Uploads all 6 blobs to the existing private `gallery` bucket under `{uuid}/{variant}.{ext}` using the service-role key.
- Creates 10-year signed URLs and returns the same `Photo` JSON shape currently produced client-side:
  ```json
  { "v":1, "id":"…", "thumb":{…}, "grid":{…}, "full":{…}, "w":…, "h":… }
  ```
- CORS enabled; rejects non-images and files over a sane size cap (e.g. 25 MB).

The current client `Photo` model and `PhotoImg` rendering stay unchanged, so galleries keep working without migration.

---

## 2. Defer upload until Save

Today `ImageUpload` calls `processAndUploadSerialized` immediately on file select. We change it so picking a file only stages it locally.

**New staging model in `ImageUpload`:**
- On file pick, create a local preview (`URL.createObjectURL`) and store the `File` object in component state.
- Call a new prop `onStage(file)` / `onStageMany(files)` instead of uploading.
- Render the preview from the object URL so the admin sees the image instantly.
- Show a small "Pending upload" badge on staged previews.

**Staging registry (`src/lib/pendingUploads.ts`, new):**
- A module-level `Map<string, File>` keyed by a temporary token like `pending:<uuid>`.
- `stageFile(file) -> token`, `getPending(token)`, `clearPending(token)`.
- The staged token is what we write into `GalleryItem.src` / `photos[]` in place of the final JSON. `parsePhoto` already treats unknown strings as legacy URLs, so renderers fall back gracefully; `PhotoImg` will be taught to recognize the `pending:` prefix and render the object URL preview.

**Save flow (`useGalleryStore.save`):**
- Before the existing delete+insert, walk every `GalleryItem` and collect all `pending:*` tokens across `src`, `photos[]`, `slideshowPhotos[]`.
- For each token, call the `process-image` edge function with the staged `File`, get back the `Photo` JSON string, and substitute it everywhere the token appeared (including slideshow flags).
- Uploads run with limited concurrency (e.g. 3 at a time) and surface a progress toast (`Uploading 4/12…`).
- If any upload fails, abort the save, keep the staged files, and show an error toast — nothing is written to the DB.
- On success, clear the pending registry and proceed with the existing DB write.

**Cover image and multi-photo upload** both flow through the same staging path; no other editors need to change.

---

## 3. Cleanup

- `src/lib/imagePipeline.ts` and the `@jsquash/*` client dependencies are no longer needed for uploads. We keep `imagePipeline.ts` only as a thin wrapper that calls the edge function (so callers don't change), and remove the WASM `?url` imports + `loadCodecs`.
- Client `package.json` keeps `@jsquash/*` only if still used elsewhere; otherwise they can be removed in a follow-up (not required for this change).

---

## Technical notes

- Edge function name: `process-image`. Deployed automatically; no `config.toml` edits required (default `verify_jwt = false`; we authenticate manually inside the function using the caller's JWT + `has_role`).
- Bucket `gallery` stays **private**. Signed URLs are generated server-side with a 10-year TTL (matches current behavior).
- Service-role key is read from `SUPABASE_SERVICE_ROLE_KEY` (already configured).
- Concurrency cap on the client prevents browser/network overload when saving an album with many staged photos.
- No DB schema changes.

---

## Files

- **New**: `supabase/functions/process-image/index.ts`
- **New**: `src/lib/pendingUploads.ts`
- **Edit**: `src/lib/imagePipeline.ts` — replace WASM pipeline with `uploadViaEdge(file)` calling the function.
- **Edit**: `src/components/admin/ImageUpload.tsx` — stage files locally instead of uploading; render previews from object URLs.
- **Edit**: `src/components/PhotoImg.tsx` — render `pending:*` tokens via their object URL preview.
- **Edit**: `src/hooks/useGalleryStore.ts` — resolve all pending tokens via the edge function during `save()` before the DB write.
- **Edit**: `src/components/admin/GalleryEditor.tsx` — minor: pass through staged tokens unchanged (no logic change beyond what `ImageUpload`'s new API requires).

## Verification

- Pick a cover photo + several album photos → previews appear instantly, nothing in network tab yet.
- Click Save → progress toast shows N uploads, each hits `process-image`, DB row is written with final `Photo` JSON.
- Gallery page renders the new photos via existing AVIF/WebP `<picture>`.
- Reload admin: staged previews are gone (expected), saved photos persist.
