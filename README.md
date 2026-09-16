# 🤖 HealthAssistant

HealthAssistant is a web-based AI Health Diagnosis Assistant that helps users understand their symptoms through an interactive and user-friendly platform.

The application allows users to enter symptoms using text or speech and provides possible symptom patterns, risk indications, and general health guidance.

It combines healthcare assistance, rule-based diagnosis logic, and speech functionality into one platform designed for educational purposes.

---

## 🚀 Features

- 🩺 **AI Health Symptom Checker** — Enter symptoms and view possible symptom patterns.
- ⌨️ **Text-Based Input** — Enter symptoms using text.
- 🎤 **Speech Recognition** — Enter symptoms using voice input.
- 🔊 **Text-to-Speech** — Listen to health-related responses.
- 🧠 **Diagnosis Engine** — Match symptoms using rule-based logic.
- ⚠️ **Risk Indications** — Display possible severity or risk information.
- 📋 **Health Check History** — View previous health checks.
- 👤 **User Authentication** — Signup and login functionality.
- 👤 **User Profile** — Manage user-related information.
- 📱 **Responsive UI** — User-friendly interface for different screen sizes.
- ⚕️ **Medical Disclaimer** — Provides educational guidance and encourages professional consultation.

---

## 🧩 System Architecture

```text
┌──────────────────┐
│       USER       │
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│   REACT FRONTEND     │
│   TypeScript + Vite  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    FLASK BACKEND     │
│       Python         │
└──────────┬───────────┘
           │
     ┌─────┴──────┐
     ▼            ▼
┌──────────┐ ┌──────────────┐
│ Diagnosis│ │  Database    │
│  Engine  │ │ Operations   │
└────┬─────┘ └──────┬───────┘
     │              │
     └──────┬───────┘
            ▼
┌──────────────────────┐
│  Health Guidance     │
│  and Results         │
└──────────────────────┘
```

---

## 🔄 Application Workflow

```text
              ┌──────────────────┐
              │      START       │
              └────────┬─────────┘
                       ↓
           ┌──────────────────────┐
           │   Signup / Login     │
           └──────────┬───────────┘
                      ↓
             ◇ Authentication ◇
                /          \
              No            Yes
              ↓              ↓
           Login      ┌─────────────┐
                      │  Dashboard  │
                      └──────┬──────┘
                             ↓
                  ┌──────────────────┐
                  │ Enter Symptoms   │
                  │ Text / Speech   │
                  └────────┬─────────┘
                           ↓
                  ┌──────────────────┐
                  │ Symptom Matching │
                  │ Diagnosis Engine │
                  └────────┬─────────┘
                           ↓
                  ┌──────────────────┐
                  │ Possible Symptom │
                  │    Pattern       │
                  └────────┬─────────┘
                           ↓
                  ┌──────────────────┐
                  │ Risk Indication  │
                  │ and Guidance     │
                  └────────┬─────────┘
                           ↓
                  ┌──────────────────┐
                  │ Save/View History│
                  └──────────────────┘
```

---

## 📂 Project Structure

```text
HealthAssistant/
│
├── public/                      # Public assets
│
├── src/                         # Frontend source code
│   ├── components/              # React components
│   ├── data/                    # Symptoms and health data
│   ├── engine/                  # Diagnosis engine
│   ├── services/                # Speech and storage services
│   ├── App.tsx                  # Main React component
│   ├── main.tsx                 # Application entry point
│   ├── index.css                # Global styling
│   └── types.ts                 # TypeScript type definitions
│
├── app.py                       # Flask backend
├── database.py                  # Database operations
├── diagnosis.py                 # Diagnosis logic
├── speech.py                    # Speech functionality
│
├── .env                         # Environment variables
├── index.html                   # Main HTML file
├── metadata.json                # Project metadata
├── package.json                 # Frontend dependencies
├── package-lock.json            # Dependency lock file
├── requirements.txt             # Python dependencies
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite configuration
└── README.md                    # Project documentation
```

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd HealthAssistant
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

---

## 🔐 Configure Environment Variables

Create a `.env` file in the project root if your application requires environment variables.

Example:

```env
# Add your required environment variables here
```

> Do not upload private API keys or sensitive information to GitHub.

---

## ▶️ Run the Project

### Start Frontend

```bash
npm run dev
```

Open the URL displayed in the terminal.

Usually, Vite runs on:

```text
http://localhost:5173
```

### Start Flask Backend

Open another terminal and run:

```bash
python app.py
```

The Flask backend usually runs on:

```text
http://127.0.0.1:5000
```

---

## 🛠️ Technologies Used

### 1. Frontend

- React
- TypeScript
- Vite
- HTML5
- CSS3
- JavaScript

### 2. Backend

- Python
- Flask
- Flask-CORS

### 3. Diagnosis Engine

- Rule-Based Symptom Matching
- Python Diagnosis Logic

### 4. Speech Functionality

- Speech Recognition
- Text-to-Speech
- Web Speech API

### 5. Database

- Database module used in the project
- Local storage and/or configured database

---

## 🎯 Use Cases

- 🩺 Basic Symptom Checking
- 🎤 Voice-Based Symptom Input
- 📋 Health Check History
- 🧠 Educational Diagnosis Assistance
- ⚠️ General Health Guidance
- 👤 User Health Interaction

---

## 🔮 Future Improvements

- 🤖 Advanced AI-Based Diagnosis Assistance
- 📱 Mobile Application
- 🏥 Doctor Consultation Integration
- 📊 Health Analytics Dashboard
- 🌐 Multilingual Support
- 🔔 Health Reminder Notifications
- 📄 Downloadable Health Reports
- 🧬 Improved Symptom Analysis

---

## 🎓 Academic Purpose

This project is developed for educational and academic purposes.

It demonstrates:

- Frontend Development
- React and TypeScript
- Python Flask Backend
- Rule-Based Diagnosis
- Speech Recognition
- Database Concepts
- Web Application Development
- GitHub Project Management

---

## ⚠️ Medical Disclaimer

This application is developed for educational purposes only.

The results provided by the application represent possible symptom patterns and should not be considered a definitive medical diagnosis.

This application does not replace professional medical advice, diagnosis, or treatment.

Users should consult a qualified healthcare professional for proper medical guidance.

In case of a medical emergency, contact emergency services immediately.

---

## 👩‍💻 Developed By

**Student Project**

### Project Name

**HealthAssistant – AI Health Diagnosis Assistant**