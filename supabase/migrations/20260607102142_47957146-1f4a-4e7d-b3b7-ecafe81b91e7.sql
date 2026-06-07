ALTER TABLE public.gallery_items
  ADD COLUMN IF NOT EXISTS slideshow_photos jsonb NOT NULL DEFAULT '[]'::jsonb;