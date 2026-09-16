import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Bot,
  User as UserIcon,
  Layers,
  AlertCircle,
  Activity,
  Sliders,
} from 'lucide-react';
import { ChatMessage, User, DiagnosisResult } from '../types';
import { SpeechToTextController, ttsManager, isSpeechRecognitionSupported } from '../services/speechService';
import {
  detectEmergency,
  extractSymptomsFromText,
  parseFollowUpAnswer,
  getSmartFollowUp,
  analyzeSymptoms,
} from '../engine/diagnosisEngine';
import { saveHealthRecord } from '../services/storageService';
import { ResultCard } from './ResultCard';
import { EmergencyAlert } from './EmergencyAlert';

interface ChatInterfaceProps {
  currentUser: User | null;
  onOpenSymptomSelector: () => void;
  selectedSymptomIds: string[];
  onAddSymptoms: (symptomIds: string[]) => void;
  onViewHistory: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  currentUser,
  onOpenSymptomSelector,
  selectedSymptomIds,
  onAddSymptoms,
  onViewHistory,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [sttError, setSttError] = useState<string | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [speechSpeed, setSpeechSpeed] = useState<number>(currentUser?.preferences?.speechSpeed || 1.0);
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active check session state
  const [currentSymptomIds, setCurrentSymptomIds] = useState<string[]>([]);
  const [askedSymptomIds, setAskedSymptomIds] = useState<string[]>([]);
  const [turnCount, setTurnCount] = useState<number>(0);
  const [currentEmergency, setCurrentEmergency] = useState<{ reason: string; phrase: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sttControllerRef = useRef<SpeechToTextController | null>(null);

  // Initialize Speech-to-Text
  useEffect(() => {
    const stt = new SpeechToTextController();
    stt.setCallbacks(
      (transcript) => {
        setInputText(transcript);
      },
      (err) => {
        setSttError(err);
        setTimeout(() => setSttError(null), 5000);
      },
      (listening) => {
        setIsListening(listening);
      }
    );
    sttControllerRef.current = stt;

    // Listen to TTS state
    ttsManager.setListener((isPlaying, playingId) => {
      setPlayingMessageId(isPlaying ? playingId : null);
    });

    return () => {
      stt.stop();
      ttsManager.stop();
    };
  }, []);

  // Initial welcome message
  useEffect(() => {
    resetChat();
  }, [currentUser]);

  // Sync selected symptom chips if added from outside
  useEffect(() => {
    if (selectedSymptomIds.length > 0) {
      const newItems = selectedSymptomIds.filter((id) => !currentSymptomIds.includes(id));
      if (newItems.length > 0) {
        setCurrentSymptomIds((prev) => Array.from(new Set([...prev, ...newItems])));
      }
    }
  }, [selectedSymptomIds]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isAnalyzing]);

  const resetChat = () => {
    ttsManager.stop();
    setCurrentEmergency(null);
    setCurrentSymptomIds([]);
    setAskedSymptomIds([]);
    setTurnCount(0);
    const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'there';

    const initialBotMessage: ChatMessage = {
      id: 'msg_welcome',
      sender: 'bot',
      text: `Hello ${firstName}! I'm your HealthAI Assistant. To give you the best guidance, please tell me about your symptoms. You can type them or use the microphone.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedQuestions: [
        'I have fever and cough',
        'I have headache, nausea and sensitivity to light',
        'My throat hurts and I am sneezing',
        'Select symptoms manually',
      ],
    };

    setMessages([initialBotMessage]);
  };

  // Toggle voice recognition
  const handleToggleMic = () => {
    if (isListening) {
      sttControllerRef.current?.stop();
    } else {
      setSttError(null);
      sttControllerRef.current?.start();
    }
  };

  // Toggle voice speaking for a message
  const handleToggleSpeak = (text: string, id: string) => {
    ttsManager.speak(text, id, speechSpeed);
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    if (isListening) {
      sttControllerRef.current?.stop();
    }

    if (text === 'Select symptoms manually') {
      onOpenSymptomSelector();
      return;
    }

    // Append User Message
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Step 1: Emergency check
    const emergencyCheck = detectEmergency(text);
    if (emergencyCheck.isEmergency) {
      setCurrentEmergency({
        reason: emergencyCheck.reason || 'High-risk indicator detected',
        phrase: emergencyCheck.matchedPhrase || '',
      });

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const botMsg: ChatMessage = {
          id: 'msg_emg_' + Date.now(),
          sender: 'bot',
          text: `⚠️ Emergency Notice: You mentioned symptoms that require immediate clinical evaluation (${emergencyCheck.matchedPhrase}). Please contact emergency medical services (such as 911 or your local emergency number) without delay.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isEmergency: true,
        };
        setMessages((prev) => [...prev, botMsg]);
      }, 700);
      return;
    }

    // Step 2: Extract symptoms and parse follow up
    const extractedFromText = extractSymptomsFromText(text);

    // Look at previous bot message to see if user was answering follow up candidates
    const lastBotMsg = [...messages].reverse().find((m) => m.sender === 'bot');
    let updatedConfirmed = Array.from(new Set([...currentSymptomIds, ...extractedFromText]));

    if (lastBotMsg && lastBotMsg.followUpSymptoms && lastBotMsg.followUpSymptoms.length > 0) {
      const followUpAnalysis = parseFollowUpAnswer(text, lastBotMsg.followUpSymptoms);
      if (followUpAnalysis.confirmed.length > 0) {
        updatedConfirmed = Array.from(new Set([...updatedConfirmed, ...followUpAnalysis.confirmed]));
      }
    }

    setCurrentSymptomIds(updatedConfirmed);
    onAddSymptoms(updatedConfirmed);

    const newTurn = turnCount + 1;
    setTurnCount(newTurn);

    const wantsAnalysisNow =
      /analyze|finish|result|diagnos|summary|what do i have|tell me/i.test(text);

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      if (updatedConfirmed.length === 0 && !wantsAnalysisNow) {
        const botMsg: ChatMessage = {
          id: 'msg_' + Date.now(),
          sender: 'bot',
          text: `I understand. To help me check for common symptom patterns, could you describe specific physical symptoms you are feeling? (For example: fever, cough, body pain, nausea, or headache)?\n\nYou can also click "Symptom Chips" to browse categorized symptoms.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedQuestions: [
            'I have fever and cough',
            'I have headache and light sensitivity',
            'I have stomach pain and nausea',
            'Select symptoms manually',
          ],
        };
        setMessages((prev) => [...prev, botMsg]);
        return;
      }

      // Check smart follow-up question
      const followUp = getSmartFollowUp(updatedConfirmed, askedSymptomIds);

      if (followUp && newTurn < 2 && !wantsAnalysisNow) {
        setAskedSymptomIds((prev) => [...prev, ...followUp.candidateSymptomIds]);

        const botMsg: ChatMessage = {
          id: 'msg_' + Date.now(),
          sender: 'bot',
          text: followUp.question,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          followUpSymptoms: followUp.candidateSymptomIds,
          suggestedQuestions: [
            ...followUp.suggestedQuickReplies,
            'No other symptoms, analyze now',
          ],
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        triggerAnalysis(updatedConfirmed);
      }
    }, 900);
  };

  const triggerAnalysis = (symptomIds: string[]) => {
    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);
      const diagnosisResult = analyzeSymptoms(symptomIds);

      if (currentUser) {
        saveHealthRecord(currentUser.id, {
          date: new Date().toISOString(),
          symptoms: diagnosisResult.detectedSymptoms,
          possiblePattern: diagnosisResult.patternName,
          symptomMatch: diagnosisResult.matchScore,
          severity: diagnosisResult.severity,
          recommendedSteps: diagnosisResult.recommendedSteps,
          isEmergency: diagnosisResult.isEmergency,
        });
      }

      const botMsg: ChatMessage = {
        id: 'msg_result_' + Date.now(),
        sender: 'bot',
        text: `Based on the reported symptoms (${diagnosisResult.detectedSymptoms.join(', ')}), here is an informational pattern correlation.\n\nPossible Pattern: **${diagnosisResult.patternName}** (Symptom Match: ${diagnosisResult.matchScore}%). Consult a qualified healthcare professional for medical evaluation.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        diagnosisResult,
        suggestedQuestions: [
          'What should I monitor next?',
          'Start New Health Check',
          'View my health history',
        ],
      };

      setMessages((prev) => [...prev, botMsg]);

      if (currentUser?.preferences?.voiceEnabled) {
        ttsManager.speak(
          `Analysis complete. Possible pattern: ${diagnosisResult.patternName}. Symptom match: ${diagnosisResult.matchScore} percent.`,
          botMsg.id,
          speechSpeed
        );
      }
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[650px] sm:h-[720px] bg-[#10121D]/70 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative backdrop-blur-sm">
      {/* Immersive Chat Header */}
      <div className="px-6 py-4 bg-[#10121D] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <Bot className="w-5 h-5" />
            </div>
            {/* Online Pulse */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#10121D] rounded-full animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-white">
                HealthAI Assistant
              </h3>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20 text-[10px] font-bold text-green-400 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Online
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Conversational symptom analysis • Voice enabled
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Speech speed selector */}
          <div className="hidden sm:flex items-center gap-1 bg-[#161B2D] px-2.5 py-1.5 rounded-xl border border-slate-700/80 text-xs">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400">Speed:</span>
            <select
              value={speechSpeed}
              onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
              className="bg-transparent text-xs font-semibold text-blue-400 focus:outline-hidden cursor-pointer"
            >
              <option value="0.8" className="bg-[#10121D] text-slate-200">0.8x</option>
              <option value="1.0" className="bg-[#10121D] text-slate-200">1.0x</option>
              <option value="1.2" className="bg-[#10121D] text-slate-200">1.2x</option>
            </select>
          </div>

          <button
            id="symptom-drawer-toggle"
            onClick={onOpenSymptomSelector}
            title="Browse all symptom chips"
            className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Symptom Chips</span>
            {currentSymptomIds.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                {currentSymptomIds.length}
              </span>
            )}
          </button>

          <button
            id="reset-chat-btn"
            onClick={resetChat}
            title="Start new health check conversation"
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-[#161B2D] border border-slate-700 hover:border-slate-600 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Emergency banner if detected */}
      {currentEmergency && (
        <div className="px-6 pt-3">
          <EmergencyAlert
            reason={currentEmergency.reason}
            matchedPhrase={currentEmergency.phrase}
            onDismiss={() => setCurrentEmergency(null)}
          />
        </div>
      )}

      {/* STT Error Notification */}
      {sttError && (
        <div className="mx-6 mt-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{sttError}</span>
        </div>
      )}

      {/* Message Feed with custom scrollbar */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          const isPlayingThis = playingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 ${isBot ? 'justify-start' : 'justify-end'} animate-in fade-in duration-200`}
            >
              {isBot && (
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.4)] text-white mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] p-4 text-sm leading-relaxed ${
                  isBot
                    ? msg.isEmergency
                      ? 'bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl rounded-tl-none'
                      : 'bg-[#1E253A] border border-slate-700/60 text-slate-200 rounded-2xl rounded-tl-none shadow-sm'
                    : 'bg-blue-600 text-white rounded-2xl rounded-tr-none shadow-[0_5px_15px_rgba(37,99,235,0.25)]'
                }`}
              >
                {/* Text */}
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* If message includes diagnosis result card */}
                {msg.diagnosisResult && (
                  <div className="mt-4">
                    <ResultCard
                      result={msg.diagnosisResult}
                      onStartNewCheck={resetChat}
                      onViewHistory={onViewHistory}
                    />
                  </div>
                )}

                {/* Footer: Time & Action Buttons for bot */}
                <div className="mt-3 pt-2 flex items-center justify-between border-t border-slate-700/50 text-[10px] text-slate-400">
                  <span className={isBot ? 'text-slate-500' : 'text-blue-200'}>{msg.timestamp}</span>

                  {isBot && !msg.diagnosisResult && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSpeak(msg.text, msg.id)}
                        title={isPlayingThis ? 'Stop voice' : 'Listen to message'}
                        className="p-1 text-slate-400 hover:text-blue-400 rounded transition cursor-pointer"
                      >
                        {isPlayingThis ? (
                          <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleCopyMessage(msg.text, msg.id)}
                        title="Copy text"
                        className="p-1 text-slate-400 hover:text-blue-400 rounded transition cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Suggested Quick Replies */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex flex-wrap gap-2">
                    {msg.suggestedQuestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sug)}
                        className="px-3 py-1.5 rounded-xl bg-[#10121D] hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs font-medium transition cursor-pointer active:scale-98"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {!isBot && (
                <div className="w-8 h-8 rounded-full bg-[#1E253A] border border-slate-700 text-blue-400 flex items-center justify-center shrink-0 mt-1 font-bold text-xs">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator matching design */}
        {isTyping && (
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#1E253A] border border-slate-700/60 rounded-2xl rounded-tl-none p-4 max-w-[80%] space-y-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <p className="text-xs italic text-slate-400">HealthAI is thinking...</p>
            </div>
          </div>
        )}

        {/* Analyzing Animation matching design snippet */}
        {isAnalyzing && (
          <div className="flex items-start gap-3.5 animate-in fade-in">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#1E253A] border border-slate-700/60 rounded-2xl rounded-tl-none p-4 max-w-[80%] space-y-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <p className="text-sm italic text-slate-400">Analyzing your symptoms...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Interactive Chat Input Bar matching #0D101B */}
      <div className="p-4 sm:p-6 bg-[#0D101B] border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-3 relative"
        >
          {/* Microphone Speech-to-Text Button matching design */}
          <button
            type="button"
            id="mic-speech-to-text-btn"
            onClick={handleToggleMic}
            title={isListening ? 'Stop listening' : 'Speak symptoms (Microphone)'}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)] animate-pulse'
                : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-blue-400 border border-slate-700/60'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input Field matching design */}
          <div className="relative flex-1">
            <input
              id="chat-symptom-input"
              type="text"
              placeholder={
                isListening
                  ? 'Listening to your voice... (Speak now)'
                  : 'Type your symptoms here...'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className={`w-full bg-[#161B2D] border rounded-2xl py-3.5 pl-5 pr-20 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition ${
                isListening ? 'border-rose-500' : 'border-slate-700'
              }`}
            />

            {/* Send Button matching design uppercase text */}
            <button
              id="chat-send-btn"
              type="submit"
              disabled={!inputText.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 font-bold text-xs uppercase tracking-widest px-3 py-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-500/10 transition cursor-pointer"
              title="Send message"
            >
              Send
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between mt-2.5 px-1 text-[11px] text-slate-500">
          <span>{isSpeechRecognitionSupported() ? '🎤 Web Speech STT Active' : 'Speech-to-text text fallback'}</span>
          <span>Press Enter to send • 🔊 Click speaker icon to listen</span>
        </div>
      </div>
    </div>
  );
};
