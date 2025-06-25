import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { HistoryFrame } from './screens/HistoryFrame/HistoryFrame';
import { LandingPage } from './components/landing/LandingPage';

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const [showPortal, setShowPortal] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-spin"></div>
            <div className="text-neutral-600 font-medium">Loading your workspace...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show landing page if portal hasn't been accessed yet
  if (!showPortal) {
    return <LandingPage onEnterPortal={() => setShowPortal(true)} />;
  }

  // Show login form if user is not authenticated
  if (!user) {
    return <LoginForm />;
  }

  // Show main application
  return <HistoryFrame />;
};

export const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;