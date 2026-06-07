## Goal

Let admins upload multiple images at once in the admin section (currently `ImageUpload` only accepts a single file).

## Where it matters most

The "Photos in album" list inside `GalleryEditor` is the main pain point — admins add photos one-by-one. Other spots (`HeroSlidesEditor`, `ShowcaseEditor`, `PhotographerEditor`, cover image in `GalleryEditor`) are inherently single-image and stay single.

## Plan

1. **Extend `ImageUpload**` (`src/components/admin/ImageUpload.tsx`)
  - Add an optional `multiple` prop (default `false`) and an optional `onUploadMany?: (urls: string[]) => void` callback.
  - When `multiple` is on: set `<input multiple />`, upload all selected files in parallel to the `gallery` bucket, create signed URLs for each, then call `onUploadMany` with the resulting array.
  - Keep single-file behaviour unchanged when `multiple` is not set.
  - Show progress like "Uploading 3/8…" and a toast summary at the end (with per-file error handling so one failure doesn't block the rest).
2. **Add a "Bulk upload" control to `GalleryEditor**` (`src/components/admin/GalleryEditor.tsx`)
  - Next to the existing "+ Photo" button on each album, add an "Upload multiple" button using the extended `ImageUpload` in `multiple` mode.
  - On completion, append the returned URLs to that album's `photos` array (slideshow flags untouched; admins can tick them after).
3. **No DB / schema / RLS changes.** Storage bucket, policies, and signed-URL flow already support this.

## Out of scope

- Drag-and-drop reordering of uploaded photos (existing single up/down arrows still apply if we add them later).
- Auto-marking newly uploaded photos as slideshow.
- Bulk upload on hero/showcase/portrait editors (single-image by design).

## Technical notes

- Concurrency: `Promise.allSettled` over the file list so partial failures still return successful URLs.
- Signed URL TTL: reuse the existing `SIGNED_TTL` constant.
- File validation: skip non-image files with a toast, same rule as today.