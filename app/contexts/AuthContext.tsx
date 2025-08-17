'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  email_confirmed: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Ensure we only run on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    // If Supabase is not available, just set loading to false
    if (!supabase) {
      setLoading(false);
      return;
    }

    let subscription: any;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.email!);
        }
        
        setLoading(false);

        // Listen for auth changes
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event: any, session: Session | null) => {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            fetchUserProfile(session.user.email!);
          } else {
            setUserProfile(null);
          }
          setLoading(false);
        });

        subscription = authSubscription;
      } catch (error) {
        console.error('Error setting up auth listener:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [mounted]);

  const fetchUserProfile = async (email: string) => {
    if (!supabase || !mounted) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (!supabase || !mounted) {
      return { error: { message: 'Supabase not configured' } };
    }
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      return { error };
    } catch (error) {
      return { error: { message: 'Registration failed' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase || !mounted) {
      return { error: { message: 'Supabase not configured' } };
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: { message: 'Authentication failed' } };
    }
  };

  const signOut = async () => {
    if (!supabase || !mounted) return;
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    if (!supabase || !mounted) {
      return { error: { message: 'Supabase not configured' } };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error: { message: 'Password reset failed' } };
    }
  };

  const updatePassword = async (password: string) => {
    if (!supabase || !mounted) {
      return { error: { message: 'Supabase not configured' } };
    }
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      return { error };
    } catch (error) {
      return { error: { message: 'Password update failed' } };
    }
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>;
  }

  // If Supabase is not available, provide a fallback context
  if (!supabase) {
    const fallbackValue = {
      user: null,
      userProfile: null,
      session: null,
      loading: false,
      signUp: async () => ({ error: { message: 'Supabase not configured' } }),
      signIn: async () => ({ error: { message: 'Supabase not configured' } }),
      signOut: async () => {},
      resetPassword: async () => ({ error: { message: 'Supabase not configured' } }),
      updatePassword: async () => ({ error: { message: 'Supabase not configured' } }),
    };
    return <AuthContext.Provider value={fallbackValue}>{children}</AuthContext.Provider>;
  }

  const value = {
    user,
    userProfile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
