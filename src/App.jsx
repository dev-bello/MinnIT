import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { HistoryFrame } from './screens/HistoryFrame/HistoryFrame';
import { LandingPage } from './components/landing/LandingPage';
import { AlertCircleIcon, RefreshCwIcon } from 'lucide-react';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="glass-effect rounded-2xl p-8 shadow-soft border-0 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircleIcon className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-red-800 mb-2">Something went wrong</h2>
              <p className="text-red-700 mb-6">
                We encountered an unexpected error. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent = () => {
  const { user, isLoading, error: authError } = useAuth();
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'login', 'portal'
  const [appError, setAppError] = useState('');

  // Handle authentication errors
  useEffect(() => {
    if (authError) {
      setAppError(authError);
    }
  }, [authError]);

  // Clear errors when view changes
  useEffect(() => {
    setAppError('');
  }, [currentView]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8 animate-pulse">
          <div className="flex items-center space-x-4">
            <RefreshCwIcon className="w-8 h-8 text-primary-600 animate-spin" />
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
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;