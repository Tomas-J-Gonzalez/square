'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  email_confirmed: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  userProfile: UserProfile | null; // Add this for compatibility
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true

  // Check for existing user in localStorage on mount
  useEffect(() => {
    console.log('AuthContext: Initializing, checking localStorage');
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('AuthContext: Found stored user:', userData);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    } else {
      console.log('AuthContext: No stored user found');
    }
    setLoading(false); // Set loading to false after checking localStorage
  }, []);

  // Monitor user state changes
  useEffect(() => {
    console.log('AuthContext: User state changed:', user);
  }, [user]);

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      console.log('=== AUTHCONTEXT SIGNUP START ===');
      console.log('AuthContext: Starting registration for', email);
      console.log('AuthContext: Request payload:', { name, email, password: '[HIDDEN]' });
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      console.log('AuthContext: Response status:', response.status);
      console.log('AuthContext: Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('AuthContext: Registration response data:', data);

      if (data.success) {
        console.log('AuthContext: Registration successful');
        // Don't set user immediately - they need to confirm email
        console.log('=== AUTHCONTEXT SIGNUP SUCCESS ===');
        return { error: null };
      } else {
        console.log('AuthContext: Registration failed:', data.error);
        console.log('=== AUTHCONTEXT SIGNUP FAILED ===');
        return { error: data.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      console.log('=== AUTHCONTEXT SIGNUP ERROR ===');
      return { error: 'Network error. Please check your connection and try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('AuthContext: Starting login for', email);
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('AuthContext: Login response:', data);

      if (data.success) {
        console.log('AuthContext: Login successful, setting user:', data.user);
        setUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        console.log('AuthContext: User stored in localStorage');
        // Add a small delay to ensure state is properly set
        await new Promise(resolve => setTimeout(resolve, 50));
        console.log('AuthContext: Login process completed');
        return { error: null };
      } else {
        console.log('AuthContext: Login failed:', data.error);
        return { error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      // Clear local state
      setUser(null);
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/password-reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return { error: data.error || null };
    } catch (error) {
      console.error('Password reset error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      return { error: data.error || null };
    } catch (error) {
      console.error('Password update error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userProfile: user, // Use the same user data for both
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
