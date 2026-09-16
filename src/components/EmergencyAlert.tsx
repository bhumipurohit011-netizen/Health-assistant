import React from 'react';
import { AlertOctagon, PhoneCall, ShieldAlert } from 'lucide-react';

interface EmergencyAlertProps {
  reason?: string;
  matchedPhrase?: string;
  onDismiss?: () => void;
}

export const EmergencyAlert: React.FC<EmergencyAlertProps> = ({
  reason,
  matchedPhrase,
  onDismiss,
}) => {
  return (
    <div
      id="emergency-alert-banner"
      className="w-full rounded-3xl bg-red-500/15 text-white p-5 sm:p-6 shadow-2xl border-2 border-red-500/40 my-4 animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-sm"
    >
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 shrink-0">
          <AlertOctagon className="w-8 h-8 animate-pulse" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-red-500 text-white shadow-md">
              Immediate Urgent Care Notice
            </span>
            {matchedPhrase && (
              <span className="text-xs text-red-300 italic">
                Detected: &quot;{matchedPhrase}&quot;
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            These symptoms may require urgent medical attention.
          </h3>

          <p className="text-xs sm:text-sm text-red-200 leading-relaxed max-w-3xl">
            {reason || 'High-risk medical emergency indicators were detected.'}{' '}
            <strong className="text-white">Please contact local emergency services immediately (such as 911 in North America, 112 in Europe, or your regional emergency dispatch) or go to the nearest emergency department.</strong>
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="tel:911"
              id="emergency-call-btn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg transition active:scale-98"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Emergency Services (911 / 112)</span>
            </a>

            <div className="text-xs text-red-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Do not delay urgent care for an online tool.</span>
            </div>

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="ml-auto text-xs font-semibold text-red-300 hover:text-white underline cursor-pointer"
              >
                Dismiss Warning
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
