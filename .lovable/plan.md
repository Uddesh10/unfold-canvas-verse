# Plan

## Goal

Replace the static `bottomRightText` blurb on Spaces and Stories carousels with a per-slide caption block styled like the Hero carousel, plus a small editorial "tag line" inspired by the reference image (`/// UNFOLD STORIES — FIELD EDITION 07`).

## Changes

### 1. `src/components/PageCarousel.tsx`

- Replace the `bottomRightText?: string` prop with `bottomRightTag?: string` (small uppercase editorial label, e.g. `"/// UNFOLD STORIES — FIELD EDITION 07"` or `"/// UNFOLD SPACES — VOLUME 01"`).
- Render the bottom-right glass card the same way as Hero:
  - Top line: `bottomRightTag` in `font-mono text-[10px] uppercase tracking-[0.3em] text-accent/80` (mimics the cyan `///` tag in the reference).
  - Middle line: current slide's `label` in `text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/70 mb-1`.
  - Bottom line: current slide's `caption` in `text-sm md:text-base text-white/90`.
- Animate label+caption on slide change (fade/slide, matching Hero's `AnimatePresence`). The tag stays static.
- Hide the card when neither tag nor caption nor label exists for the current slide.

### 2. `src/pages/Spaces.tsx`

- Remove `bottomRightText={...}` prop.
- Add `bottomRightTag="/// UNFOLD SPACES — VOLUME 01"` (creative interpretation, not a copy).

### 3. `src/pages/Stories.tsx`

- Remove `bottomRightText={...}` prop.
- Add `bottomRightTag="/// UNFOLD STORIES — FIELD EDITION 07"`.

## Notes

- Center overlay (`centerTitle`) is unchanged on both pages.
- Hero scene is unchanged.
- No data/schema/admin changes — relies on existing `label` and `caption` fields on each `HeroSlide`.