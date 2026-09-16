import React, { useState } from 'react';
import {
  Sparkles,
  History,
  Activity,
  Layers,
  Check,
  ShieldAlert,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { User, ActiveTab } from '../types';
import { ChatInterface } from './ChatInterface';
import { SymptomSelector } from './SymptomSelector';
import { getUserHistory } from '../services/storageService';

interface DashboardViewProps {
  currentUser: User;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenDisclaimer: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  setActiveTab,
  onOpenDisclaimer,
}) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showSymptomPanel, setShowSymptomPanel] = useState(false);

  const history = getUserHistory(currentUser.id);
  const latestRecord = history.length > 0 ? history[0] : null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleToggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleAddSymptomsFromChat = (symptomIds: string[]) => {
    setSelectedSymptoms((prev) => Array.from(new Set([...prev, ...symptomIds])));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Immersive Welcome & Greeting Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            {getGreeting()}, {currentUser.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            How are you feeling today? Describe your symptoms below or speak using voice.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSymptomPanel(!showSymptomPanel)}
            className="px-4 py-2 rounded-xl bg-[#161B2D] hover:bg-[#1E253A] border border-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-blue-400" />
            <span>{showSymptomPanel ? 'Hide Symptom Chips' : 'Browse Symptom Chips'}</span>
            {selectedSymptoms.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                {selectedSymptoms.length}
              </span>
            )}
          </button>

          {latestRecord && (
            <button
              onClick={() => setActiveTab('history')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition cursor-pointer"
            >
              <History className="w-4 h-4" />
              <span>Previous: {latestRecord.symptomMatch}% match</span>
            </button>
          )}
        </div>
      </div>

      {/* Optional Interactive Symptom Selector Drawer */}
      {showSymptomPanel && (
        <div className="animate-in fade-in slide-in-from-top-3 duration-300">
          <SymptomSelector
            selectedSymptomIds={selectedSymptoms}
            onToggleSymptom={handleToggleSymptom}
            onClearSymptoms={() => setSelectedSymptoms([])}
            onAnalyzeSelected={(sIds) => {
              setShowSymptomPanel(false);
            }}
          />
        </div>
      )}

      {/* Main Grid: Chat Box & Live Analysis Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Large Chatbot Interface matching Design */}
        <div className="lg:col-span-8">
          <ChatInterface
            currentUser={currentUser}
            onOpenSymptomSelector={() => setShowSymptomPanel(true)}
            selectedSymptomIds={selectedSymptoms}
            onAddSymptoms={handleAddSymptomsFromChat}
            onViewHistory={() => setActiveTab('history')}
          />
        </div>

        {/* Right Sidebar matching Live Analysis & Next Steps in Design */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Analysis Card matching design */}
          <div className="bg-[#10121D] border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
              <span>Live Analysis</span>
              <span className="text-[10px] text-blue-400">Pattern Engine</span>
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-medium text-white">
                  {latestRecord ? latestRecord.possiblePattern : 'Flu-like Pattern'}
                </span>
                <span className="text-xs text-blue-400 font-bold">
                  {latestRecord ? `${latestRecord.symptomMatch}% Match` : '78% Match'}
                </span>
              </div>

              {/* Glowing blue meter from design */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-700"
                  style={{ width: `${latestRecord ? latestRecord.symptomMatch : 78}%` }}
                />
              </div>

              <div className="pt-4 space-y-2.5">
                {latestRecord && latestRecord.symptoms.length > 0 ? (
                  latestRecord.symptoms.slice(0, 4).map((sym, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                      <Check className="h-4 w-4 text-green-400 shrink-0 stroke-[3]" />
                      <span>{sym} recorded</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Check className="h-4 w-4 text-green-400 shrink-0 stroke-[3]" />
                      <span>Fever detected</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Check className="h-4 w-4 text-green-400 shrink-0 stroke-[3]" />
                      <span>Cough reported</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Check className="h-4 w-4 text-green-400 shrink-0 stroke-[3]" />
                      <span>Fatigue confirmed</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Next Steps Card matching design */}
          <div className="bg-blue-600 border border-blue-400/30 rounded-3xl p-6 shadow-xl relative overflow-hidden text-white">
            <div className="relative z-10">
              <h3 className="text-base font-bold mb-2 text-white">Next Steps</h3>
              <ul className="text-xs text-blue-100 space-y-3 leading-relaxed">
                <li className="flex gap-2.5">
                  <span className="w-1.5 h-1.5 bg-white rounded-full mt-1.5 shrink-0" />
                  <span>Rest and hydrate immediately with fluids or electrolyte broths.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="w-1.5 h-1.5 bg-white rounded-full mt-1.5 shrink-0" />
                  <span>Monitor body temperature twice daily.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="w-1.5 h-1.5 bg-white rounded-full mt-1.5 shrink-0" />
                  <span>Consult a licensed healthcare provider if symptoms persist over 48h.</span>
                </li>
              </ul>

              <button
                onClick={() => setActiveTab('history')}
                className="w-full mt-6 bg-white text-blue-600 hover:bg-slate-100 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition cursor-pointer"
              >
                View History & Details
              </button>
            </div>

            {/* Glowing orb from design */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/50 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Disclaimer mini-card matching design */}
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
              <span>Disclaimer</span>
              <button
                onClick={onOpenDisclaimer}
                className="underline hover:text-red-300 text-[10px]"
              >
                Read More
              </button>
            </p>
            <p className="text-[11px] leading-relaxed text-slate-400">
              This tool provides informational guidance only. It is not a definitive medical diagnosis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
