-- ====================================================================
-- FAITH & CREATOR STUDIO - STORAGE BUCKETS SETUP & POLICIES
-- ====================================================================

-- 1. Create storage buckets for assets and generated images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('studio-assets', 'studio-assets', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
    ('generated-images', 'generated-images', true, 20971520, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;


-- 2. Storage Objects RLS Policies for studio-assets
-- Allow authenticated users to upload files to their user folder: (storage.foldername(name))[1] = auth.uid()::text
CREATE POLICY "Users can upload assets to their own folder"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'studio-assets' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update assets in their own folder"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'studio-assets' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete assets in their own folder"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'studio-assets' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Public read for studio-assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'studio-assets');


-- 3. Storage Objects RLS Policies for generated-images
CREATE POLICY "Users can save generated images to their own folder"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'generated-images' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete their generated images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'generated-images' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Public read for generated-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'generated-images');
