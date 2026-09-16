export type ThemeMode = 'light' | 'dark';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  preferences?: {
    voiceEnabled: boolean;
    speechSpeed: number; // 0.8 to 1.4
    theme: ThemeMode;
  };
}

export type SymptomCategory =
  | 'General'
  | 'Respiratory'
  | 'Neurological'
  | 'Digestive'
  | 'Eye'
  | 'Skin'
  | 'Urinary'
  | 'Other';

export interface Symptom {
  id: string;
  name: string;
  category: SymptomCategory;
  synonyms: string[];
  iconName?: string;
  isEmergency?: boolean;
}

export type SeverityLevel = 'Mild' | 'Moderate' | 'High' | 'Emergency';

export interface DiagnosisPattern {
  id: string;
  name: string;
  category: string;
  primarySymptoms: string[]; // Symptom IDs
  secondarySymptoms: string[];
  severity: SeverityLevel;
  description: string;
  recommendedSteps: string[];
}

export interface DiagnosisResult {
  patternName: string;
  matchScore: number; // 0 to 100 percentage
  severity: SeverityLevel;
  detectedSymptoms: string[]; // symptom names
  description: string;
  recommendedSteps: string[];
  isEmergency: boolean;
  emergencyReason?: string;
  timestamp: string;
}

export interface HealthCheckRecord {
  id: string;
  userId: string;
  date: string;
  symptoms: string[];
  possiblePattern: string;
  symptomMatch: number;
  severity: SeverityLevel;
  recommendedSteps: string[];
  isEmergency: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  isEmergency?: boolean;
  diagnosisResult?: DiagnosisResult;
  suggestedQuestions?: string[];
  followUpSymptoms?: string[]; // IDs of symptoms asked about
}

export type ActiveTab = 'dashboard' | 'check' | 'history' | 'profile';
