import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { HistoryView } from './components/HistoryView';
import { ProfileView } from './components/ProfileView';
import { AuthModal } from './components/AuthModal';
import { MedicalDisclaimerModal } from './components/MedicalDisclaimerModal';
import { ActiveTab, User, ThemeMode } from './types';
import {
  getCurrentUser,
  setCurrentUser,
  getSavedTheme,
  setSavedTheme,
} from './services/storageService';
import { HeartPulse, ShieldAlert, Sparkles, Activity } from 'lucide-react';

export default function App() {
  const [currentUser, setUser] = useState<User | null>(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [theme, setTheme] = useState<ThemeMode>(() => getSavedTheme());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [disclaimerModalOpen, setDisclaimerModalOpen] = useState(false);

  // Sync theme
  useEffect(() => {
    setSavedTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    setSavedTheme(nextTheme);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    setUser(user);
    if (user.preferences?.theme) {
      setTheme(user.preferences.theme);
      setSavedTheme(user.preferences.theme);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#0A0B14] text-slate-200 selection:bg-blue-600 selection:text-white">
      {/* Top Navigation with Immersive UI styling */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setAuthModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenDisclaimer={() => setDisclaimerModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!currentUser ? (
          // Logged-out Landing State with Immersive UI Styling
          <div className="py-16 sm:py-24 flex flex-col items-center justify-center text-center space-y-6 max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-transform hover:scale-105">
              <HeartPulse className="w-9 h-9" />
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Health Assistant</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Health Symptom Checker & Pattern Assistant
              </h1>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl mx-auto">
                Evaluate your physical symptoms conversationally, interact with speech-to-text, receive spoken responses, and view symptom-pattern matches securely.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.4)] transition cursor-pointer"
              >
                Sign In to Start Health Check
              </button>
            </div>

            <div className="max-w-md p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-3 text-left mt-4">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed text-[11px] text-slate-400">
                HealthAI provides informational guidance only and does not substitute for qualified medical diagnosis, physician consultation, or emergency care.
              </span>
            </div>
          </div>
        ) : (
          // Logged-in Tabs
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                currentUser={currentUser}
                setActiveTab={setActiveTab}
                onOpenDisclaimer={() => setDisclaimerModalOpen(true)}
              />
            )}

            {activeTab === 'check' && (
              <DashboardView
                currentUser={currentUser}
                setActiveTab={setActiveTab}
                onOpenDisclaimer={() => setDisclaimerModalOpen(true)}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView
                currentUser={currentUser}
                onStartNewCheck={() => setActiveTab('check')}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                currentUser={currentUser}
                onUpdateUser={(updated) => setUser(updated)}
                theme={theme}
                onToggleTheme={handleToggleTheme}
              />
            )}
          </>
        )}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-800 py-6 px-4 sm:px-8 bg-[#10121D] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <HeartPulse className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-slate-300">HealthAI Assistant</span>
            <span>• Rule-Based Symptom Checker</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDisclaimerModalOpen(true)}
              className="hover:underline hover:text-slate-300 cursor-pointer"
            >
              Medical Disclaimer
            </button>
            <span>•</span>
            <span className="text-red-400">Emergency Services: 911 / 112</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Medical Disclaimer Modal */}
      <MedicalDisclaimerModal
        isOpen={disclaimerModalOpen}
        onClose={() => setDisclaimerModalOpen(false)}
      />
    </div>
  );
}
