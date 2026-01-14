import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ResearchLabel, ResearchStrand } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ResearchLabelSelectProps {
  label: ResearchLabel | '';
  strand: ResearchStrand | '';
  academicYear: string;
  onLabelChange: (value: ResearchLabel) => void;
  onStrandChange: (value: ResearchStrand) => void;
  onAcademicYearChange: (value: string) => void;
}

const LABELS: { value: ResearchLabel; label: string; color: string }[] = [
  { value: 'practical_research', label: 'Practical Research', color: 'bg-blue-100 text-blue-700' },
  { value: 'capstone', label: 'Capstone', color: 'bg-purple-100 text-purple-700' },
  { value: 'thesis', label: 'Thesis', color: 'bg-green-100 text-green-700' },
  { value: 'dissertation', label: 'Dissertation', color: 'bg-orange-100 text-orange-700' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-700' },
];

const STRANDS: { value: ResearchStrand; label: string }[] = [
  { value: 'STEM', label: 'STEM - Science, Technology, Engineering & Mathematics' },
  { value: 'HUMSS', label: 'HUMSS - Humanities and Social Sciences' },
  { value: 'ABM', label: 'ABM - Accountancy, Business and Management' },
  { value: 'ICT', label: 'ICT - Information and Communication Technology' },
  { value: 'GAS', label: 'GAS - General Academic Strand' },
  { value: 'Other', label: 'Other' },
];

// Generate academic years
const generateAcademicYears = (): string[] => {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let year = currentYear + 1; year >= 2015; year--) {
    years.push(`${year - 1}-${year}`);
  }
  return years;
};

const ACADEMIC_YEARS = generateAcademicYears();

export function ResearchLabelSelect({
  label,
  strand,
  academicYear,
  onLabelChange,
  onStrandChange,
  onAcademicYearChange,
}: ResearchLabelSelectProps) {
  const selectedLabel = LABELS.find((l) => l.value === label);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <Label className="text-base font-semibold mb-4 block">
        Research Classification
      </Label>
      
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Research Type */}
        <div className="space-y-2">
          <Label htmlFor="label" className="text-sm">
            Research Type <span className="text-destructive">*</span>
          </Label>
          <Select value={label} onValueChange={(v) => onLabelChange(v as ResearchLabel)}>
            <SelectTrigger id="label">
              <SelectValue placeholder="Select type...">
                {selectedLabel && (
                  <Badge className={cn('font-normal', selectedLabel.color)}>
                    {selectedLabel.label}
                  </Badge>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {LABELS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  <Badge className={cn('font-normal', item.color)}>
                    {item.label}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Strand */}
        <div className="space-y-2">
          <Label htmlFor="strand" className="text-sm">
            Strand / Track <span className="text-destructive">*</span>
          </Label>
          <Select value={strand} onValueChange={(v) => onStrandChange(v as ResearchStrand)}>
            <SelectTrigger id="strand">
              <SelectValue placeholder="Select strand..." />
            </SelectTrigger>
            <SelectContent>
              {STRANDS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Academic Year */}
        <div className="space-y-2">
          <Label htmlFor="academicYear" className="text-sm">
            Academic Year <span className="text-destructive">*</span>
          </Label>
          <Select value={academicYear} onValueChange={onAcademicYearChange}>
            <SelectTrigger id="academicYear">
              <SelectValue placeholder="Select year..." />
            </SelectTrigger>
            <SelectContent>
              {ACADEMIC_YEARS.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
