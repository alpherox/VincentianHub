import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ResearchLabel, ResearchStrand, SearchFilters } from '@/types';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const STRANDS: { value: ResearchStrand; label: string }[] = [
  { value: 'STEM', label: 'STEM' },
  { value: 'HUMSS', label: 'HUMSS' },
  { value: 'ABM', label: 'ABM' },
  { value: 'ICT', label: 'ICT' },
  { value: 'GAS', label: 'GAS' },
  { value: 'Other', label: 'Other' },
];

const LABELS: { value: ResearchLabel; label: string }[] = [
  { value: 'practical_research', label: 'Practical Research' },
  { value: 'capstone', label: 'Capstone' },
  { value: 'thesis', label: 'Thesis' },
  { value: 'dissertation', label: 'Dissertation' },
  { value: 'other', label: 'Other' },
];

// Generate academic years from 2020 to current year + 1
const generateAcademicYears = (): string[] => {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let year = currentYear + 1; year >= 2020; year--) {
    years.push(`${year - 1}-${year}`);
  }
  return years;
};

const ACADEMIC_YEARS = generateAcademicYears();

export function QuickFilters({ filters, onFiltersChange }: QuickFiltersProps) {
  const hasActiveFilters = filters.strand !== 'all' || filters.label !== 'all' || filters.academicYear !== 'all';

  const handleStrandClick = (strand: ResearchStrand) => {
    onFiltersChange({
      ...filters,
      strand: filters.strand === strand ? 'all' : strand,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      ...filters,
      strand: 'all',
      label: 'all',
      academicYear: 'all',
    });
  };

  return (
    <div className="space-y-4">
      {/* Quick Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" />
          Quick Filters
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 gap-1 text-xs"
          >
            <X className="h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      {/* Strand Chips */}
      <div className="flex flex-wrap gap-2">
        {STRANDS.map((strand) => (
          <Badge
            key={strand.value}
            variant="secondary"
            className={cn(
              'cursor-pointer transition-all hover:bg-accent/30',
              filters.strand === strand.value
                ? 'bg-accent text-accent-foreground hover:bg-accent/80'
                : 'bg-secondary'
            )}
            onClick={() => handleStrandClick(strand.value)}
          >
            {strand.label}
          </Badge>
        ))}
      </div>

      {/* Dropdowns */}
      <div className="flex flex-wrap gap-3">
        {/* Research Type */}
        <Select
          value={filters.label || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              label: value === 'all' ? 'all' : (value as ResearchLabel),
            })
          }
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Research Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {LABELS.map((label) => (
              <SelectItem key={label.value} value={label.value}>
                {label.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Academic Year */}
        <Select
          value={filters.academicYear || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              academicYear: value,
            })
          }
        >
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Academic Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {ACADEMIC_YEARS.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
