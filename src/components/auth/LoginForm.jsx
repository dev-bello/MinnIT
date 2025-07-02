import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { EyeIcon, EyeOffIcon, ShieldCheckIcon, UserIcon, LockIcon, ArrowLeftIcon } from 'lucide-react';

export const LoginForm = ({ onBackToLanding }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    if (!result.success) {
      // Show specific error message from Supabase
      if (result.error.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (result.error.includes('Email not confirmed')) {
        setError('Please check your email and confirm your account before signing in.');
      } else {
        setError(result.error);
      }
    }
  };

  const fillCredentials = (email, password) => {
    setEmail(email);
    setPassword(password);
    setError(''); // Clear any existing errors
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md animate-fade-in relative z-10">
        {/* Back Button */}
        {onBackToLanding && (
          <Button
            onClick={onBackToLanding}
            variant="outline"
            className="mb-6 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        )}

        <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              MinnIT Portal
            </h1>
            <p className="text-gray-300 font-medium">Welcome back! Please sign in to continue</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-200 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <LockIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm animate-slide-down backdrop-blur-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900 text-gray-400 font-medium">Quick Login</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">
                Use these credentials to test different user roles:
              </p>
              <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-3 py-2 rounded-lg text-xs mb-4 backdrop-blur-sm">
                <strong>Note:</strong> These are demo accounts. You'll need to create them in your Supabase Auth panel first.
              </div>
              <div className="space-y-2 text-xs">
                <button
                  onClick={() => fillCredentials('developer@example.com', 'dev123')}
                  className="block w-full p-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200 text-left"
                >
                  <span className="text-red-400 font-semibold">Developer:</span> developer@example.com / dev123
                </button>
                <button
                  onClick={() => fillCredentials('admin@example.com', 'admin123')}
                  className="block w-full p-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200 text-left"
                >
                  <span className="text-blue-400 font-semibold">Admin:</span> admin@example.com / admin123
                </button>
                <button
                  onClick={() => fillCredentials('guard@example.com', 'guard123')}
                  className="block w-full p-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200 text-left"
                >
                  <span className="text-green-400 font-semibold">Guard:</span> guard@example.com / guard123
                </button>
                <button
                  onClick={() => fillCredentials('resident@example.com', 'resident123')}
                  className="block w-full p-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200 text-left"
                >
                  <span className="text-purple-400 font-semibold">Resident:</span> resident@example.com / resident123
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};