import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
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
      {/* Public marketing homepage — has its own layout */}
      <Route path="/" element={<HomePage />} />

      {/* App routes — wrapped in the internal Layout */}
      <Route element={<Layout />}>
        {/* Public auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes — require authentication */}
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
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />

        {/* Fallback for unknown app routes → back to homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
