import { Symptom, DiagnosisPattern } from '../types';

export const SYMPTOMS_LIST: Symptom[] = [
  // General
  {
    id: 'fever',
    name: 'Fever',
    category: 'General',
    synonyms: ['fever', 'high temperature', 'febrile', 'burning up', 'feverish', 'chills and fever', 'temperature'],
  },
  {
    id: 'fatigue',
    name: 'Fatigue',
    category: 'General',
    synonyms: ['fatigue', 'tired', 'tiredness', 'exhausted', 'exhaustion', 'worn out', 'low energy', 'drowsy'],
  },
  {
    id: 'chills',
    name: 'Chills',
    category: 'General',
    synonyms: ['chills', 'shivering', 'shivers', 'feeling cold', 'cold sweat'],
  },
  {
    id: 'body_pain',
    name: 'Body Pain',
    category: 'General',
    synonyms: ['body pain', 'body aches', 'muscle aches', 'muscle pain', 'myalgia', 'aching all over', 'achy'],
  },
  {
    id: 'weakness',
    name: 'Weakness',
    category: 'General',
    synonyms: ['weakness', 'feeling weak', 'loss of strength', 'lethargy', 'lethargic'],
  },

  // Respiratory
  {
    id: 'cough',
    name: 'Cough',
    category: 'Respiratory',
    synonyms: ['cough', 'coughing', 'dry cough', 'wet cough', 'hacking cough', 'chesty cough'],
  },
  {
    id: 'shortness_of_breath',
    name: 'Shortness of Breath',
    category: 'Respiratory',
    synonyms: ['shortness of breath', 'difficulty breathing', 'breathless', 'trouble breathing', 'dyspnea', 'gasping'],
  },
  {
    id: 'sore_throat',
    name: 'Sore Throat',
    category: 'Respiratory',
    synonyms: ['sore throat', 'throat hurts', 'scratchy throat', 'throat irritation', 'pharyngitis', 'pain swallowing'],
  },
  {
    id: 'runny_nose',
    name: 'Runny Nose',
    category: 'Respiratory',
    synonyms: ['runny nose', 'congested', 'stuffy nose', 'nasal congestion', 'rhinorrhea', 'blocked nose', 'mucus'],
  },
  {
    id: 'sneezing',
    name: 'Sneezing',
    category: 'Respiratory',
    synonyms: ['sneezing', 'sneeze', 'sneezes', 'frequent sneezing'],
  },

  // Neurological
  {
    id: 'headache',
    name: 'Headache',
    category: 'Neurological',
    synonyms: ['headache', 'head hurts', 'throbbing head', 'head pain', 'cephalea', 'migraine'],
  },
  {
    id: 'dizziness',
    name: 'Dizziness',
    category: 'Neurological',
    synonyms: ['dizziness', 'dizzy', 'lightheaded', 'spinning', 'vertigo', 'unsteady'],
  },
  {
    id: 'light_sensitivity',
    name: 'Light Sensitivity',
    category: 'Neurological',
    synonyms: ['light sensitivity', 'sensitive to light', 'photophobia', 'bright lights hurt eyes', 'glare pain'],
  },

  // Digestive
  {
    id: 'nausea',
    name: 'Nausea',
    category: 'Digestive',
    synonyms: ['nausea', 'feeling sick', 'queasy', 'upset stomach', 'sick to my stomach'],
  },
  {
    id: 'vomiting',
    name: 'Vomiting',
    category: 'Digestive',
    synonyms: ['vomiting', 'throwing up', 'threw up', 'emesis', 'puking'],
  },
  {
    id: 'diarrhea',
    name: 'Diarrhea',
    category: 'Digestive',
    synonyms: ['diarrhea', 'loose stools', 'watery stool', 'stomach bug', 'frequent bowel movement'],
  },
  {
    id: 'abdominal_pain',
    name: 'Abdominal Pain',
    category: 'Digestive',
    synonyms: ['abdominal pain', 'stomach hurts', 'stomach ache', 'belly ache', 'gut pain', 'cramping'],
  },

  // Eye
  {
    id: 'red_eyes',
    name: 'Red Eyes',
    category: 'Eye',
    synonyms: ['red eyes', 'bloodshot eyes', 'pink eye', 'conjunctivitis'],
  },
  {
    id: 'itchy_eyes',
    name: 'Itchy Eyes',
    category: 'Eye',
    synonyms: ['itchy eyes', 'eyes itching', 'irritated eyes', 'scratchy eyes'],
  },
  {
    id: 'watery_eyes',
    name: 'Watery Eyes',
    category: 'Eye',
    synonyms: ['watery eyes', 'tearing eyes', 'lacrimation', 'excessive tearing'],
  },

  // Skin
  {
    id: 'rash',
    name: 'Rash',
    category: 'Skin',
    synonyms: ['rash', 'skin eruption', 'spots on skin', 'hives', 'urticaria', 'red bumps'],
  },
  {
    id: 'itchy_skin',
    name: 'Itchy Skin',
    category: 'Skin',
    synonyms: ['itchy skin', 'pruritus', 'scratching skin', 'itchiness'],
  },

  // Urinary
  {
    id: 'burning_urination',
    name: 'Burning Urination',
    category: 'Urinary',
    synonyms: ['burning urination', 'pain when peeing', 'dysuria', 'hurts to urinate', 'stinging pee'],
  },
  {
    id: 'frequent_urination',
    name: 'Frequent Urination',
    category: 'Urinary',
    synonyms: ['frequent urination', 'peeing often', 'urinary frequency', 'constant urge to pee'],
  },

  // Other
  {
    id: 'loss_of_smell',
    name: 'Loss of Smell',
    category: 'Other',
    synonyms: ['loss of smell', 'cannot smell', 'anosmia', 'no smell'],
  },
  {
    id: 'loss_of_taste',
    name: 'Loss of Taste',
    category: 'Other',
    synonyms: ['loss of taste', 'cannot taste', 'ageusia', 'no taste'],
  },
];

// Emergency red-flag keywords
export const EMERGENCY_PHRASES = [
  'chest pain',
  'crushing chest',
  'severe difficulty breathing',
  'cannot breathe',
  'choking',
  'loss of consciousness',
  'passed out',
  'unconscious',
  'severe bleeding',
  'coughing blood',
  'vomiting blood',
  'sudden paralysis',
  'facial drooping',
  'slurred speech',
  'suicide',
  'suicidal',
  'kill myself',
  'harm myself',
  'sudden numbness',
  'worst headache of my life',
  'thunderclap headache',
  'blue lips',
  'seizure',
];

export const DIAGNOSIS_PATTERNS: DiagnosisPattern[] = [
  {
    id: 'flu_like',
    name: 'Flu-like symptom pattern',
    category: 'Viral Respiratory',
    primarySymptoms: ['fever', 'body_pain', 'fatigue', 'chills'],
    secondarySymptoms: ['cough', 'headache', 'weakness', 'sore_throat'],
    severity: 'Moderate',
    description: 'A presentation characterized by acute fever, generalized myalgia (body aches), chills, and fatigue, commonly seen in viral respiratory syndromes such as influenza.',
    recommendedSteps: [
      'Prioritize bed rest and limit physical exertion',
      'Maintain adequate fluid intake (water, broths, electrolyte solutions)',
      'Monitor body temperature every 4 to 6 hours',
      'Seek medical consultation if fever persists over 3 days or exceeds 103°F (39.4°C)',
      'Consult a physician or pharmacist before taking over-the-counter fever reducers',
    ],
  },
  {
    id: 'common_cold',
    name: 'Common cold-like symptom pattern',
    category: 'Upper Respiratory',
    primarySymptoms: ['runny_nose', 'sneezing', 'sore_throat'],
    secondarySymptoms: ['cough', 'fatigue', 'watery_eyes', 'headache'],
    severity: 'Mild',
    description: 'Typical presentation of an upper respiratory viral rhinitis characterized by localized nasal congestion, sneezing, and mild throat irritation without high fever.',
    recommendedSteps: [
      'Rest in a comfortably humidified room',
      'Stay hydrated with warm liquids like herbal teas or warm water with lemon',
      'Perform warm saline gargles to ease throat irritation',
      'Avoid sudden temperature changes and tobacco smoke',
      'Seek evaluation if symptoms worsen after 7 to 10 days',
    ],
  },
  {
    id: 'allergic_rhinitis',
    name: 'Allergy-like symptom pattern',
    category: 'Allergy / Environmental',
    primarySymptoms: ['sneezing', 'itchy_eyes', 'runny_nose', 'watery_eyes'],
    secondarySymptoms: ['red_eyes', 'cough', 'itchy_skin'],
    severity: 'Mild',
    description: 'Consistent with environmental or seasonal hypersensitivity (allergic rhinitis or conjunctivitis), predominantly involving histamine-mediated eye and nasal irritation.',
    recommendedSteps: [
      'Identify and minimize exposure to potential triggers (pollen, pet dander, dust mites)',
      'Rinse face and eyes with cool clean water after outdoor exposure',
      'Keep indoor windows closed during peak pollen hours',
      'Discuss suitable non-sedating antihistamines or nasal sprays with a healthcare provider',
      'Consult an allergist if symptoms recur regularly',
    ],
  },
  {
    id: 'migraine_pattern',
    name: 'Migraine-like symptom pattern',
    category: 'Neurological',
    primarySymptoms: ['headache', 'light_sensitivity', 'nausea'],
    secondarySymptoms: ['dizziness', 'vomiting', 'fatigue'],
    severity: 'Moderate',
    description: 'A neurovascular headache profile often presenting with moderate-to-severe throbbing head discomfort accompanied by sensory sensitivity (photophobia) and autonomic gastrointestinal upset.',
    recommendedSteps: [
      'Rest in a dark, quiet, well-ventilated room',
      'Apply a cool compress or gel pack gently to the forehead or neck',
      'Sip small amounts of water to stay hydrated without triggering nausea',
      'Avoid sensory triggers such as bright screens, loud noises, and strong scents',
      'Consult a physician for prescription migraine management if episodes are recurrent or disabling',
    ],
  },
  {
    id: 'gastroenteritis',
    name: 'Digestive illness-like symptom pattern',
    category: 'Gastrointestinal',
    primarySymptoms: ['nausea', 'vomiting', 'diarrhea', 'abdominal_pain'],
    secondarySymptoms: ['fatigue', 'weakness', 'fever', 'chills'],
    severity: 'Moderate',
    description: 'An acute gastrointestinal symptom constellation consistent with viral or foodborne gastroenteritis, characterized by bowel irritation and fluid loss.',
    recommendedSteps: [
      'Replenish lost fluids with oral rehydration salts (ORS), dilute broth, or electrolyte drinks',
      'Follow a gentle bland diet (such as bananas, rice, applesauce, toast) once vomiting subsides',
      'Avoid dairy, fatty, excessively spicy, or highly caffeinated items',
      'Seek urgent medical attention if you cannot keep liquids down for 24 hours or show signs of severe dehydration',
    ],
  },
  {
    id: 'urinary_tract',
    name: 'Urinary symptom pattern',
    category: 'Urological',
    primarySymptoms: ['burning_urination', 'frequent_urination'],
    secondarySymptoms: ['abdominal_pain', 'fever', 'fatigue'],
    severity: 'Moderate',
    description: 'Symptom pattern localized to the urinary tract, frequently corresponding to lower urinary irritation or infection (dysuria and frequency).',
    recommendedSteps: [
      'Drink plenty of plain water to help flush the urinary tract',
      'Avoid bladder irritants such as alcohol, carbonated drinks, and caffeine',
      'Do not delay urinating when the urge arises',
      'Promptly consult a healthcare provider for a urinalysis, as bacterial infections require prescription antimicrobial therapy',
    ],
  },
  {
    id: 'viral_respiratory',
    name: 'Viral respiratory symptom pattern',
    category: 'Respiratory',
    primarySymptoms: ['cough', 'fever', 'fatigue', 'shortness_of_breath'],
    secondarySymptoms: ['loss_of_smell', 'loss_of_taste', 'body_pain', 'sore_throat'],
    severity: 'High',
    description: 'Lower respiratory involvement with systemic fever, cough, and dyspnea, which may indicate acute viral bronchitis or pneumonia requiring close clinical surveillance.',
    recommendedSteps: [
      'Monitor oxygen saturation if a pulse oximeter is available',
      'Consult a medical professional promptly for auscultation and clinical review',
      'Rest in an upright or slightly elevated position to assist lung expansion',
      'Seek emergency care immediately if shortness of breath becomes severe or chest pain develops',
    ],
  },
  {
    id: 'dermatologic_reaction',
    name: 'Skin / Contact reaction pattern',
    category: 'Dermatological',
    primarySymptoms: ['rash', 'itchy_skin'],
    secondarySymptoms: ['red_eyes', 'itchy_eyes'],
    severity: 'Mild',
    description: 'Cutaneous irritation or allergic dermatitis characterized by visible erythema, rash, and localized pruritus.',
    recommendedSteps: [
      'Avoid scratching the affected skin area to prevent secondary bacterial infection',
      'Apply cool, damp compresses to soothe itching sensations',
      'Cease using newly introduced cosmetics, laundry detergents, or topical lotions',
      'Consult a doctor or dermatologist if the rash spreads rapidly, becomes painful, or blisters',
    ],
  },
  {
    id: 'general_infection',
    name: 'General infection-like symptom pattern',
    category: 'Systemic',
    primarySymptoms: ['fever', 'chills', 'weakness', 'fatigue'],
    secondarySymptoms: ['body_pain', 'headache', 'dizziness'],
    severity: 'Moderate',
    description: 'Systemic inflammatory response pattern marked by temperature elevation and constitutional weakness without obvious organ-specific localization.',
    recommendedSteps: [
      'Monitor vital signs including temperature and resting heart rate',
      'Ensure high levels of physical rest and nutritional support',
      'Schedule a formal clinical consultation for complete diagnostic evaluation and blood work if indicated',
      'Contact emergency services if sudden confusion, persistent vomiting, or inability to stand develops',
    ],
  },
];
