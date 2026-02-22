/**
 * Supabase Client Setup
 * 
 * This file initializes the Supabase client with your project credentials.
 * The client is used throughout the app for authentication and database access.
 * 
 * Environment variables required:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anon/public key
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file."
  );
}

/**
 * Singleton Supabase client instance
 * 
 * This client handles:
 * - Authentication (sign up, sign in, OAuth, etc.)
 * - Database queries with RLS (Row Level Security)
 * - Real-time subscriptions
 * - Storage operations
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Auto-refresh tokens before expiry
    autoRefreshToken: true,
    // Persist session in localStorage
    persistSession: true,
    // Detect session from URL after OAuth redirect
    detectSessionInUrl: true,
  },
});
