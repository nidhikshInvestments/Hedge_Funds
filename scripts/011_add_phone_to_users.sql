-- Add phone number to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false;

-- Update existing users to have profile_completed = true if they have basic info
UPDATE public.users 
SET profile_completed = true 
WHERE email IS NOT NULL AND full_name IS NOT NULL;
