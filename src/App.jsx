import React from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { HistoryFrame } from "./screens/HistoryFrame/HistoryFrame";
import { LandingPage } from "./components/landing/LandingPage";
import { LoginForm } from "./components/auth/LoginForm";
import SetPassword from "./components/auth/SetPassword";
import { RefreshCwIcon } from "lucide-react";

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8">
          <div className="flex items-center space-x-4">
            <RefreshCwIcon className="w-8 h-8 text-primary-600 animate-spin" />
            <div className="text-neutral-600 font-medium">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/" replace />;
};

const PublicRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8">
          <div className="flex items-center space-x-4">
            <RefreshCwIcon className="w-8 h-8 text-primary-600 animate-spin" />
            <div className="text-neutral-600 font-medium">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/set-password" element={<SetPassword />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<HistoryFrame />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
