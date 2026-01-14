import { useState, useEffect, FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ResearchCard } from '@/components/research/ResearchCard';
import { QuickFilters } from '@/components/research/QuickFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useResearch } from '@/contexts/ResearchContext';
import { SearchFilters, ResearchStrand, ResearchLabel } from '@/types';
import { 
  Search, Filter, ChevronDown, ChevronUp, 
  SortAsc, FileSearch, Loader2, X, GraduationCap 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STRAND_COLORS: Record<ResearchStrand, string> = {
  STEM: 'bg-green-100 text-green-700',
  HUMSS: 'bg-purple-100 text-purple-700',
  ABM: 'bg-blue-100 text-blue-700',
  ICT: 'bg-orange-100 text-orange-700',
  GAS: 'bg-pink-100 text-pink-700',
  Other: 'bg-gray-100 text-gray-700',
};

const LABEL_NAMES: Record<ResearchLabel, string> = {
  practical_research: 'Practical Research',
  capstone: 'Capstone',
  thesis: 'Thesis',
  dissertation: 'Dissertation',
  other: 'Other',
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { researches, searchResults, isSearching, search } = useResearch();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    title: '',
    keywords: '',
    author: '',
    abstract: '',
    sortBy: 'relevance',
    strand: 'all',
    label: 'all',
    academicYear: 'all',
  });

  // Search on mount if there's a query param
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setFilters(prev => ({ ...prev, query }));
      search({ ...filters, query });
      setHasSearched(true);
    }
  }, []);

  // Re-search when quick filters change
  useEffect(() => {
    if (hasSearched || filters.strand !== 'all' || filters.label !== 'all' || filters.academicYear !== 'all') {
      search(filters);
      setHasSearched(true);
    }
  }, [filters.strand, filters.label, filters.academicYear]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (filters.query.trim() || filters.title || filters.keywords || filters.author || filters.abstract || 
        filters.strand !== 'all' || filters.label !== 'all' || filters.academicYear !== 'all') {
      search(filters);
      setHasSearched(true);
      if (filters.query) {
        setSearchParams({ q: filters.query });
      }
    }
  };

  const handleReset = () => {
    setFilters({
      query: '',
      title: '',
      keywords: '',
      author: '',
      abstract: '',
      sortBy: 'relevance',
      strand: 'all',
      label: 'all',
      academicYear: 'all',
    });
    setSearchParams({});
    setHasSearched(false);
  };

  const resultsToShow = hasSearched ? searchResults : researches;

  // Count active filters
  const activeFilterCount = [
    filters.strand !== 'all',
    filters.label !== 'all',
    filters.academicYear !== 'all',
    filters.title,
    filters.keywords,
    filters.author,
    filters.abstract,
  ].filter(Boolean).length;

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl flex items-center gap-3">
            <Search className="h-7 w-7 text-primary" />
            Search Research
          </h1>
          <p className="mt-2 text-muted-foreground">
            Find academic papers by title, keywords, author, strand, or year
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            {/* Main Search */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={filters.query}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                  placeholder="Search by title, keywords, author, or abstract..."
                  className="h-12 pl-12 text-base"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8" disabled={isSearching}>
                {isSearching ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Search'
                )}
              </Button>
            </div>

            {/* Quick Filters */}
            <div className="mt-6 pt-6 border-t border-border">
              <QuickFilters 
                filters={filters} 
                onFiltersChange={setFilters} 
              />
            </div>

            {/* Advanced Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Filter className="h-4 w-4" />
              Advanced Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </Badge>
              )}
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {/* Advanced Filters */}
            {showAdvanced && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={filters.title}
                    onChange={(e) => setFilters(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Search in title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={filters.keywords}
                    onChange={(e) => setFilters(prev => ({ ...prev, keywords: e.target.value }))}
                    placeholder="e.g., AI, healthcare..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={filters.author}
                    onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Author name..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="abstract">Abstract</Label>
                  <Input
                    id="abstract"
                    value={filters.abstract}
                    onChange={(e) => setFilters(prev => ({ ...prev, abstract: e.target.value }))}
                    placeholder="Search in abstract..."
                  />
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Results Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {hasSearched ? (
              <div>
                <p className="text-muted-foreground">
                  Found <span className="font-medium text-foreground">{searchResults.length}</span> result{searchResults.length !== 1 ? 's' : ''}
                  {filters.query && (
                    <span> for "<span className="text-primary">{filters.query}</span>"</span>
                  )}
                </p>
                {/* Active filter badges */}
                {(filters.strand !== 'all' || filters.label !== 'all' || filters.academicYear !== 'all') && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {filters.strand !== 'all' && (
                      <Badge className={cn('font-normal', STRAND_COLORS[filters.strand as ResearchStrand])}>
                        {filters.strand}
                      </Badge>
                    )}
                    {filters.label !== 'all' && (
                      <Badge variant="secondary">
                        {LABEL_NAMES[filters.label as ResearchLabel]}
                      </Badge>
                    )}
                    {filters.academicYear !== 'all' && (
                      <Badge variant="outline" className="gap-1">
                        <GraduationCap className="h-3 w-3" />
                        {filters.academicYear}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Showing all <span className="font-medium text-foreground">{researches.length}</span> research papers
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {hasSearched && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2">
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
            
            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4 text-muted-foreground" />
              <select
                value={filters.sortBy}
                onChange={(e) => {
                  const newFilters = { ...filters, sortBy: e.target.value as SearchFilters['sortBy'] };
                  setFilters(newFilters);
                  if (hasSearched) search(newFilters);
                }}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date (Newest)</option>
                <option value="views">Popularity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Searching...</p>
          </div>
        ) : resultsToShow.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resultsToShow.map((research, index) => (
              <div
                key={research.id}
                className="animate-fade-in"
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <ResearchCard research={research} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-destructive/30 bg-destructive/5 py-16">
            <FileSearch className="h-16 w-16 text-destructive/50" />
            <h3 className="mt-4 text-lg font-medium text-destructive">No results found</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground max-w-md">
              We couldn't find any research matching your search criteria. 
              Try adjusting your filters or using different keywords.
            </p>
            <Button variant="outline" className="mt-6" onClick={handleReset}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
