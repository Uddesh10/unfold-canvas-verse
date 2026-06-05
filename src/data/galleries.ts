export type GalleryItem = {
  src: string;
  alt: string;
  caption?: string;
  client?: string;
  photos?: string[];
  videos?: string[];
  feedback?: string;
  w?: number;
  h?: number;
};

const u = (id: string, w = 1400) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const weddingsGallery: GalleryItem[] = [
  {
    src: u("photo-1519741497674-611481863552"),
    alt: "Bride and groom at golden hour",
    caption: "Tuscany · 2024",
    client: "Maya & Arjun",
    photos: [
      u("photo-1519741497674-611481863552"),
      u("photo-1511795409834-ef04bbd61622"),
      u("photo-1530023367847-a683933f4172"),
      u("photo-1465495976277-4387d4b0b4c6"),
    ],
    videos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    feedback:
      "Unfold gave us a film we'll show our grandchildren. Every frame feels like a memory, not a photograph.",
  },
  {
    src: u("photo-1519225421980-715cb0215aed"),
    alt: "Couple kissing in sunlit doorway",
    caption: "Provence · 2023",
    client: "Sophie & Liam",
    photos: [
      u("photo-1519225421980-715cb0215aed"),
      u("photo-1583939003579-730e3918a45a"),
      u("photo-1591604466107-ec97de577aff"),
    ],
    videos: [],
    feedback: "Quiet, patient, and the result is breathtaking. Worth every second.",
  },
  {
    src: u("photo-1525772764200-be829a350797"),
    alt: "Champagne toast",
    caption: "Reception",
    client: "Priya & Rohan",
    photos: [
      u("photo-1525772764200-be829a350797"),
      u("photo-1606216794074-735e91aa2c92"),
      u("photo-1530023367847-a683933f4172"),
    ],
    feedback: "They disappeared into the day and brought back a treasure.",
  },
];

export const spacesGallery: GalleryItem[] = [
  { src: u("photo-1600585154340-be6161a56a0c"), alt: "Minimal living room", caption: "Casa Lume · Milan · 2024" },
  { src: u("photo-1600585154526-990dced4db0d"), alt: "Marble kitchen island", caption: "Hauser Residence · 2024" },
  { src: u("photo-1616486338812-3dadae4b4ace"), alt: "Bedroom with linen curtains", caption: "North Wing" },
  { src: u("photo-1505691938895-1758d7feb511"), alt: "Open staircase in white volume", caption: "Volta House · Lisbon" },
  { src: u("photo-1618221195710-dd6b41faaea6"), alt: "Concrete bath", caption: "Spa · 2023" },
  { src: u("photo-1493809842364-78817add7ffb"), alt: "Glass walled study", caption: "Atelier · Berlin" },
  { src: u("photo-1600210492493-0946911123ea"), alt: "Sage tile detail", caption: "Detail" },
  { src: u("photo-1615873968403-89e068629265"), alt: "Sun-washed corner", caption: "Light Study" },
];

export const storiesGallery: GalleryItem[] = [
  { src: u("photo-1517242810446-cc8951b2be40"), alt: "Neon street at night", caption: "Shinjuku · 02:14" },
  { src: u("photo-1493612276216-ee3925520721"), alt: "Pedestrian crossing in rain", caption: "Hong Kong" },
  { src: u("photo-1473042904451-00171c69419d"), alt: "Subway portrait", caption: "Line 7" },
  { src: u("photo-1519501025264-65ba15a82390"), alt: "Cyclist in motion blur", caption: "Brick Lane" },
  { src: u("photo-1490718720478-364a07a997cd"), alt: "Skater silhouette", caption: "South Bank" },
  { src: u("photo-1502920917128-1aa500764cbd"), alt: "Market vendor at dawn", caption: "Mumbai · 05:40" },
  { src: u("photo-1519074069444-1ba4fff66d16"), alt: "Reflection in puddle", caption: "Reflections" },
  { src: u("photo-1480714378408-67cf0d13bc1b"), alt: "City crowd from above", caption: "Crossings" },
  { src: u("photo-1444723121867-7a241cacace9"), alt: "Empty alley with neon sign", caption: "Backstreets" },
];
