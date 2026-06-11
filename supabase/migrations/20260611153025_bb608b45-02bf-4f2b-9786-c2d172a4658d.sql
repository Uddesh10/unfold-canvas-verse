
-- Public read of gallery objects (signed URLs require select to be allowed)
CREATE POLICY "gallery public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

-- Admin-only writes
CREATE POLICY "gallery admin insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "gallery admin update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "gallery admin delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));
