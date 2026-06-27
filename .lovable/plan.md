## Goal
Rearrange the hero carousel overlay so the brand name stays centered while slide-specific text moves to the bottom-right.

## Current State
`HeroScene.tsx` renders a single centered glass card containing:
- "Unfold Studios" wordmark
- `current.caption` (the slide caption) underneath

The slide `label` (e.g., "Weddings") is not currently shown.

## Changes
1. **Keep the center card** with "Unfold Studios" and the caption/tagline as-is.
2. **Add a bottom-right overlay** that displays the slide `label` and `caption` together in a small, elegant text block.
3. Ensure the new overlay is responsive and readable over all background images (use a subtle backdrop or shadow if needed).
4. No changes to slide data, transitions, arrows, or auto-play timing.

## Files
- `src/three/HeroScene.tsx` — layout change only.

## Risk & Notes
- Minimal scope; purely presentational.
- Should not affect mobile `object-contain` fix already in place.