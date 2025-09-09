import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Modal } from "../ui/modal";
import { db } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import {
  EyeIcon,
  EyeOffIcon,
  ShieldCheckIcon,
  UserIcon,
  LockIcon,
  ArrowLeftIcon,
  MailIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from "lucide-react";

import { Link } from "react-router-dom";

export const LoginForm = () => {
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, resetPassword, isLoading: authLoading } = useAuth();

  // Request Demo modal state
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isSubmittingDemo, setIsSubmittingDemo] = useState(false);
  const [demoError, setDemoError] = useState("");
  const [demoSuccess, setDemoSuccess] = useState("");
  const [demoForm, setDemoForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    organisation: "",
    residents: 30,
    tablets: 1,
    notes: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (isResetPassword) {
        const result = await resetPassword(email);
        if (result.success) {
          setSuccess("Password reset email sent! Check your inbox.");
          setIsResetPassword(false);
        } else {
          setError(result.error);
        }
      } else {
        const result = await login(email, password);
        if (!result.success) {
          if (result.error.includes("Invalid login credentials")) {
            setError(
              "Invalid email or password. Please check your credentials and try again."
            );
          } else if (result.error.includes("Email not confirmed")) {
            setError(
              "Please check your email and confirm your account before signing in."
            );
          } else {
            setError(result.error);
          }
        } else if (result.needsPasswordChange) {
          // Redirect to password change page
          window.location.href = "/set-password";
        }
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setError("");
    setSuccess("");
    setIsResetPassword(false);
  };

  const handleResetPassword = () => {
    resetForm();
    setIsResetPassword(true);
  };

  const handleBackToLogin = () => {
    resetForm();
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
        <Link to="/">
          <Button
            variant="outline"
            className="mb-6 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              {isResetPassword ? "Reset Password" : "MinnIT Portal"}
            </h1>
            <p className="text-gray-300 font-medium">
              {isResetPassword
                ? "Enter your email to receive a password reset link"
                : "Welcome back! Please sign in to continue"}
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
              {/* Email field */}
              <div className="space-y-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-200 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <MailIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                    required
                    error={!!error}
                  />
                </div>
              </div>

              {/* Password field */}
              {!isResetPassword && (
                <>
                  <div className="space-y-4">
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-gray-200 mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <LockIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your password"
                        required
                        error={!!error}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOffIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
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
                      {isResetPassword ? "Sending..." : "Signing in..."}
                    </span>
                  </div>
                ) : isResetPassword ? (
                  "Send Reset Link"
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Action Links */}
            <div className="space-y-4 pt-6 border-t border-white/20">
              {!isResetPassword && (
                <>
                  <button
                    onClick={() => setIsDemoOpen(true)}
                    className="w-full text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Don't have an account? Request a demo
                  </button>
                  <button
                    onClick={handleResetPassword}
                    className="w-full text-sm text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    Forgot your password?
                  </button>
                </>
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
      {/* Request Demo Modal */}
      <Modal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        size="md"
        title="Request a Demo"
        align="start"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              setIsSubmittingDemo(true);
              setDemoError("");
              setDemoSuccess("");
              const payload = {
                full_name: demoForm.fullName,
                email: demoForm.email,
                phone: demoForm.phone,
                organisation: demoForm.organisation,
                residents: Math.max(30, Number(demoForm.residents) || 30),
                tablets: Math.max(1, Number(demoForm.tablets) || 1),
                notes: demoForm.notes,
                source: "login",
              };
              await db.createDemoRequest(payload);
              setDemoSuccess(
                "Thanks! Your request has been submitted. We will reach out shortly."
              );
              setTimeout(() => setIsDemoOpen(false), 1200);
            } catch (err) {
              setDemoError("Failed to submit request. Please try again.");
            } finally {
              setIsSubmittingDemo(false);
            }
          }}
          className="bg-white rounded-2xl p-6 border border-neutral-200"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-700 mb-1">
                Full Name
              </label>
              <Input
                value={demoForm.fullName}
                onChange={(e) =>
                  setDemoForm({ ...demoForm, fullName: e.target.value })
                }
                required
                className="bg-white border-neutral-300 text-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={demoForm.email}
                onChange={(e) =>
                  setDemoForm({ ...demoForm, email: e.target.value })
                }
                required
                className="bg-white border-neutral-300 text-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-700 mb-1">
                Phone
              </label>
              <Input
                value={demoForm.phone}
                onChange={(e) =>
                  setDemoForm({ ...demoForm, phone: e.target.value })
                }
                className="bg-white border-neutral-300 text-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-700 mb-1">
                Organisation
              </label>
              <Input
                value={demoForm.organisation}
                onChange={(e) =>
                  setDemoForm({ ...demoForm, organisation: e.target.value })
                }
                className="bg-white border-neutral-300 text-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-700 mb-1">
                Residents (min 30)
              </label>
              <Input
                type="number"
                min={30}
                value={demoForm.residents}
                onChange={(e) =>
                  setDemoForm({
                    ...demoForm,
                    residents: Math.max(30, Number(e.target.value)),
                  })
                }
                className="bg-white border-neutral-300 text-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-700 mb-1">
                Tablets (min 1)
              </label>
              <Input
                type="number"
                min={1}
                value={demoForm.tablets}
                onChange={(e) =>
                  setDemoForm({
                    ...demoForm,
                    tablets: Math.max(1, Number(e.target.value)),
                  })
                }
                className="bg-white border-neutral-300 text-neutral-800"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-neutral-700 mb-1">
                Notes
              </label>
              <textarea
                value={demoForm.notes}
                onChange={(e) =>
                  setDemoForm({ ...demoForm, notes: e.target.value })
                }
                rows={4}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800"
              />
            </div>
          </div>
          {demoError && (
            <div className="mt-3 text-sm text-red-600">{demoError}</div>
          )}
          {demoSuccess && (
            <div className="mt-3 text-sm text-green-600">{demoSuccess}</div>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDemoOpen(false)}
              className="border-neutral-300 text-neutral-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmittingDemo}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isSubmittingDemo ? "Submitting…" : "Submit Request"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
