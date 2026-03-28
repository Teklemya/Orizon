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
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

/**
 * User type - matches our profiles table
 */
type User = {
  id: string;
  email: string;
  displayName?: string;
  accessToken: string;
  isAdmin: boolean;
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

function normalizeRedirectBase(url: string | undefined): string | null {
  if (!url) return null;
  const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  return withProtocol.replace(/\/+$/, "");
}

function getHost(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const isLocalHost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "::1";

const normalizedConfiguredRedirectBase = normalizeRedirectBase(
  configuredAuthRedirectBase
);

const runtimeOrigin = window.location.origin.replace(/\/+$/, "");
const runtimeHost = window.location.hostname;
const configuredHost = getHost(normalizedConfiguredRedirectBase);

const isVercelPreview =
  runtimeHost.endsWith(".vercel.app") &&
  !!configuredHost &&
  runtimeHost !== configuredHost;

const isPrivateNetworkHost =
  /^10\./.test(runtimeHost) ||
  /^192\.168\./.test(runtimeHost) ||
  /^172\.(1[6-9]|2\d|3[0-1])\./.test(runtimeHost);

const authRedirectBase =
  isLocalHost || isVercelPreview || isPrivateNetworkHost
    ? runtimeOrigin
    : normalizedConfiguredRedirectBase || window.location.origin;

function buildRedirectUrl(path = ""): string {
  if (!path) return authRedirectBase;
  return `${authRedirectBase}${path.startsWith("/") ? path : `/${path}`}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  function isAdminValue(value: unknown): boolean {
    if (value === true) return true;
    if (typeof value === "string") return value.toLowerCase() === "admin";
    if (Array.isArray(value)) return value.some((item) => isAdminValue(item));
    return false;
  }

  function hasAdminRole(supabaseUser: SupabaseUser): boolean {
    const appMetadata = supabaseUser.app_metadata as Record<string, unknown> | undefined;
    const userMetadata = supabaseUser.user_metadata as Record<string, unknown> | undefined;

    return [
      appMetadata?.role,
      appMetadata?.roles,
      appMetadata?.is_admin,
      appMetadata?.isAdmin,
      userMetadata?.role,
      userMetadata?.roles,
      userMetadata?.is_admin,
      userMetadata?.isAdmin,
    ].some((value) => isAdminValue(value));
  }

  async function getProfileRole(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (error) return null;

    const role = (data as { role?: unknown } | null)?.role;
    return typeof role === "string" ? role : null;
  }

  async function mapSessionUser(session: Session | null): Promise<User | null> {
    const supabaseUser = session?.user ?? null;
    if (!supabaseUser || !session?.access_token) return null;

    const profileRole = await getProfileRole(supabaseUser.id);

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      displayName: supabaseUser.user_metadata?.display_name,
      accessToken: session.access_token,
      isAdmin:
        hasAdminRole(supabaseUser) ||
        profileRole?.toLowerCase() === "admin",
    };
  }

  /**
   * On mount: Check for existing session
   * This runs once when the app loads
   */
  useEffect(() => {
    let mounted = true;

    async function syncUser(session: Session | null) {
      const nextUser = await mapSessionUser(session);
      if (!mounted) return;
      setUser(nextUser);
      setLoading(false);
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      void syncUser(session);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncUser(session);
    });

    // Cleanup listener on unmount
    return () => {
      mounted = false;
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
      setUser(await mapSessionUser(data.session));
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
    setUser(await mapSessionUser(data.session ?? null));
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
        // Redirect directly to a stable protected route to avoid losing URL tokens.
        redirectTo: buildRedirectUrl("/dashboard"),
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
