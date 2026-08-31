import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types.ts';

function required(name: string, fallback?: string): string {
  const value = (process.env[name] || (fallback ? process.env[fallback] : undefined))?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const isServerSupabaseConfigured = () => Boolean(
  (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)?.trim() &&
  (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY)?.trim(),
);

export function createUserScopedClient(accessToken: string): SupabaseClient<Database> {
  return createClient<Database>(
    required('SUPABASE_URL', 'VITE_SUPABASE_URL'),
    required('SUPABASE_PUBLISHABLE_KEY', 'VITE_SUPABASE_PUBLISHABLE_KEY'),
    {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    },
  );
}

export function createPublicServerClient(): SupabaseClient<Database> {
  return createClient<Database>(
    required('SUPABASE_URL', 'VITE_SUPABASE_URL'),
    required('SUPABASE_PUBLISHABLE_KEY', 'VITE_SUPABASE_PUBLISHABLE_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
}

export function createAdminClient(): SupabaseClient<Database> {
  const secret = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  if (!secret) throw new Error('Missing SUPABASE_SECRET_KEY; this key must remain server-only.');
  return createClient<Database>(required('SUPABASE_URL', 'VITE_SUPABASE_URL'), secret, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
