## Plan — Hero recolor + new showcase element + local admin

### 1. New hero color theme (no gold)
Update default `:root` palette in `src/index.css` to a richer, more "happening" cinematic scheme — deep midnight indigo background with **magenta → violet → cyan aurora** accents.

- `--background`: `240 25% 6%`
- `--theme-1`: magenta `320 90% 62%`
- `--theme-2`: violet `265 85% 65%`
- `--theme-3`: cyan `190 95% 60%`
- `--gradient-hero`: aurora radial gradients
- `--gradient-text`: magenta → cyan
- `HeroScene.tsx`: swap warm directional light for magenta + cyan rim lights; glow planes use new theme colors
- Per-vertical themes (`weddings`, `spaces`, `stories`) untouched

**Keep** the three pill buttons + "Est. 2016" tag in the hero — only the colors change.

### 2. Replace the big "Three perspectives" boxes
Remove the three large 3:4 cards on the home page and replace with a new eye-catching element:

**A horizontal cinematic showcase strip** — full-bleed, edge-to-edge, with:
- A single large tilted photo "stage" in the center that auto-cycles through one signature image per vertical (cross-fade every ~4s)
- Big rotating display number (01 / 02 / 03) and vertical name overlaid
- A thin progress bar showing cycle position
- Left/right arrow controls + clickable thumbnail dots
- Subtle parallax tilt on mouse move (CSS transform, no Three.js)
- Click the stage → navigates to that vertical
- Below: a single-line marquee of project keywords ("Tuscany · Milan · Shinjuku · 02:14 · Veil · Marble · Neon …") drifting slowly

This replaces the grid with one bold, animated, cinematic moment.

### 3. Photographer info section
New section between Hero and the new showcase:
- Left: portrait (Unsplash placeholder)
- Right: name, role, 2–3 paragraph bio, location, signature, IG/Behance/Email icons
- Stat row: "200+ weddings · 14 countries · 9 years"
- Data lives in `src/data/photographer.ts` (also editable from admin)

### 4. Local admin page (no backend)
A `/admin` route, password-gated entirely client-side. No Supabase, no server.

**Auth (client-only):**
- Hard-coded password constant in code (e.g. `unfold2026`) — user can change it in one place.
- `/admin/login` form: enter password → on match, sets `sessionStorage.adminAuthed = true` → redirect to `/admin`.
- `RequireAdmin` guard checks the flag; otherwise redirects to login.
- "Logout" clears the flag.
- ⚠️ Honest caveat surfaced in the plan: client-side passwords can be read in the bundle by anyone determined. Fine for personal portfolio gating, not real security. If real security is needed later, switch to Lovable Cloud auth.

**Storage:**
- All edits persisted to `localStorage` under `unfold:gallery:weddings`, `unfold:gallery:spaces`, `unfold:gallery:stories`, and `unfold:photographer`.
- On first load, store is seeded from the existing defaults in `src/data/galleries.ts` and `src/data/photographer.ts`.
- A `useGalleryStore(vertical)` hook (tiny custom store w/ `useSyncExternalStore`) gives reactive reads + writes; gallery pages and the home showcase use it.

**Admin UI (`/admin`):**
- Tabs: **Weddings · Spaces · Stories · Photographer**
- Each gallery tab: list rows with thumbnail preview, image URL input, alt text, caption, ↑/↓ reorder, delete, "+ Add photo" button
- Photographer tab: name, role, bio (textarea), portrait URL, location, IG/email links, stats fields
- "Reset to defaults" button per tab
- "Export JSON" / "Import JSON" buttons so the user can back up or move data between browsers (since it's localStorage-only)
- Toast feedback on save

### Technical section

**Files to create**
- `src/components/sections/Showcase.tsx` (new cinematic strip replacing the 3 boxes)
- `src/components/sections/Photographer.tsx`
- `src/data/photographer.ts`
- `src/lib/adminAuth.ts` (password constant + session helpers)
- `src/lib/localStore.ts` (typed localStorage helpers + subscribe)
- `src/hooks/useGalleryStore.ts`, `src/hooks/usePhotographerStore.ts`
- `src/components/RequireAdmin.tsx`
- `src/pages/Admin.tsx`, `src/pages/AdminLogin.tsx`
- `src/components/admin/GalleryEditor.tsx`
- `src/components/admin/PhotographerEditor.tsx`

**Files to edit**
- `src/index.css` — new aurora palette (default theme only)
- `src/three/HeroScene.tsx` — magenta/cyan lighting
- `src/pages/Index.tsx` — drop the old grid section, mount `<Photographer />` and `<Showcase />`
- `src/pages/Weddings.tsx`, `Spaces.tsx`, `Stories.tsx` — read photos via `useGalleryStore`
- `src/App.tsx` — add `/admin` and `/admin/login` routes

**No backend, no new dependencies.**

### Open question (default if no answer)
- Default admin password: I'll set it to `unfold2026`. Tell me if you want a different one.
