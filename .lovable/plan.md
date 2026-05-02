# Unfold Studios — Cinematic 3D Portfolio

A luxury multi-brand photography site with a Three.js hero entry and three distinct vertical pages, each with its own visual identity. All shared content (about, process, FAQ, booking) lives on the homepage and is reachable from every vertical.

## Site Map

```text
/                  Hero 3D entry + About + Process + FAQ + Booking + Contact
/weddings          Unfold Studios — warm, romantic, gold/champagne
/spaces            Unfold Spaces — minimal, architectural, neutral
/stories           Unfold Stories — raw, urban, high-contrast
```

A persistent glass top nav (logo + 3 verticals + Book) appears on all pages. Each vertical page links back to home anchors (#about, #process, #book).

## Homepage Experience

1. **Cinematic Hero (Three.js)**
   - Fullscreen WebGL canvas: three floating glass panels in 3D space, each textured with a representative photo for one vertical.
   - Subtle camera drift, soft bloom, ambient particles/dust motes.
   - Mouse parallax tilts the whole scene; hovering a panel pushes it forward, intensifies its themed glow (gold / neutral-green / neon), and reveals its label.
   - Click a panel → fluid transition (panel zooms to fill, color wash, route change) into that vertical.
   - Brand mark "UNFOLD STUDIOS" + tagline "storytelling through three perspectives" overlaid with staggered fade-in.
   - Custom cursor (dot + ring) active site-wide; grows over interactive elements.

2. **About** — Glassmorphic card, brand story behind "Unfold," subtle 3D hover tilt.

3. **Process Timeline** — 4 steps (Consultation, Agreement, Capturing, Delivery) revealed progressively as the user scrolls; animated connecting line.

4. **FAQ** — Accordion with frosted-glass items, smooth expand/collapse.

5. **Booking Form** — Glass form: Name, Email, Phone, Category (select: Weddings / Spaces / Stories), Date, Message. Zod validation, animated field states, success state on submit (no backend yet). CTA: "Start Your Story".

6. **Contact** — Email, phone, Instagram links per vertical, minimal premium layout.

7. **Footer** — Brand mark, vertical links, socials, copyright.

## Vertical Pages

All three share a structure (hero → portfolio gallery → testimonials → CTA → footer) but feel like distinct sub-brands through type, color, motion, and layout.

### /weddings — Unfold Studios (Warm/Romantic)
- Palette: gold, champagne, soft pink gradients on cream.
- Type: elegant serif display (Cormorant/Playfair) + light sans body.
- Hero: large fade-in image with golden light leak overlay, soft music-video pacing.
- Gallery: editorial masonry, slow fade/scale on scroll, lightbox with swipe.
- Testimonials: quote cards with handwritten-style accents.

### /spaces — Unfold Spaces (Minimal/Architectural)
- Palette: beige, white, warm grey, muted sage.
- Type: clean geometric sans (Inter/Geist), generous whitespace.
- Hero: symmetric composition, single statement line, micro-motion only.
- Gallery: strict CSS grid, equal tiles, subtle reveal, captions with project metadata (location, year).
- No testimonials section — replaced with a "Selected Clients" wordmark strip to reinforce minimalism.

### /stories — Unfold Stories (Raw/Urban)
- Palette: near-black, off-white, neon magenta/cyan accents, film grain overlay.
- Type: bold condensed display (Anton/Archivo Black) + mono captions.
- Hero: high-contrast image, glitch/marquee tagline, faster scroll feel.
- Gallery: asymmetric collage, varied tile sizes, snappy transitions, occasional full-bleed quotes.
- Testimonials replaced with a scrolling "Field Notes" ticker.

Each vertical has a sticky "Book a Shoot" button that scrolls to `/#book` with the category pre-selected.

## Visual System

- **Glassmorphism:** `backdrop-blur` + low-opacity surface + 1px inner border + soft outer glow tinted to the active theme.
- **3D depth:** Framer Motion tilt on cards, parallax layers on hero sections, scroll-linked transforms.
- **Custom cursor:** small dot, lagging ring, theme-tinted per page.
- **Smooth scroll:** Lenis wired into Framer Motion's scroll tracking.
- **Transitions:** AnimatePresence between routes — wash of theme color, then fade.
- **Performance:** lazy-loaded gallery images (Unsplash, sized via URL params), WebGL paused when offscreen, reduced-motion fallbacks.

## Imagery

Curated Unsplash photos per vertical (warm wedding shots, minimal interiors, gritty street). Loaded with `loading="lazy"`, blurred-up placeholders, and width hints. All easy to swap for real photos later via a single `galleries.ts` data file.

## Technical Notes

- Stack as-is: React 18 + Vite + Tailwind + TypeScript (Lovable doesn't run Next.js; React Router covers the routing needs).
- Add: `three`, `@react-three/fiber@^8.18`, `@react-three/drei@^9.122`, `framer-motion`, `@studio-freight/lenis`, `zod`, `react-hook-form`.
- Tailwind config extended with theme tokens per vertical (CSS variables swapped via a `data-theme` attribute on `<html>`), plus the standard fade/scale/slide keyframes.
- New files (high level):
  - `src/three/HeroScene.tsx` — R3F canvas with three panels, lighting, post-processing.
  - `src/components/CustomCursor.tsx`, `GlassCard.tsx`, `Nav.tsx`, `Footer.tsx`, `Lightbox.tsx`, `SectionReveal.tsx`.
  - `src/components/sections/` — About, Process, FAQ, Booking, Contact.
  - `src/data/galleries.ts`, `src/data/themes.ts`, `src/data/faq.ts`.
  - `src/pages/Weddings.tsx`, `Spaces.tsx`, `Stories.tsx` (+ routes added to `App.tsx`).
  - `src/hooks/useLenis.ts`, `useTilt.ts`.
- Booking form: client-side only, Zod schema, fake async submit with success animation. Backend can be wired later.
- SEO: per-route `<title>`/meta via a small `Seo.tsx` helper, semantic landmarks, alt text on every image.
- Accessibility: focus-visible rings on glass elements, accordion keyboard support, `prefers-reduced-motion` disables parallax/auto-camera and softens transitions.

## Out of Scope (for this build)

- Real backend / email delivery for bookings.
- CMS for galleries (data lives in a typed file you can edit).
- Auth, payments, blog.
