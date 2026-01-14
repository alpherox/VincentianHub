-- Migration: Add public read access policies for stats counting
-- This allows unauthenticated users to count rows in profiles and researches tables
-- for displaying statistics on the landing page

-- For researches table: Add a policy that allows counting all researches and reading views
-- This is needed because the existing policy filters by access_level, which prevents
-- accurate counting and views aggregation for unauthenticated users
-- 
-- Note: This policy allows public access to count and read views for ALL researches
-- If you want to restrict stats to only public researches, change USING (true) to:
-- USING (access_level = 'public'::public.access_level)
-- 
-- Drop the policy if it already exists to avoid conflicts
DROP POLICY IF EXISTS "Public can count all researches for stats" ON public.researches;

CREATE POLICY "Public can count all researches for stats" 
ON public.researches 
FOR SELECT 
USING (true);

-- For profiles: The existing "Public profiles are viewable by everyone" policy
-- already allows counting with USING (true), so no additional policy is needed.
-- This comment is here for documentation purposes.
