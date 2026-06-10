## Fix WebAssembly loading error for image uploads

The uploader is failing because `@jsquash` codecs request their `.wasm` binaries with bare relative paths, and Vite responds with `index.html` (hence the `3c 21 64 6f` = `<!do` magic word and wrong MIME).

### Change (single file: `src/lib/imagePipeline.ts`)

1. Import each codec's WASM binary through Vite's `?url` loader so the dev server serves the real `.wasm` with `application/wasm`:
   - `@jsquash/avif/codec/enc/avif_enc.wasm?url`
   - `@jsquash/webp/codec/enc/webp_enc.wasm?url`
   - `@jsquash/resize/lib/resize/squoosh_resize_bg.wasm?url`

2. Initialize each codec once per session with those explicit URLs before encoding/resizing:
   - `avifMod.init(undefined, { locateFile: () => avifEncWasm })`
   - `webpMod.init(undefined, { locateFile: () => webpEncWasm })`
   - `resize` module: call its init with the resize WASM URL
   Guard with a module-level promise so init runs only on first upload.

3. Keep using single-threaded encoders (no `_mt`) since COOP/COEP headers aren't configured.

No other files change. `vite.config.ts` stays as-is.

### Verification
- Trigger an admin upload and confirm the previous WASM magic-word error is gone, and that AVIF + WebP variants upload successfully.
