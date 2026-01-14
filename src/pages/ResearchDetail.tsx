import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CitationDisplay } from '@/components/research/CitationDisplay';
import { QASection } from '@/components/research/QASection';
import { useResearch } from '@/contexts/ResearchContext';
import { useAuth } from '@/contexts/AuthContext';
import { QAQuestion, QAAnswer, ResearchLabel, ResearchStrand } from '@/types';
import { mockQAQuestions } from '@/data/mockData';
import { 
  ArrowLeft, Calendar, Eye, Star, User, 
  Download, FileText, ExternalLink, Building,
  GraduationCap, Tag, Loader2
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

export default function ResearchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getResearchById, isBookmarked, toggleBookmark, incrementViews } = useResearch();
  const { user, isAuthenticated } = useAuth();
  
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const research = getResearchById(id || '');
  const bookmarked = research ? isBookmarked(research.id) : false;

  // Load questions and increment views
  useEffect(() => {
    if (research) {
      incrementViews(research.id);
      // Load mock Q&A for this research
      const researchQuestions = mockQAQuestions.filter(q => q.researchId === research.id);
      setQuestions(researchQuestions);
    }
  }, [research?.id]);

  // Handle PDF download
  const handleDownload = async () => {
    if (!research?.fileUrl) return;
    
    setIsDownloading(true);
    try {
      // Fetch the PDF file
      const response = await fetch(research.fileUrl);
      if (!response.ok) throw new Error('Failed to fetch PDF');
      
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = research.fileName || `${research.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: open in new tab for download
      window.open(research.fileUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle opening PDF in new tab
  const handleOpenInNewTab = () => {
    if (!research?.fileUrl) return;
    
    setIsOpening(true);
    // Open the PDF URL directly in a new browser tab
    // The browser's native PDF viewer will handle it
    window.open(research.fileUrl, '_blank', 'noopener,noreferrer');
    setIsOpening(false);
  };

  const handleAddQuestion = (content: string) => {
    if (!user) return;
    const newQuestion: QAQuestion = {
      id: `q${Date.now()}`,
      researchId: research!.id,
      userId: user.id,
      userName: user.fullName,
      content,
      upvotes: 0,
      createdAt: new Date(),
      answers: [],
    };
    setQuestions(prev => [newQuestion, ...prev]);
  };

  const handleAddAnswer = (questionId: string, content: string) => {
    if (!user) return;
    const newAnswer: QAAnswer = {
      id: `a${Date.now()}`,
      questionId,
      userId: user.id,
      userName: user.fullName,
      content,
      upvotes: 0,
      createdAt: new Date(),
    };
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? { ...q, answers: [...q.answers, newAnswer] }
          : q
      )
    );
  };

  const handleUpvoteQuestion = (questionId: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q
      )
    );
  };

  const handleUpvoteAnswer = (questionId: string, answerId: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? {
              ...q,
              answers: q.answers.map(a =>
                a.id === answerId ? { ...a, upvotes: a.upvotes + 1 } : a
              ),
            }
          : q
      )
    );
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleDeleteAnswer = (questionId: string, answerId: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? { ...q, answers: q.answers.filter(a => a.id !== answerId) }
          : q
      )
    );
  };

  if (!research) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <FileText className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <h1 className="mt-4 text-2xl font-bold">Research Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The research paper you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/search')} className="mt-6">
            Back to Search
          </Button>
        </div>
      </Layout>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Header */}
        <article className="animate-fade-in">
          <header className="mb-8">
            {/* Labels and Keywords */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              {research.strand && (
                <Badge className={cn('font-medium', STRAND_COLORS[research.strand])}>
                  {research.strand}
                </Badge>
              )}
              {research.label && (
                <Badge variant="outline" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {LABEL_NAMES[research.label]}
                </Badge>
              )}
              {research.academicYear && (
                <Badge variant="secondary" className="gap-1">
                  <GraduationCap className="h-3 w-3" />
                  {research.academicYear}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1.5 mb-4">
              {research.keywords.map((keyword, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="bg-accent/20 text-accent-foreground"
                >
                  {keyword}
                </Badge>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold leading-tight text-primary sm:text-3xl lg:text-4xl">
              {research.title}
            </h1>

            {/* Author Info */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link 
                to={`/author/${research.authorId}`}
                className="flex items-center gap-3 rounded-lg bg-secondary/50 px-4 py-2 transition-colors hover:bg-secondary"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {research.authorName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{research.authorName}</p>
                  {research.authorAffiliation && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building className="h-3 w-3" />
                      {research.authorAffiliation}
                    </p>
                  )}
                </div>
              </Link>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDate(research.uploadDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {research.views.toLocaleString()} views
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              {research.fileUrl && (
                <Button 
                  variant="default" 
                  className="gap-2"
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {isDownloading ? 'Downloading...' : 'Download PDF'}
                </Button>
              )}
              
              {isAuthenticated && (
                <Button
                  variant={bookmarked ? "accent" : "outline"}
                  onClick={() => toggleBookmark(research.id)}
                  className="gap-2"
                >
                  <Star className={cn("h-4 w-4", bookmarked && "fill-current")} />
                  {bookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
              )}
            </div>
          </header>

          {/* Abstract Section */}
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Abstract</h2>
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="whitespace-pre-line leading-relaxed text-foreground/90">
                {research.abstract}
              </p>
            </div>
          </section>

          {/* Citations */}
          {(research.citationApa || research.citationMla) && (
            <section className="mb-8">
              <CitationDisplay
                apa={research.citationApa || `${research.authorName} (${new Date(research.uploadDate).getFullYear()}). ${research.title}. Vincentian University.`}
                mla={research.citationMla || `${research.authorName}. "${research.title}." Vincentian University, ${new Date(research.uploadDate).getFullYear()}.`}
              />
            </section>
          )}

          {/* PDF Viewer Section */}
          {research.fileUrl && (
            <section className="mb-8">
              <h2 className="mb-4 text-xl font-semibold">Full Paper</h2>
              <div className="rounded-xl border border-border bg-secondary/30 p-12 text-center">
                <FileText className="mx-auto h-16 w-16 text-muted-foreground/50" />
                <h3 className="mt-4 font-medium">View Research Paper</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                  Click below to open the full PDF document in your browser's native PDF viewer.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4 gap-2"
                  onClick={handleOpenInNewTab}
                  disabled={isOpening}
                >
                  {isOpening ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  Open in New Tab
                </Button>
              </div>
            </section>
          )}

          {/* Q&A Section */}
          <section className="mb-8">
            <QASection
              researchId={research.id}
              authorId={research.authorId}
              questions={questions}
              onAddQuestion={handleAddQuestion}
              onAddAnswer={handleAddAnswer}
              onUpvoteQuestion={handleUpvoteQuestion}
              onUpvoteAnswer={handleUpvoteAnswer}
              onDeleteQuestion={handleDeleteQuestion}
              onDeleteAnswer={handleDeleteAnswer}
            />
          </section>

          {/* Related Research Placeholder */}
          <section>
            <h2 className="mb-4 text-xl font-semibold">Related Research</h2>
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Related papers based on keywords and content similarity would appear here.
              </p>
              <Link to="/search">
                <Button variant="outline" className="mt-4">
                  Explore More Research
                </Button>
              </Link>
            </div>
          </section>
        </article>
      </div>
    </Layout>
  );
}
