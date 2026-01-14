import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SearchBar } from '@/components/search/SearchBar';
import { ResearchCard } from '@/components/research/ResearchCard';
import { Button } from '@/components/ui/button';
import { useResearch } from '@/contexts/ResearchContext';
import { useAuth } from '@/contexts/AuthContext';
import { useStats } from '@/hooks/useStats';
import { BookOpen, Users, FileText, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';

export default function Index() {
  const { researches } = useResearch();
  const { isAuthenticated } = useAuth();
  const { data: statsData, isLoading: statsLoading } = useStats();
  
  // Get recent/featured researches
  const featuredResearches = researches.slice(0, 3);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-10%,hsl(var(--primary)/0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,hsl(var(--accent)/0.1),transparent_50%)]" />
        
        <div className="container relative py-20 sm:py-28 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            {/* Logo Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary animate-fade-in">
              <BookOpen className="h-4 w-4" />
              Vincentian Research Repository
            </div>
            
            {/* Headline */}
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              VincentiansFile
            </h1>
            
            {/* Tagline */}
            <p className="mb-10 text-lg text-muted-foreground sm:text-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Your Hub for Vincentian Research Discovery
            </p>
            
            {/* Search Bar */}
            <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <SearchBar size="large" autoNavigate className="mx-auto" />
            </div>
            
            {/* CTA Buttons */}
            {!isAuthenticated && (
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Link to="/auth">
                  <Button variant="hero" size="xl">
                    Log In
                  </Button>
                </Link>
                <Link to="/auth?mode=register">
                  <Button variant="hero-accent" size="xl">
                    Sign Up
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>


      {/* Featured Research Section */}
      <section className="container py-16 sm:py-20">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Featured Research</h2>
            <p className="mt-2 text-muted-foreground">
              Explore the latest contributions from our community
            </p>
          </div>
          <Link to="/search">
            <Button variant="outline" className="gap-2">
              View All Research
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredResearches.map((research, index) => (
            <div 
              key={research.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <ResearchCard research={research} />
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-gradient-to-b from-secondary/30 to-background">
        <div className="container py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
              Ready to Share Your Research?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Join our community of researchers and make your work accessible to students and scholars worldwide.
            </p>
            <Link to="/auth?mode=register">
              <Button variant="hero-accent" size="xl">
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
