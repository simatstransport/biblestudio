import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';

let supabaseAdminInstance: SupabaseClient | null = null;

/**
 * Returns a singleton admin Supabase client with service_role privileges (backend only).
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  if (config.supabase.url && config.supabase.serviceRoleKey) {
    supabaseAdminInstance = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    return supabaseAdminInstance;
  }

  return null;
}

/**
 * Creates a user-scoped Supabase client that respects RLS with the user's JWT.
 */
export function getSupabaseUserClient(accessToken: string): SupabaseClient | null {
  if (config.supabase.url && config.supabase.anonKey) {
    return createClient(config.supabase.url, config.supabase.anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return null;
}
