import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Stats {
  researchPapers: number;
  researchers: number;
  monthlyViews: number;
}

export function useStats() {
  const { isAuthenticated } = useAuth();
  
  return useQuery<Stats>({
    queryKey: ['stats', isAuthenticated],
    queryFn: async () => {
      // Fetch all stats in parallel
      const [researchesResult, profilesResult, viewsResult] = await Promise.all([
        // Count research papers
        supabase
          .from('researches')
          .select('id', { count: 'exact', head: true }),
        
        // Count researchers (profiles)
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true }),
        
        // Sum of views from researches
        supabase
          .from('researches')
          .select('views')
      ]);

      // Handle errors gracefully - return 0 if there's an error
      const researchPapers = researchesResult.error ? 0 : (researchesResult.count || 0);
      const researchers = profilesResult.error ? 0 : (profilesResult.count || 0);
      
      // Calculate monthly views (sum of all views)
      const monthlyViews = viewsResult.error 
        ? 0 
        : (viewsResult.data?.reduce((sum, research) => sum + (research.views || 0), 0) || 0);

      return {
        researchPapers,
        researchers,
        monthlyViews,
      };
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    enabled: true, // Always enabled - RLS policies allow public read for stats
  });
}
