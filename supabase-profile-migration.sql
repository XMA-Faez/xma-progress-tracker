-- Add profile_image column to team_members table
ALTER TABLE team_members 
ADD COLUMN profile_image TEXT;

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);

-- Create RLS policies for profile images bucket
CREATE POLICY "Profile images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own profile images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = split_part(name, '/', 1));

CREATE POLICY "Users can update their own profile images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'profile-images' AND auth.uid()::text = split_part(name, '/', 1));

CREATE POLICY "Users can delete their own profile images" ON storage.objects
  FOR DELETE USING (bucket_id = 'profile-images' AND auth.uid()::text = split_part(name, '/', 1));