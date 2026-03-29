/**
 * App Router with Protected Routes
 * 
 * CHANGES:
 * - Wrapped authenticated routes with <ProtectedRoute>
 * - Login page is public (no protection)
 * - All other pages require authentication
 * 
 * Protected routes:
 * - / (Dashboard)
 * - /explore (Dashboard)
 * - /essay-studio
 * - /community
 */

import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Opportunities from "./pages/Opportunities";
import EssayStudio from "./pages/EssayStudio";
import CommunityQA from "./pages/CommunityQA";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Account from "./pages/Account";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Default route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protected routes - require authentication */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/essay-studio"
          element={
            <ProtectedRoute>
              <EssayStudio />
            </ProtectedRoute>
          }
        />
        <Route
          path="/opportunities"
          element={
            <ProtectedRoute>
              <Opportunities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <CommunityQA />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Account"
          element={
            <ProtectedRoute>
              <Opportunities />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

