import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, signInWithGoogle as supabaseGoogleLogin, signOutFromSupabase } from '../services/supabaseClient.js';
import { User } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isSupabaseConnected: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loginAsDemoUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to official Supabase session
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Faith Creator',
            avatarUrl: session.user.user_metadata?.avatar_url
          });
        } else {
          // Check if local dev session exists
          const localDev = localStorage.getItem('faith_studio_user');
          if (localDev) {
            try { setUser(JSON.parse(localDev)); } catch {}
          }
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Faith Creator',
            avatarUrl: session.user.user_metadata?.avatar_url
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      const savedUser = localStorage.getItem('faith_studio_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    try {
      await supabaseGoogleLogin();
    } catch (err: any) {
      console.error('Google Sign-in error:', err.message);
      throw err;
    }
  };

  const signOut = async () => {
    if (supabase) {
      await signOutFromSupabase();
    }
    localStorage.removeItem('faith_studio_user');
    localStorage.removeItem('faith_studio_dev_token');
    setUser(null);
  };

  const loginAsDemoUser = () => {
    const demoUser: User = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'creator@faithstudio.ai',
      displayName: 'Faith Creator',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop'
    };
    localStorage.setItem('faith_studio_user', JSON.stringify(demoUser));
    localStorage.setItem('faith_studio_dev_token', 'dev-user-demo-token');
    setUser(demoUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isSupabaseConnected: isSupabaseConfigured,
        signInWithGoogle,
        signOut,
        loginAsDemoUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
