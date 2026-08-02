# Plan

## Goal

Make the bottom-right caption card in the Spaces and Stories carousels visually identical to the one in the homepage Hero section.

## Current state

- `src/three/HeroScene.tsx` renders the bottom-right caption as a glass card containing only the slide `label` (small uppercase) and the slide `caption` (larger body text).
- `src/components/PageCarousel.tsx` renders a similar glass card, but additionally shows a `bottomRightTag` prop (e.g. "/// UNFOLD SPACES — VOLUME 01") above the label in `font-mono text-accent/80`. This extra line changes the card's height, spacing, and color treatment, making it look different from the Hero.

## Changes

### `src/components/PageCarousel.tsx`

- Remove the `bottomRightTag` prop from the bottom-right caption card so the card only shows the slide `label` and `caption`, exactly like `HeroScene`.
- Keep the existing `AnimatePresence` animation and glass card styling (`glass rounded-xl px-4 py-3 md:px-6 md:py-4 border border-white/10 text-right max-w-[80vw]`).
- Keep the `bottomRightTag` prop in the component API for now to avoid breaking callers, but stop rendering it inside the caption card.

### `src/pages/Spaces.tsx` and `src/pages/Stories.tsx`

- Remove the `bottomRightTag` prop passed to `<PageCarousel />` so the caption card matches the Hero.
- The `centerTitle` props and full-viewport height settings remain unchanged.

## Notes

- No changes to slide data, stores, backend, or admin editors.
- No changes to the Hero section itself.
