import React from 'react';
import { ShieldAlert, PhoneCall, X } from 'lucide-react';

interface MedicalDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MedicalDisclaimerModal: React.FC<MedicalDisclaimerModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#10121D] rounded-3xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 text-slate-200">
        {/* Header */}
        <div className="bg-[#161B2D] border-b border-slate-800 p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">Medical Safety Notice</h3>
              <p className="text-xs text-slate-400">Informational Health Symptom Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1E253A] border border-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs sm:text-sm text-slate-300 max-h-[70vh] overflow-y-auto leading-relaxed custom-scrollbar">
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
            <strong className="text-red-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
              Important:
            </strong>
            HealthAI Assistant does NOT provide definitive medical diagnoses, physician consultations, or clinical treatment plans.
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-white text-sm">How This Tool Works</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              This system uses rule-based pattern matching to correlate combinations of user-reported symptoms with common medical condition profiles. All outputs are phrased as &quot;Possible symptom pattern&quot; and reflect general health information.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-white text-sm">When to Seek Immediate Emergency Care</h4>
            <p className="text-slate-400 text-xs">
              If you or someone you are assisting experiences any of the following emergency symptoms, stop using this tool and contact local emergency dispatch (911 in North America, 112 in Europe, or your local emergency number) immediately:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
              <li>Severe crushing chest pain, pressure, or tightness</li>
              <li>Sudden severe difficulty breathing, gasping, or blue lips</li>
              <li>Sudden numbness, facial drooping, or slurred speech</li>
              <li>Loss of consciousness, fainting, or sudden confusion</li>
              <li>Uncontrolled active bleeding or coughing blood</li>
              <li>Thoughts of self-harm or severe psychiatric crisis</li>
            </ul>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <p className="text-[11px] text-slate-500">
              By using this application, you acknowledge that HealthAI is an informational reference and that you will always consult a licensed medical provider for diagnostic evaluation.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#161B2D] border-t border-slate-800 flex items-center justify-between">
          <a
            href="tel:911"
            className="text-xs font-bold text-red-400 hover:underline flex items-center gap-1.5"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Emergency Services: 911 / 112</span>
          </a>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs uppercase font-bold tracking-widest shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer transition"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
