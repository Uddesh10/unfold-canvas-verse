export type ThemeKey = "default" | "weddings" | "spaces" | "stories";

export const verticals = [
  {
    key: "weddings" as const,
    brand: "Unfold Studios",
    label: "Weddings",
    tagline: "Where vows become forever.",
    blurb: "Romantic, cinematic wedding photography that captures the quiet, golden moments between the grand ones.",
    path: "/weddings",
    color: "#E8B86C",
    glow: "#F2C97A",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
  },
  {
    key: "spaces" as const,
    brand: "Unfold Spaces",
    label: "Interiors",
    tagline: "Architecture, in its quietest voice.",
    blurb: "Editorial interior photography that honours light, line, and the calm geometry of considered spaces.",
    path: "/spaces",
    color: "#B7BDA3",
    glow: "#CFD3BC",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    key: "stories" as const,
    brand: "Unfold Stories",
    label: "Street",
    tagline: "The city, unposed.",
    blurb: "Documentary street work — grain, contrast, neon, the truth of a moment seen from the kerb.",
    path: "/stories",
    color: "#FF2EA0",
    glow: "#22E3FF",
    image:
      "https://images.unsplash.com/photo-1517242810446-cc8951b2be40?auto=format&fit=crop&w=1600&q=80",
  },
];

export type Vertical = (typeof verticals)[number];
