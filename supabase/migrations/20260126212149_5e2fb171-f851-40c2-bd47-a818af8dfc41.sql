-- Create storage bucket for dog photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('dog-photos', 'dog-photos', true);

-- Allow authenticated users to upload their own photos
CREATE POLICY "Authenticated users can upload dog photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'dog-photos');

-- Allow anyone to view dog photos (public bucket)
CREATE POLICY "Anyone can view dog photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'dog-photos');

-- Allow users to update their own uploads
CREATE POLICY "Users can update own dog photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'dog-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own dog photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'dog-photos' AND auth.uid()::text = (storage.foldername(name))[1]);