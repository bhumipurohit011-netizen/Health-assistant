import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Calendar,
  Activity,
  Volume2,
  Sliders,
  ShieldCheck,
  Check,
  Sun,
  Moon,
} from 'lucide-react';
import { User, ThemeMode } from '../types';
import {
  getUserHistory,
  updateUserPreferences,
} from '../services/storageService';

interface ProfileViewProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUpdateUser,
  theme,
  onToggleTheme,
}) => {
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(
    currentUser.preferences?.voiceEnabled ?? true
  );
  const [speechSpeed, setSpeechSpeed] = useState<number>(
    currentUser.preferences?.speechSpeed ?? 1.0
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const history = getUserHistory(currentUser.id);
  const creationDate = new Date(currentUser.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleSavePreferences = () => {
    const updated = updateUserPreferences(currentUser.id, {
      voiceEnabled,
      speechSpeed,
      theme,
    });
    if (updated) {
      onUpdateUser(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div id="profile-view-container" className="max-w-4xl mx-auto space-y-6 text-slate-200">
      {/* Profile Header Card */}
      <div className="bg-[#10121D] rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-3xl shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <h2 className="text-2xl font-bold text-white">
              {currentUser.name}
            </h2>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs sm:text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-blue-400" />
                {currentUser.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" />
                Joined {creationDate}
              </span>
            </div>

            <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                <Activity className="w-3.5 h-3.5" />
                {history.length} Total Health Checks Completed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences & Settings */}
      <div className="bg-[#10121D] rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
          App & Voice Preferences
        </h3>

        {/* Theme Preference */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-semibold text-white">
              Display Theme
            </h4>
            <p className="text-xs text-slate-400">
              Toggle between immersive dark theme and high-contrast light theme.
            </p>
          </div>

          <button
            onClick={onToggleTheme}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161B2D] border border-slate-700 text-slate-200 hover:text-white transition text-xs font-semibold cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Moon className="w-4 h-4 text-blue-400" />
                <span>Immersive Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Light Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Voice Auto-Speak */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-400" />
              <span>Voice Audio Response</span>
            </h4>
            <p className="text-xs text-slate-400">
              Automatically speak new diagnosis results using Text-to-Speech synthesis.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(e) => setVoiceEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
          </label>
        </div>

        {/* Speech Speed */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Speech Rate (Speed)</span>
            </h4>
            <p className="text-xs text-slate-400">
              Adjust how fast the assistant speaks text-to-speech audio.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[0.8, 1.0, 1.2, 1.4].map((speed) => (
              <button
                key={speed}
                onClick={() => setSpeechSpeed(speed)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  speechSpeed === speed
                    ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                    : 'bg-[#161B2D] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <span className="text-xs text-green-400 font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              Preferences updated successfully!
            </span>
          )}
          {!savedSuccess && <div />}

          <button
            onClick={handleSavePreferences}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs uppercase font-bold tracking-widest shadow-[0_0_15px_rgba(37,99,235,0.4)] transition cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </div>

      {/* Safety & Disclaimer Card */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 text-xs text-red-300 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="font-bold text-red-400 uppercase tracking-wider text-[10px]">Medical Disclaimer & Privacy</h5>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            HealthAI is an informational assistant engineered to correlate symptom combinations with clinical patterns. It does not issue definitive diagnoses or prescriptions. Evaluations are stored privately in your browser session.
          </p>
        </div>
      </div>
    </div>
  );
};
