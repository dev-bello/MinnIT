import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import { useAuth } from '../../contexts/AuthContext';
import { EyeIcon, EyeOffIcon, ShieldCheckIcon, UserIcon, LockIcon, ArrowLeftIcon, MailIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react';

export const LoginForm = ({ onBackToLanding }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, resetPassword, isLoading: authLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      if (isResetPassword) {
        const result = await resetPassword(email);
        if (result.success) {
          setSuccess('Password reset email sent! Check your inbox.');
          setIsResetPassword(false);
        } else {
          setError(result.error);
        }
      } else if (isLogin) {
        const result = await login(email, password);
        if (!result.success) {
          if (result.error.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please check your credentials and try again.');
          } else if (result.error.includes('Email not confirmed')) {
            setError('Please check your email and confirm your account before signing in.');
          } else {
            setError(result.error);
          }
        }
      } else {
        // Registration
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          return;
        }
        
        const result = await register(email, password, name);
        if (result.success) {
          setSuccess('Registration successful! Please check your email to confirm your account.');
          setIsLogin(true);
        } else {
          setError(result.error);
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setError('');
    setSuccess('');
    setIsLogin(true);
    setIsResetPassword(false);
  };

  const toggleMode = () => {
    resetForm();
    setIsLogin(!isLogin);
  };

  const handleResetPassword = () => {
    resetForm();
    setIsResetPassword(true);
  };

  const handleBackToLogin = () => {
    resetForm();
    setIsLogin(true);
    setIsResetPassword(false);
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
              {isResetPassword ? 'Reset Password' : (isLogin ? 'MinnIT Portal' : 'Create Account')}
            </h1>
            <p className="text-gray-300 font-medium">
              {isResetPassword 
                ? 'Enter your email to receive a password reset link'
                : (isLogin ? 'Welcome back! Please sign in to continue' : 'Join MinnIT for secure visitor management')
              }
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm animate-slide-down backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <AlertCircleIcon className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}
            
            {success && (
              <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-xl text-sm animate-slide-down backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name field for registration */}
              {!isLogin && !isResetPassword && (
                <div className="space-y-4">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-200 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-4">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <MailIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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

              {/* Password fields */}
              {!isResetPassword && (
                <>
                  <div className="space-y-4">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-200 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <LockIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
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

                  {/* Confirm Password for registration */}
                  {!isLogin && (
                    <div className="space-y-4">
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-200 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <LockIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-12 pr-12 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Confirm your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || authLoading}
                className="w-full py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {isLoading || authLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>
                      {isResetPassword ? 'Sending...' : (isLogin ? 'Signing in...' : 'Creating Account...')}
                    </span>
                  </div>
                ) : (
                  isResetPassword ? 'Send Reset Link' : (isLogin ? 'Sign In' : 'Create Account')
                )}
              </Button>
            </form>

            {/* Action Links */}
            <div className="space-y-4 pt-6 border-t border-white/20">
              {isLogin && !isResetPassword && (
                <>
                  <button
                    onClick={toggleMode}
                    className="w-full text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Don't have an account? Sign up
                  </button>
                  <button
                    onClick={handleResetPassword}
                    className="w-full text-sm text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    Forgot your password?
                  </button>
                </>
              )}
              
              {!isLogin && !isResetPassword && (
                <button
                  onClick={toggleMode}
                  className="w-full text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Already have an account? Sign in
                </button>
              )}
              
              {isResetPassword && (
                <button
                  onClick={handleBackToLogin}
                  className="w-full text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Back to sign in
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};