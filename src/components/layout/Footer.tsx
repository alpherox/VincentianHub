import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container py-12">
        <div className="grid gap-8 sm:grid-cols-2">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-primary">VincentiansFile</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your hub for Vincentian research discovery. Connecting researchers and students through knowledge.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/search" className="text-muted-foreground transition-colors hover:text-foreground">
                  Search Research
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-muted-foreground transition-colors hover:text-foreground">
                  Log In
                </Link>
              </li>
              <li>
                <Link to="/auth?mode=register" className="text-muted-foreground transition-colors hover:text-foreground">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} VincentiansFile. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
