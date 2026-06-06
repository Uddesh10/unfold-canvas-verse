# Move to Lovable Cloud + real admin auth

Today everything (galleries, hero slides, FAQs, testimonials, photographer, submissions, admin "login") lives in `localStorage` and a hardcoded password (`unfold2026`) in `src/lib/adminAuth.ts`. That means content is per-browser and the admin area is not actually secure. We'll move storage to Lovable Cloud (Supabase under the hood) and use real auth + a role check for admin.

## 1. Enable Lovable Cloud
One click from me — this provisions Postgres, Auth, Storage and Edge Functions, no external account needed. After that, everything below runs against it.

## 2. Database schema (one migration)
All tables in `public`, RLS on, explicit GRANTs.

- `site_content(key text primary key, value jsonb, updated_at timestamptz)` — single-row configs (photographer, hero slides, showcase).
- `gallery_items(id uuid pk, vertical text, position int, src, alt, caption, client, photos jsonb, videos jsonb, feedback, ...)` — replaces the 3 gallery localStorage keys.
- `faqs(id uuid pk, position int, question, answer)`
- `testimonials(id uuid pk, vertical text, position int, name, quote, role)`
- `submissions(id uuid pk, created_at, name, email, phone, category, date, message)` — booking form goes here.
- `app_role` enum (`admin`, `user`) + `user_roles(user_id, role)` table + `has_role(uuid, app_role)` security-definer function. **Roles are NOT stored on profiles** — separate table, per Lovable's security rules.

### RLS summary
- Public read on `site_content`, `gallery_items`, `faqs`, `testimonials` (anon + authenticated SELECT).
- Writes on those tables: only `has_role(auth.uid(), 'admin')`.
- `submissions`: anon + authenticated can INSERT; only admins can SELECT/DELETE.
- `user_roles`: authenticated can read their own row; only admins can modify.

## 3. Seed data
Insert the current default arrays from `src/data/*.ts` (faq, galleries, testimonials, photographer, hero slides) so the live site keeps showing the same content after the switch.

## 4. Replace localStorage hooks with Supabase
Rewrite these hooks to fetch from Supabase and expose `useQuery` + a mutation that requires admin:
- `useGalleryStore` → `gallery_items` (filtered by vertical, ordered by position)
- `useFaqStore` → `faqs`
- `useTestimonialsStore` → `testimonials`
- `usePhotographerStore`, `useHeroSlidesStore`, `useShowcaseStore` → rows in `site_content`
- `useSubmissionsStore` + `addSubmission` → `submissions`

Editors in `src/components/admin/*` stay almost the same — they just call the new mutations. Booking form keeps calling `addSubmission` (now an insert).

Import/Export buttons in `Admin.tsx` get repointed to read/write the same Supabase tables (or removed — your call).

## 5. Real admin authentication
- Add a `profiles` table? **Question for you below** — only needed if you want display name/avatar for admins. Auth itself doesn't require it.
- Rewrite `src/pages/AdminLogin.tsx` to use Supabase email+password sign-in (and optionally Google — Lovable Cloud supports it natively).
- Rewrite `src/lib/adminAuth.ts` + `src/components/RequireAdmin.tsx` to:
  - subscribe to `onAuthStateChange`
  - check `has_role(user.id, 'admin')` via RPC
  - redirect to `/admin/login` if not signed in OR not admin
- Delete the hardcoded `ADMIN_PASSWORD` constant.
- Footer "Admin" link stays.

### Bootstrapping the first admin
After you sign up your admin email once through `/admin/login`, I'll insert a row into `user_roles` for that user via a one-off SQL insert. Subsequent admins can be added the same way (or via a small "manage admins" tab later).

## 6. Cleanup
- Remove `src/lib/localStore.ts` usage from the migrated hooks (keep file only if anything else uses it).
- Add basic error/loading states in editors.
- Verify build, smoke-test admin login + a content edit + a booking submission.

## Questions before I build

1. **Profiles table?** Do you want a `profiles` table for admin display name/avatar, or is email-only fine?
2. **Sign-in methods?** Email+password only, or also Google sign-in?
3. **First admin email** — what email should I provision as the initial admin? (You'll sign up with it, then I grant the role.)
4. **Keep Import/Export JSON buttons** in the admin header, or drop them now that data is in the DB?

Once you answer, I'll switch to build mode and ship it in one pass.