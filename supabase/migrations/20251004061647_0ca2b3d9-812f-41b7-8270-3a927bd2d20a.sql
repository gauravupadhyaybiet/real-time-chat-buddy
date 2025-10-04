-- Create storage bucket for status media
INSERT INTO storage.buckets (id, name, public)
VALUES ('status-media', 'status-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own status media
CREATE POLICY "Users can upload status media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'status-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anyone to view status media
CREATE POLICY "Anyone can view status media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'status-media');

-- Allow users to delete their own status media
CREATE POLICY "Users can delete their own status media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'status-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);