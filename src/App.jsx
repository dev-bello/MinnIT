import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { HistoryFrame } from './screens/HistoryFrame/HistoryFrame';
import { LandingPage } from './components/landing/LandingPage';

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'login', 'portal'

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

  // Show main application if user is authenticated
  if (user) {
    return <HistoryFrame />;
  }

  // Handle view routing
  if (currentView === 'landing') {
    return (
      <LandingPage 
        onEnterPortal={() => setCurrentView('login')}
        onGoToLogin={() => setCurrentView('login')}
      />
    );
  }

  if (currentView === 'login') {
    return (
      <LoginForm 
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

  // Default fallback to login
  return (
    <LoginForm 
      onBackToLanding={() => setCurrentView('landing')}
    />
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;