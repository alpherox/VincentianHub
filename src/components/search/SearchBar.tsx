import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
  size?: 'default' | 'large';
  placeholder?: string;
  onSearch?: (query: string) => void;
  autoNavigate?: boolean;
}

export function SearchBar({ 
  className, 
  size = 'default', 
  placeholder = 'Search by title, keywords, author, or abstract...',
  onSearch,
  autoNavigate = false,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim());
      }
      if (autoNavigate) {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const isLarge = size === 'large';

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "relative flex w-full max-w-2xl",
        className
      )}
    >
      <div className="relative flex-1">
        <Search className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground",
          isLarge ? "h-5 w-5" : "h-4 w-4"
        )} />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-l-xl rounded-r-none border-r-0 pl-12 transition-all focus-visible:ring-1 focus-visible:ring-primary",
            isLarge 
              ? "h-14 text-base placeholder:text-base" 
              : "h-11 text-sm placeholder:text-sm"
          )}
        />
      </div>
      <Button 
        type="submit" 
        className={cn(
          "rounded-l-none rounded-r-xl",
          isLarge ? "h-14 px-8 text-base" : "h-11 px-6"
        )}
      >
        Search
      </Button>
    </form>
  );
}
