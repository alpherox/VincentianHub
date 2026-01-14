export type UserRole = 'researcher' | 'student' | 'admin';

export type ResearchLabel = 'practical_research' | 'capstone' | 'thesis' | 'dissertation' | 'other';

export type ResearchStrand = 'STEM' | 'HUMSS' | 'ABM' | 'ICT' | 'GAS' | 'Other';

export type AccessLevel = 'public' | 'authenticated' | 'restricted';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  bio?: string;
  affiliation?: string;
  avatar?: string;
  createdAt: Date;
}

export interface Research {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  authorId: string;
  authorName: string;
  authorAffiliation?: string;
  fileUrl?: string;
  fileName?: string;
  views: number;
  uploadDate: Date;
  updatedAt: Date;
  // New fields
  label?: ResearchLabel;
  strand?: ResearchStrand;
  academicYear?: string;
  accessLevel?: AccessLevel;
  abstractVisible?: boolean;
  citationApa?: string;
  citationMla?: string;
  isArchived?: boolean;
}

export interface SearchFilters {
  query: string;
  title?: string;
  keywords?: string;
  author?: string;
  abstract?: string;
  sortBy: 'relevance' | 'date' | 'views';
  // New filter fields
  strand?: ResearchStrand | 'all';
  label?: ResearchLabel | 'all';
  academicYear?: string | 'all';
}

export interface Bookmark {
  id: string;
  userId: string;
  researchId: string;
  createdAt: Date;
}

export interface QAQuestion {
  id: string;
  researchId: string;
  userId: string;
  userName: string;
  content: string;
  upvotes: number;
  createdAt: Date;
  answers: QAAnswer[];
}

export interface QAAnswer {
  id: string;
  questionId: string;
  userId: string;
  userName: string;
  content: string;
  upvotes: number;
  createdAt: Date;
}

// OCR extracted data
export interface OCRResult {
  title: string;
  abstract: string;
  keywords: string[];
  authors: string[];
  year?: string;
  rawText: string;
  confidence: number;
}

// Citation format options
export interface CitationData {
  authors: string[];
  title: string;
  year: string;
  institution?: string;
  type?: ResearchLabel;
}
