// Speech-to-Text and Text-to-Speech Service using browser Web Speech API

// Types for Web Speech API
interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal?: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export class SpeechToTextController {
  private recognition: SpeechRecognitionInstance | null = null;
  private isListening = false;
  private onTranscriptCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((errorMessage: string) => void) | null = null;
  private onStatusChangeCallback: ((listening: boolean) => void) | null = null;

  constructor() {
    if (isSpeechRecognitionSupported()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      try {
        this.recognition = new SpeechRecognition();
        if (this.recognition) {
          this.recognition.continuous = false;
          this.recognition.interimResults = true;
          this.recognition.lang = 'en-US';

          this.recognition.onstart = () => {
            this.isListening = true;
            this.onStatusChangeCallback?.(true);
          };

          this.recognition.onresult = (event: SpeechRecognitionEventLike) => {
            let transcript = '';
            let isFinal = false;
            for (let i = 0; i < event.results.length; i++) {
              transcript += event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                isFinal = true;
              }
            }
            this.onTranscriptCallback?.(transcript, isFinal);
          };

          this.recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
            console.warn('Speech recognition error:', event.error);
            let friendly = 'Speech recognition error occurred.';
            if (event.error === 'not-allowed') {
              friendly = 'Microphone permission was denied. Please allow microphone access in your browser.';
            } else if (event.error === 'no-speech') {
              friendly = 'No speech was detected. Please try speaking again.';
            } else if (event.error === 'network') {
              friendly = 'Network error occurred during speech recognition.';
            }
            this.onErrorCallback?.(friendly);
            this.isListening = false;
            this.onStatusChangeCallback?.(false);
          };

          this.recognition.onend = () => {
            this.isListening = false;
            this.onStatusChangeCallback?.(false);
          };
        }
      } catch (e) {
        console.error('Failed to initialize speech recognition:', e);
      }
    }
  }

  public setCallbacks(
    onTranscript: (text: string, isFinal: boolean) => void,
    onError: (err: string) => void,
    onStatusChange: (listening: boolean) => void
  ) {
    this.onTranscriptCallback = onTranscript;
    this.onErrorCallback = onError;
    this.onStatusChangeCallback = onStatusChange;
  }

  public start() {
    if (!this.recognition) {
      this.onErrorCallback?.('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    try {
      this.recognition.start();
    } catch {
      // Already running or starting
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
  }

  public getListening(): boolean {
    return this.isListening;
  }
}

// Text-to-Speech Controller
class TTSController {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentPlayingId: string | null = null;
  private onStateChange: ((isPlaying: boolean, playingId: string | null) => void) | null = null;

  public setListener(cb: (isPlaying: boolean, playingId: string | null) => void) {
    this.onStateChange = cb;
  }

  public speak(text: string, messageId: string, rate: number = 1.0) {
    if (!isSpeechSynthesisSupported()) return;

    // Clean text of markdown/emojis for smoother natural speech
    const cleanText = text
      .replace(/[*_~`#]/g, '')
      .replace(/[🩺🤖👤⚠️●✓•]/g, '')
      .trim();

    // If currently speaking this message, toggle stop
    if (this.currentPlayingId === messageId && window.speechSynthesis.speaking) {
      this.stop();
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = Math.max(0.7, Math.min(1.5, rate));
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // Pick English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      this.currentPlayingId = messageId;
      this.onStateChange?.(true, messageId);
    };

    utterance.onend = () => {
      this.currentPlayingId = null;
      this.onStateChange?.(false, null);
    };

    utterance.onerror = (e) => {
      console.warn('TTS Error', e);
      this.currentPlayingId = null;
      this.onStateChange?.(false, null);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public stop() {
    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
    this.currentPlayingId = null;
    this.currentUtterance = null;
    this.onStateChange?.(false, null);
  }

  public isPlayingMessage(messageId: string): boolean {
    return this.currentPlayingId === messageId;
  }
}

export const ttsManager = new TTSController();
