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

import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Opportunities from "./pages/Opportunities";
import EssayStudio from "./pages/EssayStudio";
import CommunityQA from "./pages/CommunityQA";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* default -> Explore/Dashboard */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/explore" element={<Dashboard />} />

        <Route path="/essay-studio" element={<EssayStudio />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/community" element={<CommunityQA />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes - require authentication */}
        <Route
          path="/"
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
          path="/community"
          element={
            <ProtectedRoute>
              <CommunityQA />
            </ProtectedRoute>
          }
        />

        {/* Fallback to dashboard (protected) */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

