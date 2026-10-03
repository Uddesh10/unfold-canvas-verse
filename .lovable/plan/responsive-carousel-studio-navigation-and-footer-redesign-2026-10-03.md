# Responsive carousel, studio navigation, and footer redesign

## Direction
Use the selected editorial split layout with the locked editorial-contrast palette, Instrument Serif headings, Work Sans body text, and a floating studio selector. Preserve each photography vertical’s existing identity while making the shared structure consistent.

## Changes

### 1. Full-bleed carousels on every screen
- Update the Home, Spaces, and Stories carousels to fill their frame with landscape images using intentional `cover` cropping on phones and desktops, eliminating the black bands above and below.
- Keep the title and caption readable over varied photographs, with responsive placement that avoids faces and controls where possible.
- Replace the current zoom-only transition with a cinematic crossfade plus gentle directional drift and scale settling.
- Apply the same transition timing and interaction model across all three carousels, including manual arrows and autoplay pause behavior.
- Respect reduced-motion preferences with a simple fade fallback.

### 2. Floating studio rail everywhere
- Create one shared Weddings / Spaces / Stories selector and show it on Home, Weddings, Spaces, and Stories across phone and desktop.
- Style it as a compact editorial rail with a clear active state, restrained glass treatment, and dependable contrast over both light and dark imagery.
- On phones, place it below the top controls without crowding the logo or Book action; on desktop, retain the selected floating split-layout character.
- Remove the duplicate homepage-only selector so navigation appears once and behaves consistently.

### 3. Editorial carousel composition
- Translate the selected split-layout direction into the existing full-screen photography experience rather than adding a permanent desktop sidebar that reduces image impact.
- Use asymmetric caption placement, slide position/progress, and cleaner arrow controls inspired by the selected reference.
- Retain the existing page-specific names, taglines, customer labels, and captions.

### 4. Footer redesign
- Replace the plain four-column footer with a stronger editorial closing spread.
- Keep all existing destinations and live contact data: verticals, studio sections, location, email, Instagram, Admin, copyright, and studio phrase.
- Use a compact stacked layout on phones and an asymmetric four-part grid on desktop, with clearer hierarchy and larger brand presence.
- Ensure each page theme remains readable while the footer follows the shared editorial-contrast direction.

### 5. Responsive verification
- Check Home, Weddings, Spaces, and Stories at phone and desktop sizes.
- Verify no carousel letterboxing, blank slides, clipping, overlapping controls, duplicate studio navigation, or footer overflow.
- Verify carousel arrows, autoplay, studio links, booking link, and footer links remain functional.

## Technical notes
- Consolidate shared carousel motion and studio navigation patterns into focused reusable components.
- Define new colors, typography, shadows, and motion values as semantic design tokens in the global design system.
- Load typography through the document font link rather than a CSS URL import.
- Use the project’s existing React, Framer Motion, routing, and theme infrastructure; no backend changes are required.
