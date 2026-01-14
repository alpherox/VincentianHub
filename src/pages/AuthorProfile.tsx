import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ResearchCard } from '@/components/research/ResearchCard';
import { useResearch } from '@/contexts/ResearchContext';
import { mockUsers } from '@/data/mockData';
import { 
  ArrowLeft, User, Building, Mail, 
  FileText, Eye, Calendar 
} from 'lucide-react';

export default function AuthorProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getResearchesByAuthor } = useResearch();

  const author = mockUsers.find(u => u.id === id);
  const authorResearches = getResearchesByAuthor(id || '');
  const totalViews = authorResearches.reduce((sum, r) => sum + r.views, 0);

  if (!author) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <User className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <h1 className="mt-4 text-2xl font-bold">Author Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The author profile you're looking for doesn't exist.
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
    });
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6 shadow-card animate-fade-in">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-4xl text-primary-foreground">
                  {author.fullName.charAt(0)}
                </div>
                <h1 className="mt-4 text-xl font-bold">{author.fullName}</h1>
                <p className="text-sm text-muted-foreground capitalize">{author.role}</p>
              </div>

              {/* Details */}
              <div className="mt-6 space-y-3">
                {author.affiliation && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{author.affiliation}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{author.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Member since {formatDate(author.createdAt)}
                  </span>
                </div>
              </div>

              {/* Bio */}
              {author.bio && (
                <div className="mt-6 border-t border-border pt-6">
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {author.bio}
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-secondary p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-xl font-bold text-primary">
                    <FileText className="h-5 w-5" />
                    {authorResearches.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Papers</div>
                </div>
                <div className="rounded-lg bg-secondary p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-xl font-bold text-primary">
                    <Eye className="h-5 w-5" />
                    {totalViews}
                  </div>
                  <div className="text-xs text-muted-foreground">Views</div>
                </div>
              </div>
            </div>
          </aside>

          {/* Research Papers */}
          <main className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Research Papers</h2>
              <p className="text-muted-foreground">
                {authorResearches.length} publication{authorResearches.length !== 1 ? 's' : ''} by {author.fullName}
              </p>
            </div>

            {authorResearches.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {authorResearches.map((research, index) => (
                  <div
                    key={research.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <ResearchCard research={research} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-medium">No publications yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  This author hasn't uploaded any research papers.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}
