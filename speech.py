"""
Speech utilities for HealthAI Assistant.
Provides optional backend Speech-to-Text and Text-to-Speech fallbacks.
The web application primarily utilizes the HTML5 Web Speech API (webkitSpeechRecognition and window.speechSynthesis).
"""

import sys

def speak_text(text):
    """
    Optional server-side Text-to-Speech synthesis using pyttsx3.
    """
    try:
        import pyttsx3
        engine = pyttsx3.init()
        engine.setProperty('rate', 160)
        engine.say(text)
        engine.runAndWait()
        return True
    except ImportError:
        print("[Notice] pyttsx3 not installed. Web SpeechSynthesis API is active on client side.")
        return False
    except Exception as e:
        print(f"[Notice] TTS error: {e}")
        return False

def listen_to_speech():
    """
    Optional server-side Speech-to-Text recognition using speech_recognition.
    """
    try:
        import speech_recognition as sr
        recognizer = sr.Recognizer()
        with sr.Microphone() as source:
            print("Listening for symptoms...")
            recognizer.adjust_for_ambient_noise(source, duration=0.8)
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=10)
            text = recognizer.recognize_google(audio)
            return {'success': True, 'text': text}
    except ImportError:
        return {'success': False, 'error': 'SpeechRecognition library not installed on server.'}
    except Exception as e:
        return {'success': False, 'error': str(e)}
