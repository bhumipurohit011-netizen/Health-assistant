import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Calendar,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  Volume2,
  Trash2,
} from 'lucide-react';
import { HealthCheckRecord, User } from '../types';
import { getUserHistory, clearUserHistory } from '../services/storageService';
import { ttsManager } from '../services/speechService';

interface HistoryViewProps {
  currentUser: User;
  onStartNewCheck: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  currentUser,
  onStartNewCheck,
}) => {
  const [history, setHistory] = useState<HealthCheckRecord[]>(() =>
    getUserHistory(currentUser.id)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<HealthCheckRecord | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const query = searchQuery.toLowerCase();
      const matchesPattern = item.possiblePattern.toLowerCase().includes(query);
      const matchesSymptoms = item.symptoms.some((s) => s.toLowerCase().includes(query));
      const matchesDate = new Date(item.date).toLocaleDateString().toLowerCase().includes(query);
      return matchesPattern || matchesSymptoms || matchesDate;
    });
  }, [history, searchQuery]);

  const handleClearHistory = () => {
    clearUserHistory(currentUser.id);
    setHistory([]);
    setConfirmClear(false);
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleListenDetails = (record: HealthCheckRecord) => {
    const speech = `Health check from ${new Date(record.date).toLocaleDateString()}. Possible pattern: ${record.possiblePattern}. Symptom match: ${record.symptomMatch} percent. Symptoms: ${record.symptoms.join(', ')}. Recommended steps: ${record.recommendedSteps.join('. ')}.`;
    ttsManager.speak(speech, record.id);
  };

  return (
    <div id="history-view-container" className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner matching Immersive UI */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#10121D] p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <History className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Health Check History
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Private records of your previous symptom evaluations and pattern matches.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onStartNewCheck}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs uppercase font-bold tracking-widest shadow-[0_0_15px_rgba(37,99,235,0.4)] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Health Check</span>
          </button>

          {history.length > 0 && (
            <button
              onClick={() => setConfirmClear(true)}
              title="Clear your history records"
              className="p-2.5 text-slate-400 hover:text-rose-400 rounded-xl bg-[#161B2D] border border-slate-700 hover:border-rose-500/30 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Clear confirmation alert */}
      {confirmClear && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-between gap-4 text-xs text-red-300">
          <span>Are you sure you want to delete all your health check history records?</span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleClearHistory}
              className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 cursor-pointer"
            >
              Confirm Delete
            </button>
            <button
              onClick={() => setConfirmClear(false)}
              className="px-3 py-1.5 bg-[#161B2D] border border-slate-700 text-slate-300 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Filter history by symptoms, pattern name, or date..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-[#10121D] border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* History Items List */}
      <div className="space-y-3">
        {filteredHistory.map((item) => (
          <div
            key={item.id}
            id={`history-item-${item.id}`}
            onClick={() => setSelectedRecord(item)}
            className="group bg-[#10121D] p-5 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all shadow-md hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>{formatDate(item.date)}</span>
              </div>

              <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                {item.possiblePattern}
              </h4>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-xs text-slate-500 font-medium">
                  Symptoms:
                </span>
                {item.symptoms.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg bg-[#161B2D] border border-slate-700 text-[11px] font-medium text-slate-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-5 self-end sm:self-center">
              {/* Match percentage block */}
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Symptom Match</div>
                <div className="text-xl font-extrabold text-blue-400">
                  {item.symptomMatch}%
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#161B2D] border border-slate-700 text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/40 transition">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}

        {filteredHistory.length === 0 && (
          <div className="text-center py-16 bg-[#10121D] rounded-3xl border border-slate-800 p-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-3">
              <History className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">
              No health check records found
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'Try clearing your search query to see other evaluations.'
                : 'Start your first symptom check to record your history here.'}
            </p>
            <button
              onClick={onStartNewCheck}
              className="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs uppercase font-bold tracking-widest hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer"
            >
              Start First Check
            </button>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#10121D] rounded-3xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 text-slate-200">
            {/* Modal Header */}
            <div className="bg-[#161B2D] border-b border-slate-800 p-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">
                  Health Check Details
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedRecord.possiblePattern}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{formatDate(selectedRecord.date)}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleListenDetails(selectedRecord)}
                  title="Listen to summary"
                  className="p-2 rounded-xl bg-[#1E253A] hover:bg-slate-700 text-blue-400 border border-slate-700 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 rounded-xl bg-[#1E253A] hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#161B2D] border border-slate-800">
                <span className="text-xs font-medium text-slate-300">
                  Symptom Match Correlation
                </span>
                <span className="text-base font-extrabold text-blue-400">
                  {selectedRecord.symptomMatch}%
                </span>
              </div>

              <div>
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2.5">
                  Symptoms Recorded ({selectedRecord.symptoms.length})
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedRecord.symptoms.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-[#161B2D] border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                      <span>{s}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2.5">
                  Recommended Next Steps
                </h5>
                <ul className="space-y-2 text-xs text-slate-300">
                  {selectedRecord.recommendedSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed text-[11px] text-slate-400">
                  Informational record only. Always consult a licensed medical provider for clinical evaluation.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#161B2D] border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
