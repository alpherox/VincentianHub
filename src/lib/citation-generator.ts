import { CitationData, ResearchLabel } from '@/types';

/**
 * Format author names for APA style (Last, F. M.)
 */
function formatAuthorAPA(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  
  const lastName = parts[parts.length - 1];
  const initials = parts
    .slice(0, -1)
    .map(n => n.charAt(0).toUpperCase() + '.')
    .join(' ');
  
  return `${lastName}, ${initials}`;
}

/**
 * Format author names for MLA style (Last, First Middle)
 */
function formatAuthorMLA(name: string, isFirst: boolean): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  
  if (isFirst) {
    const lastName = parts[parts.length - 1];
    const rest = parts.slice(0, -1).join(' ');
    return `${lastName}, ${rest}`;
  }
  
  return name;
}

/**
 * Get research type label for citation
 */
function getTypeLabel(type?: ResearchLabel): string {
  switch (type) {
    case 'thesis': return 'Master\'s thesis';
    case 'dissertation': return 'Doctoral dissertation';
    case 'capstone': return 'Capstone project';
    case 'practical_research': return 'Research paper';
    default: return 'Unpublished manuscript';
  }
}

/**
 * Generate APA 7th edition citation
 * Format: Author, A. B. (Year). Title of work [Type of work]. Institution.
 */
export function generateAPACitation(data: CitationData): string {
  const { authors, title, year, institution, type } = data;
  
  // Format authors
  let authorStr = '';
  if (authors.length === 0) {
    authorStr = 'Unknown Author';
  } else if (authors.length === 1) {
    authorStr = formatAuthorAPA(authors[0]);
  } else if (authors.length === 2) {
    authorStr = `${formatAuthorAPA(authors[0])} & ${formatAuthorAPA(authors[1])}`;
  } else if (authors.length <= 20) {
    const lastAuthor = authors[authors.length - 1];
    const otherAuthors = authors.slice(0, -1).map(formatAuthorAPA).join(', ');
    authorStr = `${otherAuthors}, & ${formatAuthorAPA(lastAuthor)}`;
  } else {
    // More than 20 authors: list first 19, then ..., then last
    const first19 = authors.slice(0, 19).map(formatAuthorAPA).join(', ');
    authorStr = `${first19}, ... ${formatAuthorAPA(authors[authors.length - 1])}`;
  }
  
  // Build citation
  const yearPart = year ? `(${year})` : '(n.d.)';
  const typePart = `[${getTypeLabel(type)}]`;
  const institutionPart = institution ? ` ${institution}.` : '';
  
  return `${authorStr} ${yearPart}. ${title} ${typePart}.${institutionPart}`;
}

/**
 * Generate MLA 9th edition citation
 * Format: Last, First, et al. "Title." Institution, Year.
 */
export function generateMLACitation(data: CitationData): string {
  const { authors, title, year, institution } = data;
  
  // Format authors
  let authorStr = '';
  if (authors.length === 0) {
    authorStr = 'Unknown Author';
  } else if (authors.length === 1) {
    authorStr = formatAuthorMLA(authors[0], true);
  } else if (authors.length === 2) {
    authorStr = `${formatAuthorMLA(authors[0], true)}, and ${formatAuthorMLA(authors[1], false)}`;
  } else if (authors.length === 3) {
    authorStr = `${formatAuthorMLA(authors[0], true)}, ${formatAuthorMLA(authors[1], false)}, and ${formatAuthorMLA(authors[2], false)}`;
  } else {
    authorStr = `${formatAuthorMLA(authors[0], true)}, et al.`;
  }
  
  // Build citation
  const institutionPart = institution ? `${institution}, ` : '';
  const yearPart = year || 'n.d.';
  
  return `${authorStr}. "${title}." ${institutionPart}${yearPart}.`;
}

/**
 * Auto-generate citations from OCR extracted data
 */
export function generateCitations(data: CitationData): { apa: string; mla: string } {
  return {
    apa: generateAPACitation(data),
    mla: generateMLACitation(data),
  };
}
