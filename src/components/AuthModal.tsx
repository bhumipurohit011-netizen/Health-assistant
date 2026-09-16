import React, { useState } from 'react';
import {
  HeartPulse,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  X,
} from 'lucide-react';
import { User } from '../types';
import { loginUser, registerUser } from '../services/storageService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSwitchMode = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setError(null);
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser('rakshit@health.ai', 'password123');
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setError(res.error || 'Demo login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isLogin) {
      if (!email.trim() || !password) {
        setError('Please provide both your email/username and password.');
        return;
      }
      setLoading(true);
      try {
        const res = await loginUser(email, password);
        if (res.success && res.user) {
          onSuccess(res.user);
          onClose();
        } else {
          setError(res.error || 'Invalid credentials');
        }
      } catch {
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please provide a valid email address.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      setLoading(true);
      try {
        const res = await registerUser(fullName, email, password);
        if (res.success && res.user) {
          onSuccess(res.user);
          onClose();
        } else {
          setError(res.error || 'Signup failed');
        }
      } catch {
        setError('Failed to create account.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#10121D] rounded-3xl shadow-2xl border border-slate-800 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[540px] my-6 text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-[#161B2D] border border-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Side: Medical AI Branding with Glowing Blue Accents */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#0D101B] to-[#161B2D] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border-r border-slate-800">
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <HeartPulse className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Health Assistant</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight mb-3 text-white">
              HealthAI Assistant
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Explore symptom patterns, receive structured conversational follow-ups, and listen to spoken medical insights with voice synthesis.
            </p>
          </div>

          <div className="relative z-10 pt-8 space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              <span>Speech-to-text & voice audio response</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              <span>Rule-based symptom matching engine</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              <span>Private encrypted local session storage</span>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Informational guidance only. Not a medical substitute.</span>
          </div>
        </div>

        {/* Right Side: Login / Signup Form */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-[#10121D]">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {isLogin ? 'Welcome back' : 'Create an account'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isLogin
                  ? 'Enter your credentials to access your health dashboard'
                  : 'Start monitoring your symptom patterns securely'}
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="signup-fullname"
                      type="text"
                      required
                      placeholder="e.g. Rakshit Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#161B2D] border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isLogin ? 'Username or Email' : 'Email Address'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-email"
                    type={isLogin ? 'text' : 'email'}
                    required
                    placeholder={isLogin ? 'rakshit@health.ai or username' : 'name@example.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#161B2D] border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#161B2D] border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-[#161B2D] border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs uppercase font-bold tracking-widest rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Login Shortcut */}
            {isLogin && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <button
                  id="demo-login-btn"
                  type="button"
                  onClick={handleQuickDemoLogin}
                  disabled={loading}
                  className="w-full py-2.5 px-3 bg-[#161B2D] hover:bg-[#1E253A] border border-slate-700 text-blue-400 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>⚡ Quick Demo Login (Rakshit Sharma)</span>
                </button>
              </div>
            )}

            {/* Toggle between Login and Signup */}
            <div className="mt-6 text-center text-xs text-slate-400">
              {isLogin ? (
                <p>
                  Don&apos;t have an account?{' '}
                  <button
                    id="switch-to-signup"
                    type="button"
                    onClick={() => handleSwitchMode(false)}
                    className="font-semibold text-blue-400 hover:underline cursor-pointer"
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    id="switch-to-login"
                    type="button"
                    onClick={() => handleSwitchMode(true)}
                    className="font-semibold text-blue-400 hover:underline cursor-pointer"
                  >
                    Back to Login
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
