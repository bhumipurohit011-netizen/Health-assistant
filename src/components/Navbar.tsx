import React, { useState } from 'react';
import {
  Activity,
  HeartPulse,
  PlusCircle,
  History,
  User as UserIcon,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { ActiveTab, User, ThemeMode } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenDisclaimer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onOpenAuth,
  theme,
  onToggleTheme,
  onOpenDisclaimer,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { id: 'check', label: 'New Health Check', icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <UserIcon className="w-4 h-4" /> },
  ];

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-200 bg-[#10121D]/90 border-slate-800 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo with Immersive UI blue glow */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-transform hover:scale-105">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">HealthAI</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Assistant
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                AI Symptom Pattern Checker
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          {currentUser && (
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'text-blue-400 bg-blue-400/10 border border-blue-400/20 font-semibold shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                        : 'text-slate-400 hover:text-white hover:bg-[#161B2D]/80 border border-transparent'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            {/* AI Online pill from design */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">
                AI Online
              </span>
            </div>

            {/* Disclaimer trigger */}
            <button
              id="disclaimer-nav-btn"
              onClick={onOpenDisclaimer}
              title="Medical Disclaimer"
              className="p-2.5 rounded-xl text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden lg:inline">Disclaimer</span>
            </button>

            {/* Theme Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white bg-[#161B2D] border border-slate-700/80 hover:border-slate-600 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-blue-400" />}
            </button>

            {/* User Account / Auth */}
            {currentUser ? (
              <div className="hidden md:flex items-center gap-3 pl-2 border-l border-slate-800">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#161B2D] transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1E253A] border border-slate-700 flex items-center justify-center text-sm font-bold text-blue-400 shadow-sm">
                    {getInitials(currentUser.name)}
                  </div>
                  <div className="text-left hidden xl:block">
                    <div className="text-xs font-bold text-white truncate max-w-[110px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-400">Verified User</div>
                  </div>
                </button>
                <button
                  id="logout-btn"
                  onClick={onLogout}
                  title="Logout"
                  className="p-2.5 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="login-trigger-btn"
                onClick={onOpenAuth}
                className="px-5 py-2.5 text-xs uppercase font-bold tracking-widest rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Mobile hamburger */}
            {currentUser && (
              <button
                id="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-[#161B2D] border border-slate-700"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && currentUser && (
        <div className="md:hidden border-t border-slate-800 bg-[#10121D] px-4 pt-3 pb-5 space-y-1.5">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center justify-between">
            <span>Signed in as {currentUser.name}</span>
            <span className="text-[10px] text-green-400 font-bold">AI Online</span>
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium ${
                activeTab === item.id
                  ? 'text-blue-400 bg-blue-400/10 border border-blue-400/20 font-semibold'
                  : 'text-slate-300 hover:bg-[#161B2D]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                onLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
