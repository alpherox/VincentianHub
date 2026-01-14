import { Link } from 'react-router-dom';
import { Research } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Calendar, Star, User } from 'lucide-react';
import { useResearch } from '@/contexts/ResearchContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface ResearchCardProps {
  research: Research;
  className?: string;
}

export function ResearchCard({ research, className }: ResearchCardProps) {
  const { isBookmarked, toggleBookmark } = useResearch();
  const { isAuthenticated } = useAuth();
  const bookmarked = isBookmarked(research.id);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateAbstract = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <article 
      className={cn(
        "group relative rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/20",
        className
      )}
    >
      {/* Bookmark Button */}
      {isAuthenticated && (
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleBookmark(research.id);
          }}
          className={cn(
            "absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full transition-all",
            bookmarked 
              ? "bg-accent text-accent-foreground" 
              : "bg-secondary text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          <Star className={cn("h-4 w-4", bookmarked && "fill-current")} />
        </button>
      )}

      {/* Title */}
      <Link to={`/research/${research.id}`}>
        <h3 className="mb-3 pr-10 text-lg font-semibold text-primary transition-colors group-hover:text-primary-hover line-clamp-2">
          {research.title}
        </h3>
      </Link>

      {/* Author */}
      <Link 
        to={`/author/${research.authorId}`}
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <User className="h-3.5 w-3.5" />
        <span>{research.authorName}</span>
        {research.authorAffiliation && (
          <span className="text-muted-foreground/60">• {research.authorAffiliation}</span>
        )}
      </Link>

      {/* Abstract */}
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        {truncateAbstract(research.abstract)}
      </p>

      {/* Keywords */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {research.keywords.slice(0, 4).map((keyword, index) => (
          <Badge 
            key={index} 
            variant="secondary"
            className="bg-accent/20 text-accent-foreground hover:bg-accent/30 text-xs font-normal"
          >
            {keyword}
          </Badge>
        ))}
        {research.keywords.length > 4 && (
          <Badge variant="secondary" className="text-xs font-normal">
            +{research.keywords.length - 4}
          </Badge>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(research.uploadDate)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {research.views.toLocaleString()} views
          </span>
        </div>

        <Link to={`/research/${research.id}`}>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary-hover">
            View Details
          </Button>
        </Link>
      </div>
    </article>
  );
}
