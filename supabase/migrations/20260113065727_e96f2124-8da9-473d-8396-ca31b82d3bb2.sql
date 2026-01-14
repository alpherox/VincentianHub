-- Drop the existing restrictive SELECT policy on researches
DROP POLICY IF EXISTS "Public researches viewable by all" ON public.researches;

-- Create a new policy that allows everyone (including anonymous) to view public researches
CREATE POLICY "Anyone can view public researches" 
ON public.researches 
FOR SELECT 
USING (
  access_level = 'public'::access_level 
  OR (access_level = 'authenticated'::access_level AND auth.uid() IS NOT NULL)
  OR author_id = auth.uid() 
  OR has_role(auth.uid(), 'admin'::app_role)
);