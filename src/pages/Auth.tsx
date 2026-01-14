import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { BookOpen, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState('');
  
  const { login, register, isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  // Update mode based on URL params
  useEffect(() => {
    setIsLogin(searchParams.get('mode') !== 'register');
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isLogin && !fullName) {
      setError('Please enter your full name.');
      return;
    }

    let result;
    if (isLogin) {
      result = await login(email, password);
    } else {
      result = await register(email, password, fullName, role);
    }

    if (result.success) {
      toast({
        title: isLogin ? 'Welcome back!' : 'Account created!',
        description: isLogin 
          ? 'You have been logged in successfully.' 
          : 'Your account has been created successfully.',
      });
      navigate('/dashboard');
    } else {
      setError(result.error || 'An error occurred. Please try again.');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    navigate(isLogin ? '/auth?mode=register' : '/auth');
  };

  return (
    <Layout showFooter={false}>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="w-full max-w-md animate-scale-in">
          {/* Header */}
          <div className="mb-8 text-center">
            <Link to="/" className="mb-6 inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary">VincentiansFile</span>
            </Link>
            <h1 className="mt-6 text-2xl font-bold">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isLogin 
                ? 'Sign in to access your research dashboard' 
                : 'Join the Vincentian research community'
              }
            </p>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive animate-fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name (Register only) */}
              {!isLogin && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="pl-10"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
                {!isLogin && (
                  <p className="text-xs text-muted-foreground">
                    Must be at least 6 characters
                  </p>
                )}
              </div>

              {/* Role Selection (Register only) */}
              {!isLogin && (
                <div className="space-y-3 animate-fade-in">
                  <Label>I am a</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                        role === 'student'
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="text-2xl">🎓</span>
                      <span className="text-sm font-medium">Student</span>
                      <span className="text-xs text-muted-foreground text-center">
                        Upload and Manage Research
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('researcher')}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                        role === 'researcher'
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="text-2xl">👨‍🏫</span>
                      <span className="text-sm font-medium">Teacher</span>
                      <span className="text-xs text-muted-foreground text-center">
                        Evaluate and Read Research
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </span>{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="font-medium text-primary hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </div>

          {/* Demo Hint */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            © 2026 VincentiansFile. All rights reserved.
          </p>
        </div>
      </div>
    </Layout>
  );
}
