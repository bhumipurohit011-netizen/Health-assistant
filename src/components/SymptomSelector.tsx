import React, { useState, useMemo } from 'react';
import {
  Search,
  Check,
  Plus,
  RotateCcw,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { SYMPTOMS_LIST } from '../data/symptomsData';
import { SymptomCategory, Symptom } from '../types';

interface SymptomSelectorProps {
  selectedSymptomIds: string[];
  onToggleSymptom: (symptomId: string) => void;
  onClearSymptoms: () => void;
  onAnalyzeSelected: (symptomIds: string[]) => void;
  className?: string;
}

const CATEGORIES: SymptomCategory[] = [
  'General',
  'Respiratory',
  'Neurological',
  'Digestive',
  'Eye',
  'Skin',
  'Urinary',
  'Other',
];

const CATEGORY_ICONS: Record<SymptomCategory, string> = {
  General: '🌡️',
  Respiratory: '🫁',
  Neurological: '🧠',
  Digestive: '🥣',
  Eye: '👁️',
  Skin: '🩹',
  Urinary: '💧',
  Other: '✨',
};

const SYMPTOM_EMOJIS: Record<string, string> = {
  fever: '🌡️',
  fatigue: '🥱',
  chills: '🥶',
  body_pain: '🤕',
  weakness: '🛋️',
  cough: '🤧',
  shortness_of_breath: '😮‍💨',
  sore_throat: '🗣️',
  runny_nose: '👃',
  sneezing: '💨',
  headache: '💆',
  dizziness: '💫',
  light_sensitivity: '🕶️',
  nausea: '🤢',
  vomiting: '🤮',
  diarrhea: '🚽',
  abdominal_pain: '⚡',
  red_eyes: '🔴',
  itchy_eyes: '👀',
  watery_eyes: '💧',
  rash: '🔴',
  itchy_skin: '🖐️',
  burning_urination: '🔥',
  frequent_urination: '⌛',
  loss_of_smell: '👃🚫',
  loss_of_taste: '👅🚫',
};

export const SymptomSelector: React.FC<SymptomSelectorProps> = ({
  selectedSymptomIds,
  onToggleSymptom,
  onClearSymptoms,
  onAnalyzeSelected,
  className = '',
}) => {
  const [activeCategory, setActiveCategory] = useState<SymptomCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSymptoms = useMemo(() => {
    return SYMPTOMS_LIST.filter((symptom) => {
      const matchesCategory = activeCategory === 'All' || symptom.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        symptom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        symptom.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        symptom.synonyms.some((syn) => syn.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div
      id="symptom-selector-container"
      className={`bg-[#10121D] rounded-3xl border border-slate-800 shadow-xl p-5 sm:p-6 text-slate-200 ${className}`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-white">
              Interactive Symptom Selector
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Click symptoms to select or deselect. You can also type or speak them in the chatbot.
          </p>
        </div>

        {/* Selected count and clear button */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#161B2D] border border-slate-700 text-blue-400">
            {selectedSymptomIds.length} selected
          </span>
          {selectedSymptomIds.length > 0 && (
            <button
              onClick={onClearSymptoms}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition cursor-pointer"
              title="Clear all selected symptoms"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="py-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search symptoms (e.g., headache, fever, cough, nausea)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#161B2D] border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar text-xs">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition cursor-pointer ${
              activeCategory === 'All'
                ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                : 'bg-[#161B2D] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition flex items-center gap-1.5 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                  : 'bg-[#161B2D] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{CATEGORY_ICONS[cat]}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Symptom Chips Grid */}
      <div className="flex flex-wrap gap-2 max-h-56 sm:max-h-64 overflow-y-auto pr-1 py-1 custom-scrollbar">
        {filteredSymptoms.map((symptom) => {
          const isSelected = selectedSymptomIds.includes(symptom.id);
          const emoji = SYMPTOM_EMOJIS[symptom.id] || '🩺';

          return (
            <button
              key={symptom.id}
              id={`symptom-chip-${symptom.id}`}
              onClick={() => onToggleSymptom(symptom.id)}
              className={`group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'bg-[#161B2D] text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-[#1E253A]'
              }`}
            >
              <span>{emoji}</span>
              <span>{symptom.name}</span>
              {isSelected ? (
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center ml-0.5">
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </span>
              ) : (
                <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 ml-0.5 transition-colors" />
              )}
            </button>
          );
        })}

        {filteredSymptoms.length === 0 && (
          <div className="w-full py-8 text-center text-xs text-slate-500">
            No symptoms matching &quot;{searchQuery}&quot;. Try a different term or select from categories.
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-400 text-center sm:text-left">
          {selectedSymptomIds.length === 0
            ? 'Select symptoms above or type them in the chatbot.'
            : `${selectedSymptomIds.length} symptom${selectedSymptomIds.length > 1 ? 's' : ''} ready to analyze.`}
        </div>

        <button
          id="analyze-selected-btn"
          disabled={selectedSymptomIds.length === 0}
          onClick={() => onAnalyzeSelected(selectedSymptomIds)}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase font-bold tracking-widest rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Activity className="w-4 h-4" />
          <span>Analyze Selected Symptoms ({selectedSymptomIds.length})</span>
        </button>
      </div>
    </div>
  );
};
