## Problem

`pending:…` tokens are being persisted to the DB (e.g. in Showcase: `src: "pending:520ba…"`). The edge function `process-image` is healthy and deployed, but it's never called because only `useGalleryStore.save()` resolves staged tokens. All other admin editors save via `useSiteContent`, which writes the raw value untouched.

## Fix

Move pending-token resolution into a single shared helper and apply it everywhere we save, so any editor using `ImageUpload` benefits automatically.

### 1. New shared helper — `src/lib/resolvePending.ts`

- Export `async function resolveAllPending<T>(value: T): Promise<T>`.
- Deep-walks any value (object / array / string), collects every string with the `pending:` prefix, uploads each staged `File` once via `uploadViaEdge`, then returns a structurally identical value with every token replaced by the serialized `Photo` JSON.
- Concurrency limit of 3, progress toast (`Uploading N/M photos…`), error toast on failure (re-throws so the caller can abort the save).
- Calls `clearPending(token)` for each successfully uploaded token.
- If a token has no staged file (e.g. registry lost on reload), throw a clear error: "Staged image missing — please re-select".

### 2. `src/hooks/useSiteContent.ts`

In `save()`, before writing to the DB:

```ts
const resolved = await resolveAllPending(valueRef.current);
setValue(resolved);
// then upsert `resolved` instead of the raw value
```

This single change covers Showcase, Hero slides, Photographer, and any future editor built on `useSiteContent`.

### 3. `src/hooks/useGalleryStore.ts`

Replace the local `resolvePendingTokens(items)` with a call to the shared helper:

```ts
const resolved = await resolveAllPending(ref.current);
```

Remove the now-duplicate logic.

### 4. Verification

- Open Showcase admin, replace a slide image, click Save.
- Network tab: a `POST /functions/v1/process-image` request fires per staged file.
- DB row: `src` is the serialized `Photo` JSON (`{"v":1,"id":…}`), no more `pending:` strings.
- Same check for Hero slides, Photographer, and Gallery editors.
- Edge function logs (`process-image`) show successful invocations.

## Files

- **New**: `src/lib/resolvePending.ts`
- **Edit**: `src/hooks/useSiteContent.ts` — resolve pending tokens before DB write.
- **Edit**: `src/hooks/useGalleryStore.ts` — delegate to shared helper.

No edge-function changes needed; `process-image` is already deployed and working.
