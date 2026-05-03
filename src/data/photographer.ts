export type Photographer = {
  name: string;
  role: string;
  portrait: string;
  bio: string;
  location: string;
  email: string;
  instagram: string;
  behance: string;
  stats: { label: string; value: string }[];
};

export const defaultPhotographer: Photographer = {
  name: "Aarav Mehra",
  role: "Founder & Lead Photographer",
  portrait:
    "https://images.unsplash.com/photo-1628157588553-5eeea00af15c?auto=format&fit=crop&w=1200&q=85",
  bio: "Aarav has spent the last nine years quietly building a reputation for cinematic, unhurried photography. His work moves between intimate weddings, editorial interiors, and late-night street portraiture — all stitched together by the same belief: a great frame is one that lets a moment breathe.\n\nBased between Mumbai and Lisbon, he travels light, shoots slow, and prints big. Past collaborators include Vogue India, Kinfolk, Casa Lume and a handful of couples who simply trusted him with the best day of their lives.",
  location: "Mumbai · Lisbon · Worldwide",
  email: "hello@unfoldstudios.com",
  instagram: "https://instagram.com/unfoldstudios",
  behance: "https://behance.net/unfoldstudios",
  stats: [
    { label: "Weddings", value: "200+" },
    { label: "Countries", value: "14" },
    { label: "Years", value: "9" },
    { label: "Editorials", value: "40+" },
  ],
};
