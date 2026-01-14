import { useState, useEffect, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useResearch } from '@/contexts/ResearchContext';
import { useToast } from '@/hooks/use-toast';
import { ResearchLabelSelect } from '@/components/research/ResearchLabelSelect';
import { extractTextFromPDF, OCRProgress } from '@/lib/ocr-service';
import { generateCitations } from '@/lib/citation-generator';
import { ResearchLabel, ResearchStrand } from '@/types';
import { 
  Upload, FileText, X, Check, Loader2, 
  Sparkles, AlertCircle, Quote, Edit2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default function UploadPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { addResearch } = useResearch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [keywords, setKeywords] = useState('');
  const [abstract, setAbstract] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<OCRProgress>({ status: '', progress: 0 });
  const [error, setError] = useState('');
  
  // New fields for labels and citations
  const [label, setLabel] = useState<ResearchLabel | ''>('');
  const [strand, setStrand] = useState<ResearchStrand | ''>('');
  const [academicYear, setAcademicYear] = useState('');
  const [citationApa, setCitationApa] = useState('');
  const [citationMla, setCitationMla] = useState('');
  const [extractedAuthors, setExtractedAuthors] = useState<string[]>([]);
  const [showCitations, setShowCitations] = useState(false);

  // Redirect if not authenticated or not a student
  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate('/auth');
    } else if (user?.role !== 'student' && user?.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'Only students can upload papers.',
        variant: 'destructive',
      });
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate, toast, authLoading]);

  // Regenerate citations when relevant fields change
  useEffect(() => {
    if (title && (extractedAuthors.length > 0 || user?.fullName)) {
      const authors = extractedAuthors.length > 0 ? extractedAuthors : [user?.fullName || 'Unknown'];
      const year = academicYear ? academicYear.split('-')[1] : new Date().getFullYear().toString();
      
      const citations = generateCitations({
        authors,
        title,
        year,
        institution: user?.affiliation || 'St. Vincent College',
        type: label || undefined,
      });
      
      setCitationApa(citations.apa);
      setCitationMla(citations.mla);
    }
  }, [title, extractedAuthors, academicYear, label, user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are allowed.');
        return;
      }
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB.');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type !== 'application/pdf') {
        setError('Only PDF files are allowed.');
        return;
      }
      if (droppedFile.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB.');
        return;
      }
      setFile(droppedFile);
      setError('');
    }
  };

  const performOCR = async () => {
    if (!file) return;
    
    setIsScanning(true);
    setScanProgress({ status: 'Initializing...', progress: 0 });
    
    try {
      const result = await extractTextFromPDF(file, (progress) => {
        setScanProgress(progress);
      });
      
      // Populate fields with extracted data
      if (result.title && result.title !== 'Untitled Document') {
        setTitle(result.title);
      }
      
      if (result.abstract) {
        setAbstract(result.abstract);
      }
      
      if (result.keywords.length > 0) {
        setKeywords(result.keywords.join(', '));
      }
      
      if (result.authors.length > 0) {
        setExtractedAuthors(result.authors);
      }
      
      // Try to detect academic year from extracted year
      if (result.year) {
        const year = parseInt(result.year);
        if (!isNaN(year)) {
          setAcademicYear(`${year - 1}-${year}`);
        }
      }
      
      setShowCitations(true);
      
      toast({
        title: 'OCR Complete!',
        description: `Extracted ${result.confidence ? `with ${Math.round(result.confidence)}% confidence` : 'successfully'}. Please review and edit as needed.`,
      });
    } catch (err) {
      console.error('OCR error:', err);
      toast({
        title: 'OCR Failed',
        description: 'Could not extract text from the document. Please enter details manually.',
        variant: 'destructive',
      });
    } finally {
      setIsScanning(false);
      setScanProgress({ status: '', progress: 0 });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter a title.');
      return;
    }
    if (!keywords.trim()) {
      setError('Please enter at least one keyword.');
      return;
    }
    if (!abstract.trim()) {
      setError('Please enter an abstract.');
      return;
    }
    if (!label) {
      setError('Please select a research type.');
      return;
    }
    if (!strand) {
      setError('Please select a strand.');
      return;
    }
    if (!academicYear) {
      setError('Please select an academic year.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Add the research with file upload to Supabase
      const keywordsArray = keywords.split(',').map(k => k.trim()).filter(k => k);
      
      setUploadProgress(30);
      
      const result = await addResearch({
        title,
        abstract,
        keywords: keywordsArray,
        authorId: user!.id,
        authorName: user!.fullName,
        authorAffiliation: user!.affiliation,
        fileName: file?.name,
        label,
        strand,
        academicYear,
        citationApa,
        citationMla,
        accessLevel: 'public',
        abstractVisible: true,
      }, file || undefined);

      setUploadProgress(100);

      if (result) {
        toast({
          title: 'Research Uploaded!',
          description: 'Your paper has been successfully uploaded and is now searchable.',
        });
        navigate('/dashboard');
      } else {
        setError('Failed to upload research. Please try again.');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const keywordTags = keywords.split(',').map(k => k.trim()).filter(k => k);

  if (authLoading || !user) {
    return (
      <Layout>
        <div className="container max-w-3xl py-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-3xl py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl flex items-center gap-3">
            <Upload className="h-7 w-7 text-accent" />
            Upload Research
          </h1>
          <p className="mt-2 text-muted-foreground">
            Share your academic paper with the Vincentian research community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* File Upload */}
          <div className="rounded-xl border border-border bg-card p-6">
            <Label className="text-base font-semibold mb-4 block">Research File (PDF)</Label>
            
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={cn(
                "relative rounded-xl border-2 border-dashed p-8 text-center transition-all",
                file 
                  ? "border-success bg-success/5" 
                  : "border-border hover:border-primary hover:bg-primary/5 cursor-pointer"
              )}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/20">
                    <Check className="h-7 w-7 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="gap-1"
                    >
                      <X className="h-3 w-3" />
                      Remove
                    </Button>
                    <Button
                      type="button"
                      variant="accent"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        performOCR();
                      }}
                      disabled={isScanning}
                      className="gap-1"
                    >
                      {isScanning ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      {isScanning ? 'Scanning...' : 'Auto-Extract with OCR'}
                    </Button>
                  </div>
                  
                  {/* OCR Progress */}
                  {isScanning && (
                    <div className="w-full mt-4 animate-fade-in">
                      <p className="text-sm text-muted-foreground mb-2">{scanProgress.status}</p>
                      <Progress value={scanProgress.progress} className="h-2" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                    <FileText className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">
                      Drop your PDF here or <span className="text-primary">browse</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Maximum file size: 50MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Research Classification */}
          <ResearchLabelSelect
            label={label}
            strand={strand}
            academicYear={academicYear}
            onLabelChange={setLabel}
            onStrandChange={setStrand}
            onAcademicYearChange={setAcademicYear}
          />

          {/* Title */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-semibold">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter the title of your research paper"
                className="h-12 text-base"
                required
              />
            </div>
          </div>

          {/* Keywords */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="space-y-2">
              <Label htmlFor="keywords" className="text-base font-semibold">
                Keywords <span className="text-destructive">*</span>
              </Label>
              <Input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Enter keywords separated by commas (e.g., AI, healthcare, diagnostics)"
                required
              />
              {keywordTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {keywordTags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="bg-accent/20 text-accent-foreground"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Abstract */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="space-y-2">
              <Label htmlFor="abstract" className="text-base font-semibold">
                Abstract <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="abstract"
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                placeholder="Enter the abstract of your research paper..."
                className="min-h-[200px] resize-y"
                required
              />
              <p className="text-xs text-muted-foreground">
                {abstract.length} characters
              </p>
            </div>
          </div>

          {/* Auto-Generated Citations */}
          {showCitations && (citationApa || citationMla) && (
            <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Quote className="h-4 w-4 text-primary" />
                  Auto-Generated Citations
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={() => setShowCitations(false)}
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">APA 7th Edition</p>
                  <div className="rounded-lg bg-secondary/50 p-3 text-sm text-primary">
                    {citationApa}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">MLA 9th Edition</p>
                  <div className="rounded-lg bg-secondary/50 p-3 text-sm text-primary">
                    {citationMla}
                  </div>
                </div>
              </div>
              
              {extractedAuthors.length > 0 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Authors detected: {extractedAuthors.join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="font-medium">Uploading your research...</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <p className="mt-2 text-sm text-muted-foreground">{uploadProgress}% complete</p>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              disabled={isUploading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading}
              className="flex-1 gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Research
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
