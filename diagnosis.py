"""
Symptom-matching rule engine and medical safety evaluation.
Provides informational symptom pattern guidance. NOT a definitive medical diagnosis.
"""

import re

# Comprehensive list of symptoms and synonyms
SYMPTOMS_CATALOG = {
    'fever': ['fever', 'high temperature', 'febrile', 'burning up', 'feverish', 'temperature'],
    'fatigue': ['fatigue', 'tired', 'exhausted', 'exhaustion', 'low energy', 'drowsy'],
    'chills': ['chills', 'shivering', 'shivers', 'feeling cold'],
    'body_pain': ['body pain', 'body aches', 'muscle aches', 'muscle pain', 'myalgia', 'aching all over'],
    'weakness': ['weakness', 'feeling weak', 'loss of strength', 'lethargy'],
    'cough': ['cough', 'coughing', 'dry cough', 'wet cough', 'hacking cough'],
    'shortness_of_breath': ['shortness of breath', 'difficulty breathing', 'breathless', 'trouble breathing'],
    'sore_throat': ['sore throat', 'throat hurts', 'scratchy throat', 'pain swallowing'],
    'runny_nose': ['runny nose', 'congested', 'stuffy nose', 'nasal congestion', 'blocked nose'],
    'sneezing': ['sneezing', 'sneeze', 'sneezes'],
    'headache': ['headache', 'head hurts', 'throbbing head', 'head pain', 'migraine'],
    'dizziness': ['dizziness', 'dizzy', 'lightheaded', 'vertigo', 'spinning'],
    'light_sensitivity': ['light sensitivity', 'sensitive to light', 'photophobia'],
    'nausea': ['nausea', 'feeling sick', 'queasy', 'upset stomach'],
    'vomiting': ['vomiting', 'throwing up', 'threw up', 'puking'],
    'diarrhea': ['diarrhea', 'loose stools', 'watery stool'],
    'abdominal_pain': ['abdominal pain', 'stomach hurts', 'stomach ache', 'belly ache', 'cramping'],
    'red_eyes': ['red eyes', 'bloodshot eyes', 'pink eye'],
    'itchy_eyes': ['itchy eyes', 'eyes itching', 'scratchy eyes'],
    'watery_eyes': ['watery eyes', 'tearing eyes'],
    'rash': ['rash', 'skin eruption', 'hives', 'spots on skin'],
    'itchy_skin': ['itchy skin', 'itchiness', 'pruritus'],
    'burning_urination': ['burning urination', 'pain when peeing', 'dysuria'],
    'frequent_urination': ['frequent urination', 'peeing often', 'urinary frequency'],
    'loss_of_smell': ['loss of smell', 'cannot smell', 'anosmia'],
    'loss_of_taste': ['loss of taste', 'cannot taste', 'ageusia'],
}

EMERGENCY_TRIGGERS = [
    'chest pain', 'crushing chest', 'cannot breathe', 'severe difficulty breathing',
    'loss of consciousness', 'passed out', 'unconscious', 'severe bleeding',
    'coughing blood', 'vomiting blood', 'sudden paralysis', 'facial drooping',
    'slurred speech', 'suicide', 'suicidal', 'kill myself', 'worst headache of my life',
    'blue lips', 'seizure'
]

DIAGNOSIS_PATTERNS = [
    {
        'id': 'flu_like',
        'name': 'Flu-like symptom pattern',
        'category': 'Viral Respiratory',
        'primary': ['fever', 'body_pain', 'fatigue', 'chills'],
        'secondary': ['cough', 'headache', 'weakness', 'sore_throat'],
        'severity': 'Moderate',
        'description': 'Presentation characterized by acute fever, generalized body aches, chills, and fatigue, commonly seen in viral respiratory syndromes.',
        'steps': [
            'Prioritize bed rest and limit physical exertion',
            'Maintain adequate fluid intake (water, broths, electrolyte solutions)',
            'Monitor body temperature regularly',
            'Consult a healthcare professional if fever persists over 3 days or exceeds 103°F',
            'Consult a physician or pharmacist before taking over-the-counter medications'
        ]
    },
    {
        'id': 'common_cold',
        'name': 'Common cold-like symptom pattern',
        'category': 'Upper Respiratory',
        'primary': ['runny_nose', 'sneezing', 'sore_throat'],
        'secondary': ['cough', 'fatigue', 'watery_eyes'],
        'severity': 'Mild',
        'description': 'Upper respiratory presentation characterized by localized nasal congestion, sneezing, and mild throat irritation without high fever.',
        'steps': [
            'Rest in a comfortably humidified room',
            'Stay hydrated with warm liquids (warm water, herbal teas)',
            'Perform warm saline gargles for throat comfort',
            'Seek clinical evaluation if symptoms worsen after 7 to 10 days'
        ]
    },
    {
        'id': 'allergic_rhinitis',
        'name': 'Allergy-like symptom pattern',
        'category': 'Allergy / Environmental',
        'primary': ['sneezing', 'itchy_eyes', 'runny_nose', 'watery_eyes'],
        'secondary': ['red_eyes', 'cough', 'itchy_skin'],
        'severity': 'Mild',
        'description': 'Symptom profile consistent with seasonal or environmental allergic irritation affecting nasal passages and eyes.',
        'steps': [
            'Identify and minimize exposure to potential allergen triggers (pollen, dander, dust)',
            'Rinse face and eyes with cool clean water after outdoor exposure',
            'Discuss suitable antihistamines or saline rinses with a healthcare provider',
            'Consult an allergist if symptoms are recurrent or persistent'
        ]
    },
    {
        'id': 'migraine',
        'name': 'Migraine-like symptom pattern',
        'category': 'Neurological',
        'primary': ['headache', 'light_sensitivity', 'nausea'],
        'secondary': ['dizziness', 'vomiting', 'fatigue'],
        'severity': 'Moderate',
        'description': 'Neurovascular headache presentation marked by throbbing head pain, photophobia (light sensitivity), and autonomic nausea.',
        'steps': [
            'Rest in a dark, quiet, well-ventilated room',
            'Apply a cool compress gently to the forehead or neck',
            'Sip small amounts of water to stay hydrated without upsetting your stomach',
            'Avoid bright screens, loud noises, and strong scents',
            'Consult a physician for prescription migraine management if recurrent'
        ]
    },
    {
        'id': 'gastroenteritis',
        'name': 'Digestive illness-like symptom pattern',
        'category': 'Gastrointestinal',
        'primary': ['nausea', 'vomiting', 'diarrhea', 'abdominal_pain'],
        'secondary': ['fatigue', 'weakness', 'fever', 'chills'],
        'severity': 'Moderate',
        'description': 'Acute gastrointestinal presentation marked by abdominal cramping, nausea, vomiting, or diarrhea.',
        'steps': [
            'Replenish lost fluids with oral rehydration salts (ORS) or dilute electrolyte broths',
            'Follow a gentle bland diet (bananas, rice, applesauce, toast) once vomiting ceases',
            'Avoid dairy, greasy, or spicy foods',
            'Seek urgent medical attention if unable to keep liquids down for 24 hours'
        ]
    },
    {
        'id': 'urinary_tract',
        'name': 'Urinary symptom pattern',
        'category': 'Urological',
        'primary': ['burning_urination', 'frequent_urination'],
        'secondary': ['abdominal_pain', 'fever'],
        'severity': 'Moderate',
        'description': 'Presentation localized to the urinary tract with dysuria (burning sensation) and urinary frequency.',
        'steps': [
            'Drink plenty of plain water to help flush the urinary tract',
            'Avoid caffeine and acidic drinks',
            'Consult a healthcare professional promptly for urinalysis and prescription therapy'
        ]
    },
    {
        'id': 'viral_respiratory',
        'name': 'Viral respiratory symptom pattern',
        'category': 'Respiratory',
        'primary': ['cough', 'fever', 'fatigue', 'shortness_of_breath'],
        'secondary': ['loss_of_smell', 'loss_of_taste', 'body_pain'],
        'severity': 'High',
        'description': 'Lower respiratory involvement accompanied by fever and breathlessness requiring clinical review.',
        'steps': [
            'Consult a medical professional promptly for auscultation and clinical review',
            'Rest in an upright position to facilitate easier breathing',
            'Seek emergency care immediately if shortness of breath worsens'
        ]
    }
]

def detect_emergency(text):
    lowered = text.lower()
    for trigger in EMERGENCY_TRIGGERS:
        if trigger in lowered:
            return {
                'is_emergency': True,
                'matched_phrase': trigger,
                'message': f"Immediate clinical emergency care may be required ({trigger}). Please call emergency services (911 or your local emergency number) immediately."
            }
    return {'is_emergency': False}

def extract_symptoms(text):
    lowered = text.lower()
    detected = set()

    for sym_id, synonyms in SYMPTOMS_CATALOG.items():
        for syn in synonyms:
            pattern = rf"\b{re.escape(syn)}\b"
            if re.search(pattern, lowered):
                detected.add(sym_id)
                break
    return list(detected)

def get_follow_up(known_symptoms, asked_symptoms):
    if not known_symptoms:
        return {
            'question': "Could you share what symptoms you are experiencing? (For example: fever, cough, body pain, or headache)?",
            'candidates': ['fever', 'cough', 'body_pain', 'headache']
        }

    for pattern in DIAGNOSIS_PATTERNS:
        match_count = sum(1 for s in known_symptoms if s in pattern['primary'] or s in pattern['secondary'])
        if match_count > 0:
            unasked = [s for s in (pattern['primary'] + pattern['secondary']) if s not in known_symptoms and s not in asked_symptoms]
            if unasked:
                pick = unasked[:2]
                names = [s.replace('_', ' ') for s in pick]
                return {
                    'question': f"I understand. Are you also experiencing {' or '.join(names)}?",
                    'candidates': pick
                }
    return None

def analyze_symptoms(symptom_ids):
    if not symptom_ids:
        return {
            'possible_pattern': 'Inconclusive - Insufficient symptoms reported',
            'symptom_match': 0,
            'severity': 'Mild',
            'detected_symptoms': [],
            'recommended_steps': ['Monitor your symptoms', 'Rest and hydrate', 'Consult a healthcare professional'],
            'is_emergency': False
        }

    best_pattern = DIAGNOSIS_PATTERNS[0]
    best_score = 0

    for pattern in DIAGNOSIS_PATTERNS:
        p_matches = sum(1 for s in symptom_ids if s in pattern['primary'])
        s_matches = sum(1 for s in symptom_ids if s in pattern['secondary'])
        total_p = max(1, len(pattern['primary']))
        total_s = max(1, len(pattern['secondary']))

        score = (p_matches * 2.5 + s_matches * 1.0) / (total_p * 2.5 + total_s * 1.0)
        percentage = min(92, max(45, int(score * 100)))

        if percentage > best_score:
            best_score = percentage
            best_pattern = pattern

    detected_names = [s.replace('_', ' ').title() for s in symptom_ids]
    severity = 'High' if 'shortness_of_breath' in symptom_ids else best_pattern['severity']

    return {
        'possible_pattern': best_pattern['name'],
        'symptom_match': best_score,
        'severity': severity,
        'detected_symptoms': detected_names,
        'description': best_pattern['description'],
        'recommended_steps': best_pattern['steps'],
        'is_emergency': False
    }
