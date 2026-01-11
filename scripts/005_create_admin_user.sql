-- This script helps you create the first admin user
-- IMPORTANT: Run this AFTER you've created a regular account through the signup page
-- Replace 'your-email@example.com' with your actual email address

-- Update an existing user to have admin role
-- Option 1: Update by email
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- OR Option 2: Make the first created user an admin (uncomment to use)
-- UPDATE public.users 
-- SET role = 'admin' 
-- WHERE id = (SELECT id FROM public.users ORDER BY created_at ASC LIMIT 1);

-- Verify the admin user was created
SELECT id, email, full_name, role, created_at 
FROM public.users 
WHERE role = 'admin';
