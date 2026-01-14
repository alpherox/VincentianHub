import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Research, SearchFilters, ResearchLabel, ResearchStrand, AccessLevel } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ResearchContextType {
  researches: Research[];
  bookmarks: string[];
  searchResults: Research[];
  isSearching: boolean;
  isLoading: boolean;
  search: (filters: SearchFilters) => void;
  addResearch: (research: Omit<Research, 'id' | 'views' | 'uploadDate' | 'updatedAt'>, file?: File) => Promise<Research | null>;
  updateResearch: (id: string, updates: Partial<Research>) => Promise<void>;
  deleteResearch: (id: string) => Promise<void>;
  getResearchById: (id: string) => Research | undefined;
  getResearchesByAuthor: (authorId: string) => Research[];
  toggleBookmark: (researchId: string) => void;
  isBookmarked: (researchId: string) => boolean;
  incrementViews: (id: string) => Promise<void>;
  getBookmarkedResearches: () => Research[];
  refreshResearches: () => Promise<void>;
}

const ResearchContext = createContext<ResearchContextType | undefined>(undefined);

// Helper to transform DB row to Research type
const transformResearch = (row: any): Research => ({
  id: row.id,
  title: row.title,
  abstract: row.abstract,
  keywords: row.keywords || [],
  authorId: row.author_id,
  authorName: row.author_name || 'Unknown Author',
  authorAffiliation: row.author_affiliation,
  fileUrl: row.file_url,
  fileName: row.file_name,
  views: row.views || 0,
  uploadDate: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  label: row.label as ResearchLabel,
  strand: row.strand as ResearchStrand,
  academicYear: row.academic_year,
  accessLevel: row.access_level as AccessLevel,
  abstractVisible: row.abstract_visible,
  citationApa: row.citation_apa,
  citationMla: row.citation_mla,
  isArchived: row.is_archived,
});

export function ResearchProvider({ children }: { children: ReactNode }) {
  const [researches, setResearches] = useState<Research[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Research[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch all researches from Supabase
  const fetchResearches = useCallback(async () => {
    try {
      // First fetch researches
      const { data: researchData, error: researchError } = await supabase
        .from('researches')
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (researchError) {
        console.error('Error fetching researches:', researchError);
        return;
      }

      // Then fetch profiles to get author names
      const authorIds = [...new Set(researchData?.map(r => r.author_id) || [])];
      
      let profilesMap: Record<string, { full_name: string; affiliation?: string }> = {};
      
      if (authorIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, affiliation')
          .in('user_id', authorIds);
        
        if (profilesData) {
          profilesMap = profilesData.reduce((acc, p) => {
            acc[p.user_id] = { full_name: p.full_name, affiliation: p.affiliation || undefined };
            return acc;
          }, {} as Record<string, { full_name: string; affiliation?: string }>);
        }
      }

      const transformedResearches = (researchData || []).map(row => ({
        ...transformResearch(row),
        authorName: profilesMap[row.author_id]?.full_name || 'Unknown Author',
        authorAffiliation: profilesMap[row.author_id]?.affiliation,
      }));

      setResearches(transformedResearches);
    } catch (error) {
      console.error('Error in fetchResearches:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch bookmarks for current user
  const fetchBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarks([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('research_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching bookmarks:', error);
        return;
      }

      setBookmarks(data?.map(b => b.research_id) || []);
    } catch (error) {
      console.error('Error in fetchBookmarks:', error);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchResearches();
  }, [fetchResearches]);

  // Fetch bookmarks when user changes
  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks, user]);

  const refreshResearches = useCallback(async () => {
    setIsLoading(true);
    await fetchResearches();
  }, [fetchResearches]);

  const search = useCallback((filters: SearchFilters) => {
    setIsSearching(true);
    
    setTimeout(() => {
      let results = [...researches];
      
      // Filter by query (searches across all fields)
      if (filters.query) {
        const query = filters.query.toLowerCase();
        results = results.filter(r =>
          r.title.toLowerCase().includes(query) ||
          r.abstract.toLowerCase().includes(query) ||
          r.keywords.some(k => k.toLowerCase().includes(query)) ||
          r.authorName.toLowerCase().includes(query)
        );
      }
      
      // Filter by specific fields
      if (filters.title) {
        results = results.filter(r => 
          r.title.toLowerCase().includes(filters.title!.toLowerCase())
        );
      }
      
      if (filters.keywords) {
        const searchKeywords = filters.keywords.toLowerCase().split(',').map(k => k.trim());
        results = results.filter(r =>
          searchKeywords.some(sk => r.keywords.some(k => k.toLowerCase().includes(sk)))
        );
      }
      
      if (filters.author) {
        results = results.filter(r =>
          r.authorName.toLowerCase().includes(filters.author!.toLowerCase())
        );
      }
      
      if (filters.abstract) {
        results = results.filter(r =>
          r.abstract.toLowerCase().includes(filters.abstract!.toLowerCase())
        );
      }

      // Filter by strand
      if (filters.strand && filters.strand !== 'all') {
        results = results.filter(r => r.strand === filters.strand);
      }

      // Filter by label
      if (filters.label && filters.label !== 'all') {
        results = results.filter(r => r.label === filters.label);
      }

      // Filter by academic year
      if (filters.academicYear && filters.academicYear !== 'all') {
        results = results.filter(r => r.academicYear === filters.academicYear);
      }
      
      // Sort results
      switch (filters.sortBy) {
        case 'date':
          results.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
          break;
        case 'views':
          results.sort((a, b) => b.views - a.views);
          break;
        case 'relevance':
        default:
          break;
      }
      
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  }, [researches]);

  const addResearch = useCallback(async (
    researchData: Omit<Research, 'id' | 'views' | 'uploadDate' | 'updatedAt'>,
    file?: File
  ): Promise<Research | null> => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to upload research.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      let fileUrl: string | null = null;
      let fileName: string | null = null;

      // Upload file to Supabase Storage if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('research-files')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          toast({
            title: 'Upload Error',
            description: 'Failed to upload the PDF file.',
            variant: 'destructive',
          });
          return null;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('research-files')
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
        fileName = file.name;
      }

      // Insert into database
      const { data, error } = await supabase
        .from('researches')
        .insert({
          title: researchData.title,
          abstract: researchData.abstract,
          keywords: researchData.keywords,
          author_id: user.id,
          file_url: fileUrl,
          file_name: fileName || researchData.fileName,
          label: researchData.label,
          strand: researchData.strand,
          academic_year: researchData.academicYear,
          access_level: researchData.accessLevel || 'public',
          abstract_visible: researchData.abstractVisible ?? true,
          citation_apa: researchData.citationApa,
          citation_mla: researchData.citationMla,
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting research:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to save research.',
          variant: 'destructive',
        });
        return null;
      }

      const newResearch: Research = {
        ...transformResearch(data),
        authorName: user.fullName,
        authorAffiliation: user.affiliation,
      };

      setResearches(prev => [newResearch, ...prev]);
      return newResearch;
    } catch (error: any) {
      console.error('Error in addResearch:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred.',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast]);

  const updateResearch = useCallback(async (id: string, updates: Partial<Research>) => {
    try {
      const { error } = await supabase
        .from('researches')
        .update({
          title: updates.title,
          abstract: updates.abstract,
          keywords: updates.keywords,
          label: updates.label,
          strand: updates.strand,
          academic_year: updates.academicYear,
          access_level: updates.accessLevel,
          abstract_visible: updates.abstractVisible,
          citation_apa: updates.citationApa,
          citation_mla: updates.citationMla,
          is_archived: updates.isArchived,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating research:', error);
        return;
      }

      setResearches(prev => prev.map(r => 
        r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
      ));
    } catch (error) {
      console.error('Error in updateResearch:', error);
    }
  }, []);

  const deleteResearch = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('researches')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting research:', error);
        return;
      }

      setResearches(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error in deleteResearch:', error);
    }
  }, []);

  const getResearchById = useCallback((id: string) => {
    return researches.find(r => r.id === id);
  }, [researches]);

  const getResearchesByAuthor = useCallback((authorId: string) => {
    return researches.filter(r => r.authorId === authorId);
  }, [researches]);

  const toggleBookmark = useCallback(async (researchId: string) => {
    if (!user) return;

    const isCurrentlyBookmarked = bookmarks.includes(researchId);

    try {
      if (isCurrentlyBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('research_id', researchId);

        if (!error) {
          setBookmarks(prev => prev.filter(id => id !== researchId));
        }
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            research_id: researchId,
          });

        if (!error) {
          setBookmarks(prev => [...prev, researchId]);
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  }, [user, bookmarks]);

  const isBookmarked = useCallback((researchId: string) => {
    return bookmarks.includes(researchId);
  }, [bookmarks]);

  const incrementViews = useCallback(async (id: string) => {
    const research = researches.find(r => r.id === id);
    if (!research) return;

    try {
      const { error } = await supabase
        .from('researches')
        .update({ views: research.views + 1 })
        .eq('id', id);

      if (!error) {
        setResearches(prev => prev.map(r =>
          r.id === id ? { ...r, views: r.views + 1 } : r
        ));
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }, [researches]);

  const getBookmarkedResearches = useCallback(() => {
    return researches.filter(r => bookmarks.includes(r.id));
  }, [researches, bookmarks]);

  return (
    <ResearchContext.Provider value={{
      researches,
      bookmarks,
      searchResults,
      isSearching,
      isLoading,
      search,
      addResearch,
      updateResearch,
      deleteResearch,
      getResearchById,
      getResearchesByAuthor,
      toggleBookmark,
      isBookmarked,
      incrementViews,
      getBookmarkedResearches,
      refreshResearches,
    }}>
      {children}
    </ResearchContext.Provider>
  );
}

export function useResearch() {
  const context = useContext(ResearchContext);
  if (context === undefined) {
    throw new Error('useResearch must be used within a ResearchProvider');
  }
  return context;
}
