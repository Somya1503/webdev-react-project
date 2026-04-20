import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User as AppUser } from '../types';
import { supabase } from '../services/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  sessionUser: SupabaseUser | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionUser, setSessionUser] = useState<SupabaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSessionUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    }).catch((err: any) => {
      console.error('Session fetch error:', err);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSessionUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setAppUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string, isRetry = false) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (data && !error) {
      setAppUser({
        id: data.id,
        name: data.name,
        email: data.phone, // We map email to the phone column in the prototype DB if needed, or update DB.
        role: data.role,
        bloodType: data.blood_type,
        isAvailable: data.is_available,
      });
    } else if (error && error.code === 'PGRST116' && !isRetry) {
      // Profile is missing in the database. Let's auto-create it!
      const { data: { session } } = await supabase.auth.getSession();
      const currentEmail = session?.user?.email || `user-${userId.substring(0, 5)}@example.com`;
      
      const { error: insertError } = await supabase.from('users').insert({
        id: userId,
        name: currentEmail.split('@')[0],
        phone: currentEmail,
        role: 'user',
      });
      
      if (!insertError) {
        // Successfully created missing profile, fetch it again
        return fetchUserProfile(userId, true);
      } else {
        console.error('Failed to auto-create missing user profile:', insertError);
      }
    }
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setAppUser(null);
    setSessionUser(null);
    setIsLoading(false);
  };

  const refreshUser = async () => {
    if (sessionUser) {
      await fetchUserProfile(sessionUser.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user: appUser, sessionUser, isAuthenticated: !!sessionUser, isLoading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
