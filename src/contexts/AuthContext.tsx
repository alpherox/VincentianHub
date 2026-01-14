import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User as AppUser, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<AppUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from database with retry logic
  const fetchUserProfile = async (userId: string, retries: number = 3, delay: number = 500): Promise<AppUser | null> => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Fetch profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (profileError || !profile) {
          // If this is not the last attempt, wait and retry
          if (attempt < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
            continue;
          }
          console.error('Error fetching profile:', profileError);
          return null;
        }

        // Fetch role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single();

        const role = roleError ? 'student' : (roleData?.role as UserRole || 'student');

        return {
          id: userId,
          email: profile.email,
          fullName: profile.full_name,
          role,
          bio: profile.bio || undefined,
          affiliation: profile.affiliation || undefined,
          avatar: profile.avatar_url || undefined,
          createdAt: new Date(profile.created_at),
        };
      } catch (error) {
        // If this is not the last attempt, wait and retry
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
          continue;
        }
        console.error('Error in fetchUserProfile:', error);
        return null;
      }
    }
    return null;
  };

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        // Defer profile fetch with setTimeout to avoid deadlock
        if (session?.user) {
          setIsLoading(true);
          setTimeout(() => {
            fetchUserProfile(session.user.id).then(profile => {
              setUser(profile);
              setIsLoading(false);
            });
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id).then(profile => {
          setUser(profile);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        setUser(profile);
      }

      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      return { success: false, error: error.message || 'An error occurred during login.' };
    }
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string, role: UserRole) => {
    setIsLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Explicitly create profile and user_role records
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            email: email,
            full_name: fullName,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Continue anyway - profile might be created by trigger
        }

        // Create user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: role,
          });

        if (roleError) {
          console.error('Error creating user role:', roleError);
          // Continue anyway - role might be created by trigger
        }

        // Fetch the created profile
        const profile = await fetchUserProfile(data.user.id);
        setUser(profile);
      }

      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      return { success: false, error: error.message || 'An error occurred during registration.' };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<AppUser>) => {
    if (!user || !session?.user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.fullName,
        bio: updates.bio,
        affiliation: updates.affiliation,
        avatar_url: updates.avatar,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (!error) {
      setUser({ ...user, ...updates });
    }
  }, [user, session]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!session?.user,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
