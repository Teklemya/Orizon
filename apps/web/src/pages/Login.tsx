/**
 * Login/Signup Page with Supabase Auth
 * 
 * CHANGES FROM DEMO VERSION:
 * - Added mode toggle: "login" vs "signup"
 * - Integrated real Supabase auth methods
 * - Added Google OAuth button
 * - Added "Forgot Password" flow
 * - Added loading states (disable buttons during API calls)
 * - Added email confirmation detection
 * - Added session redirect (if logged in, go to dashboard)
 * - Minimalist styling preserved (white bg, black text, subtle borders)
 */

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

type Mode = "login" | "signup" | "forgot-password";

export default function Login() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { user, loading, signIn, signUp, signInWithGoogle, resetPassword } = useAuth();

  /**
   * If user is already logged in, redirect to dashboard
   */
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  /**
   * Handle form submission based on current mode
   */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setMessage(null);

    // Validation
    if (!email || !password) {
      setErr("Please fill in all fields");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setErr("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setErr("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "login") {
        const result = await signIn(email, password);
        if (result.error) {
          setErr(result.error);
        } else {
          // Success - auth context will handle redirect
          navigate("/dashboard");
        }
      } else if (mode === "signup") {
        const result = await signUp(email, password);
        if (result.error) {
          setErr(result.error);
        } else if (result.needsConfirmation) {
          setMessage("Check your email to confirm your account before logging in.");
          setMode("login");
        } else {
          // Auto-logged in, redirect
          navigate("/dashboard");
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Handle forgot password flow
   */
  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setMessage(null);

    if (!email) {
      setErr("Please enter your email address");
      return;
    }

    setSubmitting(true);

    try {
      const result = await resetPassword(email);
      if (result.error) {
        setErr(result.error);
      } else {
        setMessage("Password reset link sent. Check your email.");
        setTimeout(() => setMode("login"), 3000);
      }
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Handle Google OAuth
   */
  async function handleGoogleSignIn() {
    setErr(null);
    setSubmitting(true);

    const result = await signInWithGoogle();
    if (result.error) {
      setErr(result.error);
      setSubmitting(false);
    }
    // On success, user will be redirected by Supabase
  }

  // Show loading state while checking session
  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow p-6 text-center">
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow p-6">
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">
          {mode === "forgot-password" ? "Reset Password" : mode === "signup" ? "Sign Up" : "Log In"}
        </h1>
        {mode !== "forgot-password" && (
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setErr(null);
              setMessage(null);
            }}
            className="text-sm text-gray-600 hover:text-black"
            type="button"
          >
            {mode === "login" ? "Need an account?" : "Have an account?"}
          </button>
        )}
      </div>

      {/* Google Sign In Button */}
      {mode !== "forgot-password" && (
        <>
          <button
            onClick={handleGoogleSignIn}
            disabled={submitting}
            type="button"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with email</span>
            </div>
          </div>
        </>
      )}

      {/* Email/Password Form */}
      <form onSubmit={mode === "forgot-password" ? handleForgotPassword : handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm text-gray-600">Email</span>
          <input
            type="email"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
          />
        </label>

        {mode !== "forgot-password" && (
          <label className="block">
            <span className="text-sm text-gray-600">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </label>
        )}

        {mode === "signup" && (
          <label className="block">
            <span className="text-sm text-gray-600">Confirm Password</span>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </label>
        )}

        {/* Forgot password link */}
        {mode === "login" && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => setMode("forgot-password")}
              className="text-sm text-gray-600 hover:text-black"
            >
              Forgot password?
            </button>
          </div>
        )}

        {/* Error message */}
        {err && (
          <div className="text-sm text-black bg-gray-100 rounded-lg p-3">
            {err}
          </div>
        )}

        {/* Success message */}
        {message && (
          <div className="text-sm text-black bg-gray-100 rounded-lg p-3">
            {message}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-black text-white py-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {submitting
            ? "Please wait..."
            : mode === "forgot-password"
            ? "Send Reset Link"
            : mode === "signup"
            ? "Create Account"
            : "Log In"}
        </button>

        {/* Back to login from forgot password */}
        {mode === "forgot-password" && (
          <button
            type="button"
            onClick={() => setMode("login")}
            className="w-full text-sm text-gray-600 hover:text-black"
          >
            Back to login
          </button>
        )}
      </form>
    </div>
  );
}
