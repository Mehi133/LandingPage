
-- Update the RLS policy to allow anonymous users to upload property images
-- This is needed for the public property valuation tool where users don't need to register

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow authenticated users to upload property images" ON storage.objects;

-- Create a new policy that allows anonymous users to upload to property-images bucket
CREATE POLICY "Allow anonymous users to upload property images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'anon');

-- Also update the delete policy to allow anonymous users to delete their uploads
DROP POLICY IF EXISTS "Allow users to delete their own property images" ON storage.objects;

CREATE POLICY "Allow anonymous users to delete property images"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-images' AND auth.role() = 'anon');
