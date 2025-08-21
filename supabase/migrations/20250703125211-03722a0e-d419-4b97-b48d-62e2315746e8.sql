
-- Create a storage bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true);

-- Create RLS policies for the storage bucket
CREATE POLICY "Allow public read access to property images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

CREATE POLICY "Allow authenticated users to upload property images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow users to delete their own property images"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');
