## 1. Grant admin role to [unfold@admin.com](mailto:unfold@admin.com)

Insert a row into `user_roles` for user id `39616946-bab1-4d78-877e-d4a59b08511d` with role `admin` (idempotent — skip if already present).

## 2. Wedding reviews → arrow-button slideshow

In `src/pages/Weddings.tsx`, replace the 3-column reviews grid with a three-card slideshow:

- Three testimonial visible at a time, centered, styled like the existing `glass rounded-3xl` card.
- Left/right arrow buttons (lucide `ChevronLeft` / `ChevronRight`) on each side, vertically centered, matching the site's minimal aesthetic.
- Dot indicators below for position.
- Keyboard arrow key support and wrap-around navigation.
- Smooth fade/slide transition using framer-motion (already in project).
- No autoplay (manual only) to keep it consistent with the request.

Section heading "In their words." stays unchanged.

No other pages, no schema changes, no other behavior touched.