/**
 * Protected Route Component
 * 
 * This component wraps routes that require authentication.
 * If the user is not logged in, they are redirected to /login.
 * 
 * Usage:
 *   <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 * 
 * How it works:
 * 1. Check if auth is still loading (checking session)
 * 2. If loading, show a loading state
 * 3. If no user, redirect to /login
 * 4. If user exists, render the protected content
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import type { ReactNode } from "react";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Still checking session - show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-black border-r-transparent mb-4" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // No user - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated - render protected content
  return <>{children}</>;
}
