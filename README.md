# HealthAI - Intelligent Health Symptom Checker & Diagnosis Assistant

A modern, interactive, and responsive web application for health symptom evaluation and pattern matching. Built with modern HTML5, CSS3, JavaScript/TypeScript, and React on the frontend, with complete Python Flask & SQLite backend capabilities.

---

## 1. Project Overview

**HealthAI Assistant** is an informational health symptom checker designed to interact naturally with users through both text and speech. The system allows users to describe their symptoms conversationally, select symptoms from an interactive categorized chip selector, receive intelligent follow-up questions, and view rule-based condition patterns with a match correlation percentage.

> ⚠️ **IMPORTANT MEDICAL DISCLAIMER**: This application provides informational symptom-pattern guidance and is **NOT** a substitute for professional medical diagnosis, advice, or treatment. It does not prescribe medications or predict certainty. For emergency symptoms (such as severe chest pain or breathing difficulty), the system immediately directs users to emergency medical care.

---

## 2. Key Features

- **Personalized Authentication**: Secure signup and login with password hashing (SHA-256 / PBKDF2), profile management, and private session history.
- **Conversational Chatbot**: AI-assistant chat interface with online status indicator, bot & user avatars, message timestamps, and typing indicators.
- **Natural Language Extraction**: Extracts clinical symptoms directly from conversational phrases like *"I have fever and cough"* or *"My throat hurts and I am sneezing"*.
- **Speech-to-Text (STT)**: 🎤 Microphone button with live pulse animation using the browser Web Speech API. Users can dictate symptoms and review/edit them before sending.
- **Text-to-Speech (TTS)**: 🔊 Speaker button on every assistant message with play/stop toggle and adjustable voice speed (0.8x, 1.0x, 1.2x).
- **Interactive Symptom Selector**: Categorized chip selector with categories (General, Respiratory, Neurological, Digestive, Eye, Skin, Urinary, Other) and quick search filtering.
- **Smart Follow-Up Flow**: Does not jump to premature conclusions; asks 1–2 relevant follow-up questions based on reported symptoms.
- **Rule-Based Matching Engine**: Computes normalized correlation score (e.g. `Symptom Match: 78%`) across condition patterns (Flu-like, Common Cold, Migraine, Gastroenteritis, Urinary Tract, Viral Respiratory, Allergic Rhinitis, etc.).
- **Clinical Severity & Next Steps**: Highlights clinical urgency (Mild, Moderate, High) and clear, actionable non-medicinal next steps (rest, hydration, temperature monitoring).
- **Emergency Safety Layer**: Real-time detection of high-risk phrases (chest pain, unconsciousness, severe bleeding, stroke signs) with immediate emergency hotline warnings.
- **Health Check History**: User-private history log with date, detected symptoms, matched pattern, and detail inspection modal.
- **Dark/Light Mode**: Full dual-theme styling with persistence in `localStorage`.
- **Responsive Layout**: Fully adaptive for desktop, tablet, and mobile browsers.

---

## 3. Technology Stack

### Frontend
- **HTML5 & Modern CSS3**: Tailwind CSS utility design system with custom animations.
- **JavaScript & TypeScript**: Strictly-typed interactive application engine.
- **React 19 & Vite**: Ultra-fast component lifecycle, responsive states, and build bundling.
- **Lucide Icons**: Comprehensive vector icons for medical and UI controls.
- **Web Speech APIs**: Browser-native `SpeechRecognition` and `SpeechSynthesis`.

### Backend (Python & SQLite)
- **Python 3.10+**: Core engine language.
- **Flask**: Lightweight, secure REST API server with session authentication.
- **SQLite 3**: Relational local database (`health.db`) with foreign-key constraints.
- **Werkzeug**: Secure password hashing (`generate_password_hash` / `check_password_hash`).
- **Flask-CORS**: Cross-origin request security.

---

## 4. Folder Structure

```text
HealthDiagnosis/
│
├── app.py                     # Flask REST API server
├── diagnosis.py               # Rule-based symptom matching engine & emergency checker
├── database.py                # SQLite database management, schema & queries
├── speech.py                  # Python speech fallbacks (pyttsx3 & speech_recognition)
├── requirements.txt           # Python package dependencies
├── README.md                  # Comprehensive project documentation
│
├── index.html                 # Main entry HTML file with Google Fonts
├── metadata.json              # App configuration & microphone permissions
├── package.json               # Node.js dependencies and build scripts
│
├── src/
│   ├── main.tsx               # React application entry point
│   ├── App.tsx                # Main container coordinating auth, navigation, and theme
│   ├── index.css              # Global styles & Tailwind imports
│   ├── types.ts               # Shared TypeScript interfaces & types
│   │
│   ├── data/
│   │   └── symptomsData.ts    # Symptom catalog, synonyms, emergency triggers & patterns
│   │
│   ├── engine/
│   │   └── diagnosisEngine.ts # Natural language extractor, scoring algorithm & follow-ups
│   │
│   ├── services/
│   │   ├── speechService.ts   # Web Speech API STT and SpeechSynthesis TTS manager
│   │   └── storageService.ts  # Session storage, password hashing & history tracking
│   │
│   └── components/
│       ├── Navbar.tsx         # Top navigation, theme toggle, and user profile bar
│       ├── AuthModal.tsx      # Modern Login and Sign Up cards with illustration
│       ├── DashboardView.tsx  # Welcome greeting, active check flow, and metrics
│       ├── ChatInterface.tsx  # Interactive conversational AI chatbot with STT & TTS
│       ├── SymptomSelector.tsx# Categorized selectable symptom chips with search
│       ├── ResultCard.tsx     # Health check result with match percentage & next steps
│       ├── EmergencyAlert.tsx # Prominent safety banner for high-risk symptoms
│       ├── HistoryView.tsx    # Private user health check history and details modal
│       ├── ProfileView.tsx    # User details, voice speed, and theme preferences
│       └── MedicalDisclaimerModal.tsx # Explanatory medical safety notice
│
└── database/
    └── health.db              # Auto-created SQLite relational database
```

---

## 5. Installation & Quick Start

### Web Application (Dev Server)

The interactive application runs directly via Vite:

```bash
# 1. Install Node.js dependencies
npm install

# 2. Run the development server
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## 6. Python Virtual Environment

To set up and run the Python Flask backend independently:

```bash
# Create a virtual environment
python3 -m venv venv

# Activate on Linux/macOS
source venv/bin/activate

# Activate on Windows
venv\Scripts\activate
```

---

## 7. Python Dependencies

Install the required Python packages into your virtual environment:

```bash
pip install -r requirements.txt
```

---

## 8. Database Setup

The SQLite database (`health.db`) is automatically initialized on the first run of `app.py` or by running:

```bash
python3 -c "import database; database.init_db(); print('Database initialized successfully!')"
```

### Database Tables:
1. `users`: Stores user accounts, emails, creation date, preferences, and hashed passwords.
2. `symptoms`: Catalog of symptoms and categories.
3. `health_checks`: Stores completed assessments, possible patterns, match scores, and timestamps.
4. `health_check_symptoms`: Relational table linking recorded symptoms to specific health checks.

---

## 9. How to Run the Python Flask Backend

Run the Flask server:

```bash
python3 app.py
```

The API endpoints will be accessible at `http://localhost:5000/api/`:
- `POST /api/signup`: Register user account
- `POST /api/login`: Authenticate user
- `POST /api/logout`: Terminate session
- `POST /api/chat`: Conversational follow-ups and symptom extraction
- `POST /api/analyze`: Direct symptom array pattern evaluation
- `GET /api/history`: Retrieve logged-in user's past evaluations
- `GET /api/profile`: Retrieve user preferences and account metrics

---

## 10. Browser Microphone Permissions (Speech-to-Text)

When clicking the 🎤 microphone button for the first time:
1. The browser displays a permission prompt asking for access to your microphone.
2. Click **Allow**.
3. Speak clearly into your microphone (e.g. *"I have a fever, cough, and body pain"*).
4. The transcription appears in the chat input bar in real time, ready for you to edit or send.
5. If denied, the app shows a friendly notification guiding you to check your browser's site permissions.

---

## 11. How Text-to-Speech (TTS) Works

- Every message from the assistant includes a 🔊 speaker icon.
- Clicking the speaker initiates the browser's `window.speechSynthesis` engine using natural English voices.
- Voice speed can be adjusted between **0.8x**, **1.0x**, and **1.2x** in the chat header or Profile view.
- Users can toggle auto-voice speaking on/off in their user profile settings.

---

## 12. How Speech-to-Text (STT) Works

- Uses the standard `SpeechRecognition` / `webkitSpeechRecognition` interface.
- Handles interim results to display feedback while you speak.
- Converts conversational phrases to structured text without requiring awkward yes/no formatting.
- The symptom extraction engine parses recognized text against synonym lists and medical keywords.
