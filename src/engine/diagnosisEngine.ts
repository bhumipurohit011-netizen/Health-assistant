import { SYMPTOMS_LIST, EMERGENCY_PHRASES, DIAGNOSIS_PATTERNS } from '../data/symptomsData';
import { DiagnosisResult, Symptom, SeverityLevel } from '../types';

export interface EmergencyCheckResult {
  isEmergency: boolean;
  reason?: string;
  matchedPhrase?: string;
}

/**
 * Check if user input contains high-risk / emergency red flag phrases
 */
export function detectEmergency(text: string): EmergencyCheckResult {
  const normalized = text.toLowerCase();
  for (const phrase of EMERGENCY_PHRASES) {
    if (normalized.includes(phrase)) {
      let reason = 'High-risk or life-threatening indicator detected';
      if (phrase.includes('chest pain') || phrase.includes('crushing')) {
        reason = 'Chest discomfort or possible cardiac distress';
      } else if (phrase.includes('breath') || phrase.includes('choking')) {
        reason = 'Acute respiratory distress or airway compromise';
      } else if (phrase.includes('consciousness') || phrase.includes('passed out') || phrase.includes('unconscious')) {
        reason = 'Altered level of consciousness';
      } else if (phrase.includes('bleeding')) {
        reason = 'Severe active hemorrhage';
      } else if (phrase.includes('paralysis') || phrase.includes('drooping') || phrase.includes('slurred')) {
        reason = 'Potential acute neurological emergency / stroke sign';
      } else if (phrase.includes('suicid') || phrase.includes('harm')) {
        reason = 'Immediate mental health crisis support required';
      }
      return {
        isEmergency: true,
        reason,
        matchedPhrase: phrase,
      };
    }
  }
  return { isEmergency: false };
}

/**
 * Extract matched symptom IDs from natural language text
 */
export function extractSymptomsFromText(text: string): string[] {
  const normalized = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  const matchedIds = new Set<string>();

  for (const symptom of SYMPTOMS_LIST) {
    // Check symptom name directly
    if (normalized.includes(symptom.name.toLowerCase())) {
      matchedIds.add(symptom.id);
      continue;
    }
    // Check all synonyms
    for (const syn of symptom.synonyms) {
      // Use boundary checking or substring matching
      const regex = new RegExp(`\\b${syn.toLowerCase()}\\b`, 'i');
      if (regex.test(normalized) || normalized.includes(syn.toLowerCase())) {
        matchedIds.add(symptom.id);
        break;
      }
    }
  }

  return Array.from(matchedIds);
}

/**
 * Detect affirmative or negative responses in natural conversational replies
 */
export function parseFollowUpAnswer(
  userText: string,
  candidateSymptomIds: string[]
): { confirmed: string[]; denied: string[] } {
  const text = userText.toLowerCase();
  const confirmed: string[] = [];
  const denied: string[] = [];

  // Check for direct symptom matches in the text first
  const explicitMatches = extractSymptomsFromText(text);
  for (const id of explicitMatches) {
    if (!confirmed.includes(id)) confirmed.push(id);
  }

  // Check general yes / no indicators
  const hasYes = /\b(yes|yeah|yep|i do|true|also|have it|experiencing|experiencing that|both)\b/i.test(text);
  const hasNo = /\b(no|nope|not really|don't|dont|neither|none|negative)\b/i.test(text);

  if (candidateSymptomIds.length > 0) {
    if (hasYes && !hasNo && confirmed.length === 0) {
      // User said "yes" to the follow up question
      confirmed.push(...candidateSymptomIds);
    } else if (hasNo && !hasYes && confirmed.length === 0) {
      denied.push(...candidateSymptomIds);
    }
  }

  return { confirmed, denied };
}

/**
 * Find smart follow-up question based on currently known symptoms
 */
export function getSmartFollowUp(
  knownSymptomIds: string[],
  previouslyAskedIds: string[]
): {
  question: string;
  candidateSymptomIds: string[];
  suggestedQuickReplies: string[];
} | null {
  if (knownSymptomIds.length === 0) {
    return {
      question:
        'Could you tell me a little more about what you are feeling? For example, do you have a fever, cough, body pain, or headache?',
      candidateSymptomIds: ['fever', 'cough', 'body_pain', 'headache'],
      suggestedQuickReplies: [
        'I have fever and cough',
        'I have a headache and feel tired',
        'I have a sore throat and runny nose',
      ],
    };
  }

  // Rank patterns by how many known symptoms match
  const scoredPatterns = DIAGNOSIS_PATTERNS.map((pattern) => {
    let matches = 0;
    for (const s of knownSymptomIds) {
      if (pattern.primarySymptoms.includes(s)) matches += 2;
      else if (pattern.secondarySymptoms.includes(s)) matches += 1;
    }
    return { pattern, matches };
  }).filter((p) => p.matches > 0);

  scoredPatterns.sort((a, b) => b.matches - a.matches);

  if (scoredPatterns.length === 0) {
    // If no pattern matched well, ask about general symptoms
    const unasked = ['fever', 'fatigue', 'headache'].filter(
      (id) => !knownSymptomIds.includes(id) && !previouslyAskedIds.includes(id)
    );
    if (unasked.length === 0) return null;

    const names = unasked.map((id) => SYMPTOMS_LIST.find((s) => s.id === id)?.name || id);
    return {
      question: `Are you also having ${names.join(' or ')}?`,
      candidateSymptomIds: unasked,
      suggestedQuickReplies: [
        `Yes, especially ${names[0]}`,
        'No, none of those',
        'Just feeling weak',
      ],
    };
  }

  // Look at the top pattern for un-asked primary or secondary symptoms
  const topPattern = scoredPatterns[0].pattern;
  const neededSymptoms = [...topPattern.primarySymptoms, ...topPattern.secondarySymptoms].filter(
    (id) => !knownSymptomIds.includes(id) && !previouslyAskedIds.includes(id)
  );

  if (neededSymptoms.length === 0) {
    // Check second top pattern if exists
    if (scoredPatterns.length > 1) {
      const secondPattern = scoredPatterns[1].pattern;
      const secondNeeded = [...secondPattern.primarySymptoms, ...secondPattern.secondarySymptoms].filter(
        (id) => !knownSymptomIds.includes(id) && !previouslyAskedIds.includes(id)
      );
      if (secondNeeded.length > 0) {
        const candidate = secondNeeded.slice(0, 2);
        const candidateNames = candidate.map(
          (id) => SYMPTOMS_LIST.find((s) => s.id === id)?.name.toLowerCase() || id
        );
        return {
          question: `I see. Have you also experienced any ${candidateNames.join(' or ')}?`,
          candidateSymptomIds: candidate,
          suggestedQuickReplies: [
            `Yes, ${candidateNames[0]}`,
            `No ${candidateNames.join(' nor ')}`,
            'Not sure',
          ],
        };
      }
    }
    return null; // Ready for diagnosis!
  }

  // Select 1 or 2 candidate symptoms to ask
  const selectedCandidates = neededSymptoms.slice(0, 2);
  const names = selectedCandidates.map(
    (id) => SYMPTOMS_LIST.find((s) => s.id === id)?.name.toLowerCase() || id
  );

  let questionText = `I understand. Are you also experiencing ${names.join(' or ')}?`;
  if (selectedCandidates.includes('shortness_of_breath')) {
    questionText = 'Thank you. Do you have any difficulty breathing or shortness of breath?';
  } else if (selectedCandidates.includes('light_sensitivity')) {
    questionText = 'Do you also notice any sensitivity to bright light or nausea with this?';
  } else if (selectedCandidates.includes('vomiting')) {
    questionText = 'Have you had any nausea, vomiting, or stomach cramping?';
  }

  return {
    question: questionText,
    candidateSymptomIds: selectedCandidates,
    suggestedQuickReplies: [
      `Yes, ${names[0]}`,
      'No, neither of those',
      'Yes, both of them',
    ],
  };
}

/**
 * Match current symptom list against rule-based patterns and calculate match score
 */
export function analyzeSymptoms(symptomIds: string[]): DiagnosisResult {
  if (symptomIds.length === 0) {
    return {
      patternName: 'Inconclusive - No specific pattern detected',
      matchScore: 0,
      severity: 'Mild',
      detectedSymptoms: [],
      description: 'Insufficient symptoms were reported to map to an informational symptom pattern.',
      recommendedSteps: [
        'Track and note any physical changes or symptoms as they develop',
        'Ensure proper rest and fluid intake',
        'Consult a healthcare professional if you feel unwell or uncomfortable',
      ],
      isEmergency: false,
      timestamp: new Date().toISOString(),
    };
  }

  // Check for emergency symptom combination (e.g. shortness_of_breath + fever + chest indicators)
  if (symptomIds.includes('shortness_of_breath') && symptomIds.includes('fever')) {
    // Elevate priority
  }

  let bestPattern = DIAGNOSIS_PATTERNS[0];
  let bestScore = 0;
  let bestMatchedCount = 0;

  for (const pattern of DIAGNOSIS_PATTERNS) {
    let primaryMatches = 0;
    let secondaryMatches = 0;

    for (const sId of symptomIds) {
      if (pattern.primarySymptoms.includes(sId)) {
        primaryMatches++;
      } else if (pattern.secondarySymptoms.includes(sId)) {
        secondaryMatches++;
      }
    }

    const totalPatternItems = pattern.primarySymptoms.length + pattern.secondarySymptoms.length;
    const matchedCount = primaryMatches + secondaryMatches;

    if (matchedCount === 0) continue;

    // Weight primary symptoms 2.5x, secondary 1.0x
    const weightedScore =
      (primaryMatches * 2.5 + secondaryMatches * 1.0) /
      (pattern.primarySymptoms.length * 2.5 + pattern.secondarySymptoms.length * 1.0);

    // Bonus for having at least 2 primary symptoms
    const primaryRatio = primaryMatches / Math.max(1, pattern.primarySymptoms.length);
    let finalPercentage = Math.round((weightedScore * 0.75 + primaryRatio * 0.25) * 100);

    // Normalize between 50% and 94% (never claim 100% certainty)
    if (finalPercentage > 92) finalPercentage = 92;
    if (finalPercentage < 45 && matchedCount >= 1) finalPercentage = 48;

    if (finalPercentage > bestScore || (finalPercentage === bestScore && matchedCount > bestMatchedCount)) {
      bestScore = finalPercentage;
      bestPattern = pattern;
      bestMatchedCount = matchedCount;
    }
  }

  // If match score is very low
  if (bestScore < 40) {
    bestScore = Math.max(42, Math.min(65, symptomIds.length * 18));
  }

  const detectedNames = symptomIds
    .map((id) => SYMPTOMS_LIST.find((s) => s.id === id)?.name || id)
    .filter(Boolean);

  let severity: SeverityLevel = bestPattern.severity;
  if (symptomIds.includes('shortness_of_breath')) {
    severity = 'High';
  }

  return {
    patternName: bestPattern.name,
    matchScore: bestScore,
    severity,
    detectedSymptoms: detectedNames,
    description: bestPattern.description,
    recommendedSteps: bestPattern.recommendedSteps,
    isEmergency: false,
    timestamp: new Date().toISOString(),
  };
}
