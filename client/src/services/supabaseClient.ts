import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Pre-configured fallback to ensure Google Sign-in always connects
const FALLBACK_SUPABASE_URL = 'https://cegivfqdxcuoljxpezzt.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZ2l2ZnFkeGN1b2xqeHBlenp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5MDI5MDEsImV4cCI6MjEwODQ3ODkwMX0.n4wXULf-WRSURhb_0Qfd_mDKLTWfoAlDCZd_irmFIS8';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const rawAnon = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

export const supabaseUrl = rawUrl.trim();
export const supabaseAnonKey = rawAnon.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-supabase')
);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

/**
 * Initiates Google OAuth redirect through Supabase.
 */
export async function signInWithGoogle() {
  if (!supabase) {
    throw new Error('Supabase client is not available.');
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  });

  if (error) {
    throw error;
  }
}

/**
 * Signs out from Supabase Auth session.
 */
export async function signOutFromSupabase() {
  if (supabase) {
    await supabase.auth.signOut();
  }
}
