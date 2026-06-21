import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, CheckCircle, Loader } from 'lucide-react';
import { useI18n } from '../context/I18nContext.jsx';

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SPEECH_API_SUPPORTED = !!SpeechRecognition;

export default function WaveformRecorder({ onComplete, state, onStateChange }) {
  const { t, lang: uiLang } = useI18n();

  // Recorder states
  const [elapsed, setElapsed] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [confidence, setConfidence] = useState(null);
  const [phraseLog, setPhraseLog] = useState([]);
  const [speechError, setSpeechError] = useState(null);

  // Real-time Web Audio API variables
  const [realtimeVolume, setRealtimeVolume] = useState(Array(8).fill(10)); // For animated waveform

  const timerRef = useRef(null);
  const recognizerRef = useRef(null);
  const finalTextRef = useRef('');
  const phraseLogRef = useRef([]);

  // Audio nodes refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const audioAnimationRef = useRef(null);
  const audioMetricsRef = useRef({
    volumes: [],
    frequencies: [],
    pausesCount: 0,
    totalPauseDuration: 0,
    isSilence: true,
    silenceStart: 0,
  });

  // ── Web Audio Analyser Setup ──────────────────────────────
  const startAudioAnalyser = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioMetricsRef.current = {
        volumes: [],
        frequencies: [],
        pausesCount: 0,
        totalPauseDuration: 0,
        isSilence: true,
        silenceStart: Date.now(),
      };

      const bufferLength = analyser.frequencyBinCount;
      const timeData = new Uint8Array(bufferLength);
      const freqData = new Uint8Array(bufferLength);

      const updateAnalysis = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(timeData);
        analyserRef.current.getByteFrequencyData(freqData);

        // Calculate RMS (volume level)
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const val = (timeData[i] - 128) / 128;
          sum += val * val;
        }
        const rms = Math.sqrt(sum / bufferLength); // value in range 0 - 1
        audioMetricsRef.current.volumes.push(rms);

        // Find dominant pitch / frequency peak
        let maxVal = -1;
        let maxIdx = -1;
        for (let i = 0; i < bufferLength; i++) {
          if (freqData[i] > maxVal) {
            maxVal = freqData[i];
            maxIdx = i;
          }
        }
        const nyquist = audioCtx.sampleRate / 2;
        const dominantFreq = maxIdx * (nyquist / bufferLength);
        if (rms > 0.015) {
          audioMetricsRef.current.frequencies.push(dominantFreq);
        }

        // Realtime animated bar visualization heights (simulate variance)
        const heights = Array.from({ length: 8 }).map((_, idx) => {
          const start = Math.floor((idx / 8) * bufferLength);
          const val = freqData[start] || 0;
          return Math.max(10, Math.round((val / 255) * 45));
        });
        setRealtimeVolume(heights);

        // Pause Detection: silence threshold = 0.012
        const silenceThreshold = 0.012;
        const now = Date.now();
        if (rms < silenceThreshold) {
          if (!audioMetricsRef.current.isSilence) {
            audioMetricsRef.current.isSilence = true;
            audioMetricsRef.current.silenceStart = now;
          }
        } else {
          if (audioMetricsRef.current.isSilence) {
            const pauseDurationMs = now - audioMetricsRef.current.silenceStart;
            if (pauseDurationMs > 800) { // pause must be > 800ms
              audioMetricsRef.current.pausesCount += 1;
              audioMetricsRef.current.totalPauseDuration += pauseDurationMs / 1000;
            }
            audioMetricsRef.current.isSilence = false;
          }
        }

        audioAnimationRef.current = requestAnimationFrame(updateAnalysis);
      };

      updateAnalysis();
    } catch (e) {
      console.warn("Failed to start audio analyzer node:", e);
    }
  };

  const stopAudioAnalyser = () => {
    if (audioAnimationRef.current) {
      cancelAnimationFrame(audioAnimationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  // ── Timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (state === 'RECORDING') {
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      if (state === 'IDLE') {
        setElapsed(0);
        setLiveTranscript('');
        setInterimText('');
        setConfidence(null);
        setPhraseLog([]);
        finalTextRef.current = '';
        phraseLogRef.current = [];
        setRealtimeVolume(Array(8).fill(10));
      }
    }
    return () => clearInterval(timerRef.current);
  }, [state]);

  // Determine actual speech recognition locale based on navigator languages or current UI language
  const getRecognitionLang = useCallback(() => {
    const supportedLocales = {
      hi: 'hi-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      es: 'es-ES',
      fr: 'fr-FR',
      en: 'en-US'
    };

    // PRIMARY: Use the app's UI language as the recognition language.
    // This is what the user explicitly chose for the app, so it is the most
    // reliable signal for which language they intend to speak.
    if (uiLang && uiLang !== 'en' && supportedLocales[uiLang]) {
      return supportedLocales[uiLang];
    }

    // SECONDARY: Check browser preferred languages (only useful when uiLang=en)
    const browserLangs = navigator.languages || [navigator.language];
    for (const lang of browserLangs) {
      const short = lang.split('-')[0].toLowerCase();
      if (short !== 'en' && supportedLocales[short]) {
        return supportedLocales[short];
      }
    }

    // FALLBACK: default to English
    return 'en-US';
  }, [uiLang]);

  // ── Start Speech Recognition ───────────────────────────────
  const startRecognition = useCallback(() => {
    if (!SPEECH_API_SUPPORTED) return;

    const recognizer = new SpeechRecognition();
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.maxAlternatives = 1;
    recognizer.lang = getRecognitionLang();

    recognizer.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const rawPhrase = result[0].transcript;
          const phraseConf = result[0].confidence ?? null;
          const ts = Date.now();

          finalTextRef.current += (finalTextRef.current ? ' ' : '') + rawPhrase;
          setLiveTranscript(finalTextRef.current);

          const entry = { text: rawPhrase, confidence: phraseConf, timestamp: ts };
          phraseLogRef.current = [...phraseLogRef.current, entry];
          setPhraseLog([...phraseLogRef.current]);

          const confValues = phraseLogRef.current.filter(p => p.confidence !== null).map(p => p.confidence);
          if (confValues.length > 0) {
            setConfidence(Math.round((confValues.reduce((a, b) => a + b, 0) / confValues.length) * 100));
          }
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimText(interim);
    };

    recognizer.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setSpeechError('Microphone permission denied. Please allow microphone access.');
      } else if (event.error !== 'no-speech') {
        setSpeechError(`Speech recognition error: ${event.error}`);
      }
    };

    recognizer.onend = () => {
      if (recognizerRef.current && state === 'RECORDING') {
        try { recognizerRef.current.start(); } catch (_) {}
      }
    };

    recognizerRef.current = recognizer;
    try {
      recognizer.start();
    } catch (e) {
      setSpeechError('Could not start speech recognition.');
    }
  }, [state, getRecognitionLang]);

  // ── Stop Speech Recognition ────────────────────────────────
  const stopRecognition = useCallback(() => {
    if (recognizerRef.current) {
      try {
        recognizerRef.current.onend = null;
        recognizerRef.current.stop();
      } catch (_) {}
      recognizerRef.current = null;
    }
  }, []);

  // Compute final acoustic metrics
  const computeAcousticMetrics = () => {
    const data = audioMetricsRef.current;
    if (!data || data.volumes.length === 0) {
      return {
        avgVolume: 0.15,
        volumeVariation: 0.05,
        pitchVariation: 25,
        pauseDuration: 3.2,
        pauseFrequency: 4.5,
        emotionalIntensity: 45,
      };
    }

    const avgVol = data.volumes.reduce((a, b) => a + b, 0) / data.volumes.length;
    // Vol variation (variance)
    const volVar = Math.sqrt(data.volumes.map(x => Math.pow(x - avgVol, 2)).reduce((a, b) => a + b, 0) / data.volumes.length);

    // Pitch metrics (Frequencies)
    const avgFreq = data.frequencies.length > 0 ? (data.frequencies.reduce((a, b) => a + b, 0) / data.frequencies.length) : 150;
    const freqVar = data.frequencies.length > 0 ? Math.sqrt(data.frequencies.map(x => Math.pow(x - avgFreq, 2)).reduce((a, b) => a + b, 0) / data.frequencies.length) : 20;

    // Pauses
    const pauseDur = data.totalPauseDuration;
    const totalMinutes = elapsed > 0 ? elapsed / 60 : 0.5;
    const pauseFreq = data.pausesCount / totalMinutes;

    // Emotional intensity proxy
    let rawIntensity = (volVar * 400) + (freqVar * 0.8) + (avgVol * 150);
    const emoIntensity = Math.max(15, Math.min(98, Math.round(rawIntensity)));

    return {
      avgVolume: parseFloat(avgVol.toFixed(3)),
      volumeVariation: parseFloat(volVar.toFixed(3)),
      pitchVariation: Math.round(freqVar),
      pauseDuration: parseFloat(pauseDur.toFixed(1)),
      pauseFrequency: parseFloat(pauseFreq.toFixed(1)),
      emotionalIntensity: emoIntensity,
    };
  };

  // ── Handle microphone button actions ──────────────────────────
  const handleMicClick = async () => {
    if (state === 'IDLE') {
      setSpeechError(null);
      finalTextRef.current = '';
      phraseLogRef.current = [];
      setLiveTranscript('');
      setInterimText('');
      setPhraseLog([]);
      setConfidence(null);
      onStateChange('RECORDING');
      setElapsed(0);
      
      await startAudioAnalyser();
      if (SPEECH_API_SUPPORTED) startRecognition();
    } else if (state === 'RECORDING') {
      stopRecognition();
      stopAudioAnalyser();
      clearInterval(timerRef.current);

      const rawTranscript = finalTextRef.current.trim();
      const avgConfidence = phraseLogRef.current.filter(p => p.confidence !== null).length > 0
        ? Math.round(phraseLogRef.current.filter(p => p.confidence !== null)
            .reduce((a, b) => a + b.confidence, 0) /
            phraseLogRef.current.filter(p => p.confidence !== null).length * 100)
        : null;

      const acousticMetrics = computeAcousticMetrics();

      onStateChange('ANALYZING');
      
      setTimeout(() => {
        onComplete({
          duration: elapsed,
          mode: 'DAILY',
          prompt: 'Talk about anything for 30–60 seconds.',
          rawTranscript: rawTranscript,
          phraseLog: phraseLogRef.current,
          avgConfidence,
          speechApiUsed: SPEECH_API_SUPPORTED,
          acousticMetrics,
          speechLanguage: getRecognitionLang(),
          aiReplyOption: 'speech',
        });
      }, 2800);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecognition();
      stopAudioAnalyser();
    };
  }, [stopRecognition]);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[350px] relative">
      <AnimatePresence mode="wait">
        
        {/* IDLE state: minimalist large microphone button */}
        {state === 'IDLE' && (
          <motion.div
            key="idle"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-6"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMicClick}
              className="w-32 h-32 rounded-full flex items-center justify-center cursor-pointer relative border-none"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
                boxShadow: '0 0 50px rgba(124, 58, 237, 0.5), 0 0 100px rgba(124, 58, 237, 0.2)',
              }}
            >
              <Mic size={48} className="text-white" />
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: '2px solid rgba(124, 58, 237, 0.4)',
                  animation: 'micIdlePulse 2.5s ease-out infinite',
                }}
              />
              <style>{`
                @keyframes micIdlePulse {
                  0% { transform: scale(1); opacity: 1; }
                  100% { transform: scale(1.8); opacity: 0; }
                }
              `}</style>
            </motion.button>
            
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">{t('defaultPrompt')}</h3>
              <p className="text-xs text-slate-400 font-medium">{t('tapToBegin')}</p>
            </div>
            
            {speechError && (
              <p className="text-xs font-semibold text-red-400 text-center max-w-xs">{speechError}</p>
            )}
          </motion.div>
        )}

        {/* RECORDING state */}
        {state === 'RECORDING' && (
          <motion.div
            key="recording"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-6 w-full max-w-md"
          >
            {/* Timer */}
            <div className="font-mono text-4xl font-extrabold text-red-500 animate-pulse tracking-wide">
              {formatTime(elapsed)}
            </div>

            {/* Real-time Web Audio API animated frequency waveform */}
            <div className="flex items-center gap-1.5 h-16 justify-center w-full">
              {realtimeVolume.map((height, i) => (
                <motion.div
                  key={i}
                  animate={{ height: height }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="w-2 rounded-full"
                  style={{
                    background: 'linear-gradient(180deg, #C084FC 0%, #EF4444 100%)',
                    boxShadow: '0 0 12px rgba(192, 132, 252, 0.4)',
                  }}
                />
              ))}
            </div>

            {/* Live real-time transcript preview */}
            {SPEECH_API_SUPPORTED && (liveTranscript || interimText) ? (
              <div
                className="w-full p-4 rounded-2xl max-h-36 overflow-y-auto"
                style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="text-[10px] tracking-wider text-slate-500 font-bold mb-1 uppercase">
                  Live Transcript
                </div>
                <p className="text-xs leading-relaxed text-slate-200" style={{ lineHeight: 1.8 }}>
                  {liveTranscript}
                  {interimText && <span className="text-slate-500 italic"> {interimText}</span>}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Speak naturally. We will transcribe your speech in real time...</p>
            )}

            {/* Stop recording button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMicClick}
              className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer border-none"
              style={{
                background: 'linear-gradient(135deg, #EF4444, #B91C1C)',
                boxShadow: '0 0 45px rgba(239, 68, 68, 0.4)',
              }}
            >
              <Square size={24} className="text-white animate-pulse" fill="white" />
            </motion.button>

            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider">{t('recording')}</p>
            </div>
          </motion.div>
        )}

        {/* ANALYZING state */}
        {state === 'ANALYZING' && (
          <motion.div
            key="analyzing"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-6"
          >
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(124, 58, 237, 0.12)',
                border: '2px solid rgba(124, 58, 237, 0.3)',
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              >
                <Loader size={40} className="text-purple-400" />
              </motion.div>
            </div>
            
            <div className="text-center space-y-1">
              <p className="text-base font-bold text-white tracking-tight">{t('analyzing')}</p>
              <p className="text-xs text-slate-400">{t('processingSpeech')}</p>
            </div>

            <div className="w-64">
              <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #7C3AED, #2DD4BF)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.6, ease: 'easeInOut' }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* COMPLETE state */}
        {state === 'COMPLETE' && (
          <motion.div
            key="complete"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '2px solid rgba(16, 185, 129, 0.4)',
                boxShadow: '0 0 40px rgba(16, 185, 129, 0.2)',
              }}
            >
              <CheckCircle size={44} className="text-emerald-500" />
            </motion.div>
            <div className="text-center space-y-0.5">
              <p className="font-bold text-white tracking-tight">{t('analysisComplete')}</p>
              <p className="text-xs text-slate-400">{t('rawSpeechSecured')}</p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
