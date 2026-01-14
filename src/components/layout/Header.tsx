import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Search, User, LogOut, Menu, X, Upload, Shield } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden text-xl font-bold text-primary sm:inline-block">
            VincentiansFile
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {isAuthenticated && (
            <Link 
              to="/search" 
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Search className="h-4 w-4" />
              Search
            </Link>
          )}
          
          {isAuthenticated && user?.role === 'student' && (
            <Link 
              to="/upload" 
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Link>
          )}
          
          {isAuthenticated && user?.role === 'admin' && (
            <Link 
              to="/admin" 
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {user?.fullName?.split(' ')[0]}
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link to="/auth?mode=register">
                <Button variant="accent" size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden animate-fade-in">
          <div className="container py-4 space-y-3">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link 
                  to="/search" 
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Search className="h-4 w-4" />
                  Search
                </Link>
                {user?.role === 'student' && (
                  <Link 
                    to="/upload" 
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Upload className="h-4 w-4" />
                    Upload Research
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/auth" 
                  className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link 
                  to="/auth?mode=register"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="accent" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
