/**
 * Supabase Authentication Context
 * 
 * This replaces the old localStorage demo auth with real Supabase Auth.
 * 
 * Features:
 * - Email/Password sign up & sign in
 * - Google OAuth
 * - Password reset
 * - Session persistence & auto-refresh
 * - Auth state change listeners
 * 
 * CHANGE SUMMARY:
 * - Added Supabase client import
 * - User now has id, email, display_name from Supabase
 * - Added loading state for async operations
 * - Replaced login() with signIn() and signUp()
 * - Added signInWithGoogle() for OAuth
 * - Added resetPassword() for forgot password flow
 * - Added session detection on mount
 * - Added auth state change listener
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { supabase } from "./supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/**
 * User type - matches our profiles table
 */
type User = {
  id: string;
  email: string;
  displayName?: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; success?: boolean }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const configuredAuthRedirectBase = (
  import.meta.env.VITE_AUTH_REDIRECT_URL as string | undefined
)?.trim();

const authRedirectBase =
  configuredAuthRedirectBase && configuredAuthRedirectBase.length > 0
    ? configuredAuthRedirectBase.replace(/\/+$/, "")
    : window.location.origin;

function buildRedirectUrl(path = ""): string {
  if (!path) return authRedirectBase;
  return `${authRedirectBase}${path.startsWith("/") ? path : `/${path}`}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Maps Supabase user to our User type
   */
  const mapSupabaseUser = (supabaseUser: SupabaseUser | null): User | null => {
    if (!supabaseUser) return null;
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      displayName: supabaseUser.user_metadata?.display_name,
    };
  };

  /**
   * On mount: Check for existing session
   * This runs once when the app loads
   */
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(mapSupabaseUser(session?.user ?? null));
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapSupabaseUser(session?.user ?? null));
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign up with email & password
   * Creates user in auth.users and triggers profile creation
   */
  async function signUp(
    email: string,
    password: string
  ): Promise<{ error?: string; needsConfirmation?: boolean }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Email confirmation redirect (if enabled in Supabase settings)
        emailRedirectTo: buildRedirectUrl("/dashboard"),
      },
    });

    if (error) {
      return { error: error.message };
    }

    // Check if email confirmation is required
    const needsConfirmation = data.user && !data.session;

    // If confirmation is not required, session exists and user is signed in.
    if (data.session?.user) {
      setUser(mapSupabaseUser(data.session.user));
      setLoading(false);
    }

    return { needsConfirmation: !!needsConfirmation };
  }

  /**
   * Sign in with email & password
   */
  async function signIn(
    email: string,
    password: string
  ): Promise<{ error?: string }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    // Set user immediately to avoid route-guard race conditions on navigation.
    setUser(mapSupabaseUser(data.user ?? null));
    setLoading(false);

    return {};
  }

  /**
   * Sign in with Google OAuth
   * Opens Google login popup/redirect
   */
  async function signInWithGoogle(): Promise<{ error?: string }> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Redirect to app origin so callbacks stay valid across deployed domains.
        redirectTo: buildRedirectUrl(),
      },
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  }

  /**
   * Sign out - clears session
   */
  async function signOut(): Promise<void> {
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  }

  /**
   * Reset password - sends email with reset link
   */
  async function resetPassword(
    email: string
  ): Promise<{ error?: string; success?: boolean }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: buildRedirectUrl("/reset-password"),
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  }

  const value: AuthContextValue = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
