-- ============================================
-- Create Admin Account Script
-- ============================================
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- 
-- IMPORTANT: First create the auth user via one of these methods:
--   1. Via Supabase Dashboard: Authentication > Users > Add User
--   2. Or register normally, then update role using this script
-- ============================================

-- OPTION 1: If user already exists in auth.users (e.g., you registered normally)
-- Just update their role to admin:
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Find the user by email
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@vincentiansfile.edu' 
  LIMIT 1;
  
  -- If user exists, update their profile and role
  IF admin_user_id IS NOT NULL THEN
    -- Update or insert profile
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (admin_user_id, 'admin@vincentiansfile.edu', 'System Administrator')
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name;
    
    -- Update or insert admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id) 
    DO UPDATE SET role = 'admin';
    
    RAISE NOTICE 'Admin account updated successfully for user ID: %', admin_user_id;
  ELSE
    RAISE NOTICE 'User not found. Please create the auth user first via Supabase Dashboard: Authentication > Users > Add User';
  END IF;
END $$;

-- OPTION 2: Update ANY existing user to admin (replace email)
-- Uncomment and modify the email below:
/*
DO $$
DECLARE
  user_email TEXT := 'your-email@example.com'; -- Change this to your email
  user_id UUID;
BEGIN
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = user_email 
  LIMIT 1;
  
  IF user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_id, 'admin')
    ON CONFLICT (user_id) 
    DO UPDATE SET role = 'admin';
    
    RAISE NOTICE 'User % promoted to admin', user_email;
  ELSE
    RAISE NOTICE 'User % not found', user_email;
  END IF;
END $$;
*/
