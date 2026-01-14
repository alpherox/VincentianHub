-- Migration to create or update admin user
-- Run this in Supabase SQL Editor if the admin account doesn't exist or needs to be restored

-- First, check if the user exists in auth.users and create if needed
-- Note: You'll need to create the auth user first via Supabase Auth Dashboard
-- or use the Supabase Admin API to create the user

-- After creating the auth user, run these commands to set up profile and role:

-- Step 1: Insert or update profile for admin@vincentiansfile.edu
-- Replace 'USER_UUID_HERE' with the actual user ID from auth.users table
INSERT INTO public.profiles (user_id, email, full_name)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@vincentiansfile.edu' LIMIT 1),
  'admin@vincentiansfile.edu',
  'System Administrator'
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;

-- Step 2: Insert or update user role to admin
INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@vincentiansfile.edu' LIMIT 1),
  'admin'
)
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';

-- Alternative: If you want to update an existing user's role to admin
-- Replace 'USER_UUID_HERE' with the actual user ID
-- UPDATE public.user_roles SET role = 'admin' WHERE user_id = 'USER_UUID_HERE';
