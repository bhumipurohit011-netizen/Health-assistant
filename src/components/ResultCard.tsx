import React, { useState } from 'react';
import {
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  Info,
} from 'lucide-react';
import { DiagnosisResult, SeverityLevel } from '../types';
import { ttsManager } from '../services/speechService';

interface ResultCardProps {
  result: DiagnosisResult;
  onStartNewCheck: () => void;
  onViewHistory?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onStartNewCheck,
  onViewHistory,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);

  const getSeverityBadge = (level: SeverityLevel) => {
    switch (level) {
      case 'High':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            High Clinical Attention
          </span>
        );
      case 'Moderate':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            Moderate Concern
          </span>
        );
      case 'Mild':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mild Pattern
          </span>
        );
    }
  };

  const handleSpeak = () => {
    if (isPlayingAudio) {
      ttsManager.stop();
      setIsPlayingAudio(false);
    } else {
      const speechText = `Health Check Summary. Possible symptom pattern: ${result.patternName}. Symptom match: ${result.matchScore} percent. Detected symptoms: ${result.detectedSymptoms.join(', ')}. Recommended next steps: ${result.recommendedSteps.join('. ')}. Please note, this is not a medical diagnosis. Consult a qualified healthcare professional.`;
      ttsManager.speak(speechText, 'result_summary');
      setIsPlayingAudio(true);
      ttsManager.setListener((playing) => {
        setIsPlayingAudio(playing);
      });
    }
  };

  const handleCopy = () => {
    const text = `HealthAI Check Result:
Pattern: ${result.patternName}
Symptom Match: ${result.matchScore}%
Severity: ${result.severity}
Symptoms Detected: ${result.detectedSymptoms.join(', ')}
Recommended Next Steps:
${result.recommendedSteps.map((s) => `• ${s}`).join('\n')}

Notice: Informational symptom-pattern guidance only. Not a medical diagnosis.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="health-result-card"
      className="w-full bg-[#10121D] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-300 my-4 text-slate-200"
    >
      {/* Top Banner */}
      <div className="bg-[#161B2D] border-b border-slate-800 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                Analysis Completed
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Health Check Result
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="result-speak-btn"
              onClick={handleSpeak}
              title={isPlayingAudio ? 'Stop speaking' : 'Listen to result'}
              className="p-2.5 rounded-xl bg-[#1E253A] hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400" />
                  <span className="hidden sm:inline">Stop Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-blue-400" />
                  <span className="hidden sm:inline">Listen</span>
                </>
              )}
            </button>

            <button
              id="result-copy-btn"
              onClick={handleCopy}
              title="Copy result summary"
              className="p-2.5 rounded-xl bg-[#1E253A] hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 sm:p-7 space-y-6">
        {/* Possible Symptom Pattern Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
              Possible Symptom Pattern
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
              {result.patternName}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {result.description}
            </p>
          </div>

          <div className="shrink-0">{getSeverityBadge(result.severity)}</div>
        </div>

        {/* Symptom Match Meter */}
        <div className="space-y-3 bg-[#161B2D] p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold text-slate-300 flex items-center gap-2">
              <span>Symptom Match</span>
              <span className="text-[10px] font-normal text-slate-500">
                (Rule-based pattern correlation)
              </span>
            </span>
            <span className="font-bold text-blue-400 text-base">
              {result.matchScore}%
            </span>
          </div>

          {/* Meter Bar with Immersive Blue Glow */}
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.max(10, result.matchScore)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Note: This expresses symptom correlation strength, NOT a medical certainty.
          </p>
        </div>

        {/* Detected Symptoms */}
        <div>
          <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-3">
            Symptoms Detected ({result.detectedSymptoms.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.detectedSymptoms.map((symptom, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E253A] text-blue-400 border border-slate-700 text-xs font-medium"
              >
                <Check className="w-3.5 h-3.5 text-green-400 stroke-[3]" />
                <span>{symptom}</span>
              </span>
            ))}
            {result.detectedSymptoms.length === 0 && (
              <span className="text-xs text-slate-500 italic">No specific symptoms recorded</span>
            )}
          </div>
        </div>

        {/* Recommended Next Steps */}
        <div className="space-y-3">
          <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
            Recommended Next Steps
          </h4>
          <ul className="space-y-2.5">
            {result.recommendedSteps.map((step, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-xs sm:text-sm text-slate-300"
              >
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 border border-blue-500/30">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Medical Disclaimer Callout */}
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-xs text-red-300">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-red-400 uppercase tracking-wider text-[10px]">Medical Disclaimer:</p>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              This tool provides informational guidance only. Not a medical diagnosis. If you experience crushing chest pain, difficulty breathing, or stroke symptoms, call emergency services immediately.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            id="start-new-check-btn"
            onClick={onStartNewCheck}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase font-bold tracking-widest shadow-[0_0_15px_rgba(37,99,235,0.4)] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start New Health Check</span>
          </button>

          {onViewHistory && (
            <button
              id="view-saved-history-btn"
              onClick={onViewHistory}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#161B2D] hover:bg-[#1E253A] border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View in History</span>
              <ArrowRight className="w-4 h-4 text-blue-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
