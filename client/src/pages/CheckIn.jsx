import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Search, MessageSquare, Layers, Headphones, BookOpen,
  ArrowRight, BarChart2, ChevronDown, ChevronUp, Edit3, Check,
  X, Volume2, VolumeX, Play, Pause, RotateCcw, Heart, Lightbulb,
  TrendingUp, TrendingDown, Minus, Shield, AlertTriangle, AlertCircle,
  CheckCircle, FileText, Zap, Sparkles, Activity, ArrowUpRight
} from 'lucide-react';
import WaveformRecorder from '../components/WaveformRecorder.jsx';
import BiomarkerCard from '../components/BiomarkerCard.jsx';
import MindScoreGauge from '../components/MindScoreGauge.jsx';
import BlockchainRecord from '../components/BlockchainRecord.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

// ─── EMOTION CONFIG ───────────────────────────────────────────
const EMOTION_CONFIG = {
  Happy:     { emoji: '😊', color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)' },
  Calm:      { emoji: '😌', color: '#2DD4BF', bg: 'rgba(45,212,191,0.1)',  border: 'rgba(45,212,191,0.25)' },
  Excited:   { emoji: '🤩', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
  Motivated: { emoji: '💪', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)' },
  Neutral:   { emoji: '😐', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)' },
  Stressed:  { emoji: '😓', color: '#F97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.25)' },
  Angry:     { emoji: '😠', color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)' },
  Sad:       { emoji: '😢', color: '#818CF8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.25)' },
  Lonely:    { emoji: '🥺', color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)' },
  Anxious:   { emoji: '😰', color: '#FB923C', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.25)' },
};

// ─── RISK CONFIG ──────────────────────────────────────────────
const RISK_CONFIG = {
  'Low Concern':       { icon: CheckCircle,   color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)',  dot: '🟢' },
  'Monitor':           { icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  dot: '🟡' },
  'Elevated Concern':  { icon: AlertCircle,   color: '#F97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.25)',  dot: '🟠' },
  'High Concern':      { icon: AlertCircle,   color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',   dot: '🔴' },
};

const BIOMARKERS_META = [
  { key: 'wordFindingSpeed',    icon: Search,       labelKey: 'wordFindingSpeed',    description: 'Pause frequency before nouns' },
  { key: 'vocabularyDiversity', icon: BookOpen,     labelKey: 'vocabularyDiversity', description: 'Type-token ratio across session' },
  { key: 'sentenceComplexity',  icon: Layers,       labelKey: 'sentenceComplexity',  description: 'Avg clause depth + subordination' },
  { key: 'semanticCoherence',   icon: MessageSquare,labelKey: 'semanticCoherence',   description: 'Topic consistency + referential clarity' },
  { key: 'phonemicFluency',     icon: Headphones,   labelKey: 'phonemicFluency',     description: 'Articulation rate + self-correction' },
];

const BIOMARKER_COLORS = {
  wordFindingSpeed:    '#A78BFA',
  vocabularyDiversity: '#2DD4BF',
  sentenceComplexity:  '#60A5FA',
  semanticCoherence:   '#34D399',
  phonemicFluency:     '#F59E0B',
};

// ─── VOICE ASSISTANT HOOK ─────────────────────────────────────
function useVoiceAssistant(text, detectedLang = 'en') {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const utterRef = useRef(null);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }, []);

  const speak = useCallback(() => {
    if (!text || muted) return;
    window.speechSynthesis.cancel();

    const langLocales = {
      en: 'en-US',
      hi: 'hi-IN',
      es: 'es-ES',
      fr: 'fr-FR',
      ta: 'ta-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
    };
    const targetLocale = langLocales[detectedLang] || 'en-US';

    const doSpeak = (voices) => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.92;
      utter.pitch = 1.0;
      utter.volume = 1.0;
      utter.lang = targetLocale;

      // Best-match voice: prefer target language with quality voice
      let selectedVoice =
        voices.find(v => v.lang.startsWith(detectedLang) && (
          v.name.toLowerCase().includes('google') ||
          v.name.toLowerCase().includes('natural') ||
          v.name.toLowerCase().includes('siri') ||
          v.name.toLowerCase().includes('premium')
        )) ||
        voices.find(v => v.lang.startsWith(detectedLang)) ||
        voices.find(v => v.lang.startsWith(targetLocale.split('-')[0])) ||
        voices.find(v => v.lang === targetLocale) ||
        null;

      // ── REQUIRED DEBUG LOGS ──────────────────────────────────
      console.log('Detected Language:', detectedLang);
      console.log('Selected Voice:', selectedVoice?.name || '(none — browser will use default)');
      console.log('Utterance Lang:', utter.lang);
      console.log('Available voices for this lang:', voices.filter(v => v.lang.startsWith(detectedLang)).map(v => v.name));
      // ─────────────────────────────────────────────────────────

      if (selectedVoice) utter.voice = selectedVoice;

      utter.onstart  = () => { setSpeaking(true);  setPaused(false); };
      utter.onpause  = () => { setPaused(true); };
      utter.onresume = () => { setPaused(false); };
      utter.onend    = () => { setSpeaking(false);  setPaused(false); };
      utter.onerror  = () => { setSpeaking(false);  setPaused(false); };

      utterRef.current = utter;
      window.speechSynthesis.speak(utter);
      setStarted(true);
    };

    // getVoices() is async — the list may be empty on first call.
    // Wait for voiceschanged event if needed, then speak.
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      doSpeak(voices);
    } else {
      const onVoicesChanged = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        doSpeak(window.speechSynthesis.getVoices());
      };
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      // Safety timeout: if voiceschanged never fires, speak with whatever we have
      setTimeout(() => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        doSpeak(window.speechSynthesis.getVoices());
      }, 2000);
    }
  }, [text, muted, detectedLang]);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
    setPaused(false);
  }, []);

  const replay = useCallback(() => {
    stop();
    setTimeout(() => speak(), 100);
  }, [stop, speak]);

  const toggleMute = useCallback(() => {
    if (!muted) stop();
    setMuted(m => !m);
  }, [muted, stop]);

  // Autoplay voice assistant once response is ready
  useEffect(() => {
    if (text && !started && !muted) {
      const t = setTimeout(() => speak(), 800);
      return () => clearTimeout(t);
    }
  }, [text, started, muted, speak]);

  useEffect(() => () => window.speechSynthesis.cancel(), []);

  return { speaking, paused, muted, started, speak, pause, resume, replay, stop, toggleMute };
}

// ─── TRANSCRIPT EDITOR MODAL ──────────────────────────────────
function TranscriptEditor({ transcript, onSave, onClose }) {
  const { t } = useI18n();
  const [value, setValue] = useState(transcript);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(value);
    setIsSaving(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-2xl p-6 rounded-2xl"
        style={{ background: 'rgba(17,24,39,0.98)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{t('editTranscript')}</h3>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
              Filler words (um, uh) and pause markings are preserved during cognitive analysis — edit mishearings only.
            </p>
          </div>
          <button onClick={onClose} className="p-1 cursor-pointer" style={{ color: '#64748B' }}><X size={18} /></button>
        </div>
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          className="w-full h-48 px-4 py-3 rounded-xl text-sm text-white resize-none outline-none"
          style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'Inter, sans-serif', lineHeight: 1.7 }}
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', border: 'none', opacity: isSaving ? 0.7 : 1 }}
          >
            {isSaving ? 'Processing...' : <><Check size={14} /> {t('saveReanalyze')}</>}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {t('cancel')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── SECTION WRAPPER ──────────────────────────────────────────
function Section({ icon: Icon, iconColor, label, delay = 0, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16,1,0.3,1] }}
      className="p-6 rounded-2xl"
      style={{ background: 'rgba(17,24,39,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} style={{ color: iconColor }} />
        <span className="text-sm font-semibold" style={{ color: iconColor }}>{label}</span>
      </div>
      {children}
    </motion.div>
  );
}

// ─── FRIENDLY BIOMARKER CARD ──────────────────────────────────
function FriendlyBiomarkerCard({ icon: Icon, label, score, status, explanation, color, delay }) {
  const statusColor = status === 'Excellent' ? '#10B981' : status === 'Good' ? '#2DD4BF' : status === 'Fair' ? '#F59E0B' : '#EF4444';
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16,1,0.3,1] }}
      className="p-4 rounded-xl"
      style={{ background: 'rgba(30,33,48,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
            <Icon size={15} style={{ color }} />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{label}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs font-bold" style={{ color: statusColor }}>{score}</span>
              <span className="text-xs px-1.5 py-0.5 rounded"
                style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30` }}>
                {status}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="h-1 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.9, delay: delay + 0.1, ease: [0.4,0,0.2,1] }}
        />
      </div>
      <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>{explanation}</p>
    </motion.div>
  );
}

// ─── MAIN CHECKIN PAGE ────────────────────────────────────────
export default function CheckIn() {
  const navigate = useNavigate();
  const { addSession, addToast, sessions } = useApp();
  const { t, lang: uiLang } = useI18n();

  const [recorderState, setRecorderState]     = useState('IDLE');
  const [analysisResult, setAnalysisResult]   = useState(null);
  const [loading, setLoading]                 = useState(false);
  const [transcript, setTranscript]           = useState('');
  const [showEditor, setShowEditor]           = useState(false);
  const [showDetails, setShowDetails]         = useState(false);
  const [currentPrompt, setCurrentPrompt]     = useState('');
  const [recordingMode, setRecordingMode]     = useState('DAILY');

  // Trend Baselines calculation
  const [trendStats, setTrendStats] = useState({
    avg7d: null,
    avg30d: null,
    diff7d: 0,
    diff30d: 0,
    prevScore: null,
    diffPrev: 0
  });

  // Calculate baselines compared against local session history
  const calculateTrendBaselines = useCallback((currentScore) => {
    if (!sessions || sessions.length === 0) return;

    const now = new Date();
    const ms7d = 7 * 24 * 60 * 60 * 1000;
    const ms30d = 30 * 24 * 60 * 60 * 1000;

    const sessions7d = sessions.filter(s => (now - new Date(s.date)) <= ms7d);
    const sessions30d = sessions.filter(s => (now - new Date(s.date)) <= ms30d);

    const avg7d = sessions7d.length > 0
      ? parseFloat((sessions7d.reduce((sum, s) => sum + s.mindScore, 0) / sessions7d.length).toFixed(1))
      : null;

    const avg30d = sessions30d.length > 0
      ? parseFloat((sessions30d.reduce((sum, s) => sum + s.mindScore, 0) / sessions30d.length).toFixed(1))
      : null;

    // Previous session
    const sorted = [...sessions].sort((a,b) => new Date(b.date) - new Date(a.date));
    const prevScore = sorted.length > 0 ? sorted[0].mindScore : null;

    setTrendStats({
      avg7d,
      avg30d,
      diff7d: avg7d ? parseFloat((currentScore - avg7d).toFixed(1)) : 0,
      diff30d: avg30d ? parseFloat((currentScore - avg30d).toFixed(1)) : 0,
      prevScore,
      diffPrev: prevScore ? parseFloat((currentScore - prevScore).toFixed(1)) : 0
    });
  }, [sessions]);

  const handleRecordingComplete = useCallback(async ({ duration, mode, prompt, rawTranscript, avgConfidence, acousticMetrics, speechLanguage, aiReplyOption }) => {
    setLoading(true);
    setCurrentPrompt(prompt);
    setRecordingMode(mode);

    try {
      // ── CLIENT DEBUG LOGS ─────────────────────────────────────
      console.log('RAW TRANSCRIPT:', rawTranscript);
      console.log('DETECTED LANGUAGE:', speechLanguage);
      console.log('ANALYSIS INPUT:', rawTranscript);
      // ─────────────────────────────────────────────────────────

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: `session-${Date.now()}`,
          duration,
          prompt,
          rawTranscript,
          avgConfidence,
          acousticMetrics,
          speechLanguage,
          aiReplyOption,
          uiLang,
        }),
      });

      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();

      // Use rawTranscript from server (the exact unmodified input) for display
      setAnalysisResult(data);
      setTranscript(data.rawTranscript || data.transcript || '');
      setRecorderState('COMPLETE');
      calculateTrendBaselines(data.mindScore);

      addSession({
        id: data.sessionId, date: data.timestamp || new Date().toISOString(),
        duration, prompt, scores: data.scores, mindScore: data.mindScore,
        trend: data.trend, txHash: data.txHash, blockNumber: data.blockNumber,
        gasUsed: data.gasUsed, confirmed: true,
      });

      addToast({ type: 'success', message: `Session recorded · MindScore™ ${data.mindScore}`, detail: `Tx: ${data.txHash?.slice(0,10)}...` });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Failed to analyze recording.' });
      setRecorderState('IDLE');
    } finally {
      setLoading(false);
    }
  }, [addSession, addToast, calculateTrendBaselines, uiLang]);

  const handleEditTranscript = useCallback(async (newTranscript) => {
    if (!analysisResult) return;
    setLoading(true);
    setTranscript(newTranscript);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: analysisResult.sessionId,
          duration: analysisResult.duration || 45,
          prompt: currentPrompt || analysisResult.prompt || "Daily check-in conversation",
          rawTranscript: newTranscript,
          avgConfidence: analysisResult.transcriptConfidence || 95,
          acousticMetrics: analysisResult.acousticMetrics,
          speechLanguage: analysisResult.detectedLanguage,
          aiReplyOption: 'speech',
          uiLang,
        }),
      });

      if (!res.ok) throw new Error('Re-analysis failed');
      const data = await res.json();

      setAnalysisResult(data);
      setTranscript(data.transcript || '');
      calculateTrendBaselines(data.mindScore);

      addSession({
        id: data.sessionId,
        date: data.timestamp || new Date().toISOString(),
        duration: analysisResult.duration || 45,
        prompt: currentPrompt || analysisResult.prompt || "Daily check-in conversation",
        scores: data.scores,
        mindScore: data.mindScore,
        trend: data.trend,
        txHash: data.txHash,
        blockNumber: data.blockNumber,
        gasUsed: data.gasUsed,
        confirmed: true,
      });

      addToast({
        type: 'success',
        message: `Transcript updated & re-analyzed · MindScore™ ${data.mindScore}`,
        detail: `Tx: ${data.txHash?.slice(0,10)}...`,
      });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Failed to re-analyze edited transcript.' });
    } finally {
      setLoading(false);
    }
  }, [analysisResult, currentPrompt, addSession, addToast, calculateTrendBaselines, uiLang]);

  const handleRetry = () => { setRecorderState('IDLE'); setAnalysisResult(null); setTranscript(''); setShowDetails(false); };

  const r = analysisResult;
  const emotionCfg = r ? (EMOTION_CONFIG[r.emotion] || EMOTION_CONFIG.Neutral) : null;
  const riskCfg    = r ? (RISK_CONFIG[r.risk?.level] || RISK_CONFIG['Low Concern']) : null;

  // Voice Assistant Hook
  const { speaking, paused, muted, speak, pause, resume, replay, toggleMute } = useVoiceAssistant(
    r?.assistantResponse,
    r?.outputLanguage
  );

  // Dynamic WPM Calculation to prevent undefined ReferenceError
  const wordsList = transcript ? transcript.trim().split(/\s+/).filter(w => w.length > 0) : [];
  const durationMin = (r?.duration || 45) / 60;
  const calculatedWpm = durationMin > 0 ? Math.round(wordsList.length / durationMin) : 120;

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8 text-center sm:text-left">
          <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
            <BarChart2 size={18} style={{ color: '#A78BFA' }} />
            <span className="text-sm font-medium uppercase tracking-wider" style={{ color: '#A78BFA' }}>
              {t('dailyCheckin')}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            {t('welcome')}
          </h1>
          <p className="mt-2 text-sm max-w-xl leading-relaxed" style={{ color: '#94A3B8' }}>
            {t('subtitle')}
          </p>
        </motion.div>

        {/* ── RECORDING BOX ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}
          className="p-6 rounded-2xl mb-6"
          style={{ background: 'rgba(17,24,39,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
            <Activity size={16} className="text-purple-light animate-pulse" />
            <span>{t('voiceRecorder')}</span>
          </h2>
          <WaveformRecorder state={recorderState} onStateChange={setRecorderState} onComplete={handleRecordingComplete} />

          {recorderState === 'COMPLETE' && (
            <div className="flex gap-3 mt-6 justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm cursor-pointer border-none"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}
              >
                {t('viewDashboard')} <ArrowRight size={14} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleRetry}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer border"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8', borderColor: 'rgba(255,255,255,0.08)' }}
              >
                {t('newCheckin')}
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* ── ANALYSIS SKELETON ── */}
        <AnimatePresence>
          {recorderState === 'ANALYZING' && !r && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {[...Array(4)].map((_, i) => <SkeletonLoader key={i} type="card" />)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── RESULTS VIEW (PRIORITIZED ORDER) ── */}
        <AnimatePresence>
          {recorderState === 'COMPLETE' && r && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

              {/* Re-analysis loader flag */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 px-5 py-3 rounded-xl"
                    style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}
                  >
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
                      <Zap size={15} style={{ color: '#A78BFA' }} />
                    </motion.div>
                    <span className="text-sm font-semibold" style={{ color: '#A78BFA' }}>Recalculating biomarkers and emotions…</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 1. What You Said (Transcript) */}
              <Section icon={FileText} iconColor="#60A5FA" label={t('whatYouSaid')} delay={0.05}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-emerald-400 border border-emerald-500/20 bg-emerald-500/5">
                      Original Speech (Unmodified)
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(96,165,250,0.12)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.25)' }}>
                      {t('recognitionConfidence')}: {r.transcriptConfidence}%
                    </span>
                  </div>
                  <button
                    onClick={() => setShowEditor(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border border-white/10"
                    style={{ background: 'rgba(255,255,255,0.04)', color: '#CBD5E1' }}
                  >
                    <Edit3 size={12} /> {t('editTranscript')}
                  </button>
                </div>
                <p className="text-sm font-medium leading-relaxed" style={{ color: '#E2E8F0', fontStyle: 'italic', lineHeight: 1.8 }}>
                  "{transcript}"
                </p>
              </Section>

              {/* 2. Emotional Snapshot with Integrated Voice Assistant */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="p-6 rounded-2xl relative overflow-hidden"
                style={{ background: 'rgba(17,24,39,0.85)', backdropFilter: 'blur(12px)', border: `1px solid ${emotionCfg.border}` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Heart size={16} style={{ color: emotionCfg.color }} />
                    <span className="text-sm font-semibold" style={{ color: emotionCfg.color }}>{t('emotionalSnapshot')}</span>
                  </div>

                  {/* Clean, integrated Voice Assistant controls & indicator */}
                  {r.assistantResponse && (
                    <div className="flex items-center gap-3">
                      {speaking && !paused && (
                        <div className="flex items-center gap-0.5 h-4 px-2 rounded-lg bg-black/25 border border-white/5">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{ height: [4, Math.floor(8 + Math.random() * 10), 4] }}
                              transition={{ duration: 0.3 + Math.random() * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                              className="w-0.5 rounded-full animate-pulse"
                              style={{ background: '#A78BFA' }}
                            />
                          ))}
                        </div>
                      )}
                      
                      <button
                        onClick={toggleMute}
                        className="p-2 rounded-lg cursor-pointer transition-all border-none bg-white/5 hover:bg-white/10"
                        style={{ color: muted ? '#EF4444' : '#64748B' }}
                        title={muted ? t('unmute') : t('mute')}
                      >
                        {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                      </button>

                      {!speaking || paused ? (
                        <button
                          onClick={paused ? resume : speak}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border-none text-white bg-purple-600 hover:bg-purple-700"
                        >
                          <Play size={10} fill="white" /> <span>{paused ? t('resume') : t('play')}</span>
                        </button>
                      ) : (
                        <button
                          onClick={pause}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border-none text-white bg-purple-600/30 border border-purple-500/25"
                        >
                          <Pause size={10} fill="white" /> <span>{t('pause')}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-5 flex-wrap sm:flex-nowrap">
                  <div
                    className="flex flex-col items-center justify-center p-4 rounded-xl shrink-0 mx-auto sm:mx-0"
                    style={{ background: emotionCfg.bg, border: `1px solid ${emotionCfg.border}`, minWidth: 90 }}
                  >
                    <span style={{ fontSize: 32 }} className={speaking && !paused ? "animate-pulse" : ""}>{emotionCfg.emoji}</span>
                    <span className="text-sm font-bold mt-1.5" style={{ color: emotionCfg.color }}>
                      {r.outputLanguage === 'hi' ? r.risk?.explanation?.includes('शांत') ? 'शांत' : emotionCfg.emoji === '😊' ? 'खुश' : r.emotion : r.emotion}
                    </span>
                    <span className="text-[10px] mt-0.5 font-bold" style={{ color: '#64748B' }}>{r.emotionConfidence}%</span>
                  </div>
                  
                  <div className="flex-1 space-y-3 w-full">
                    <p className="text-sm leading-relaxed font-medium text-slate-300" style={{ lineHeight: 1.75 }}>
                      {r.emotionExplanation}
                    </p>
                    {r.assistantResponse && (
                      <div className="text-xs text-slate-400 italic bg-black/20 p-3.5 rounded-xl border border-white/5 relative">
                        <span className="text-[9px] font-bold text-purple-light uppercase tracking-wider block mb-1">AI Voice Assistant</span>
                        "{r.assistantResponse}"
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* 3. What This Means */}
              <Section icon={MessageSquare} iconColor="#2DD4BF" label={t('whatThisMeans')} delay={0.15}>
                <p className="text-sm leading-relaxed text-slate-300 font-medium" style={{ lineHeight: 1.8 }}>
                  {r.whatThisMeans}
                </p>
              </Section>

              {/* 4. Suggested Actions */}
              <Section icon={Lightbulb} iconColor="#F59E0B" label={t('suggestedActions')} delay={0.2}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {r.actions.map((action, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.22 + i * 0.06 }}
                      className="flex items-start gap-3 p-3 rounded-xl border"
                      style={{ background: 'rgba(245,158,11,0.03)', borderColor: 'rgba(245,158,11,0.12)' }}
                    >
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', fontSize: 10, fontWeight: 700 }}>
                        {i + 1}
                      </div>
                      <p className="text-xs font-semibold leading-relaxed text-slate-300">{action}</p>
                    </motion.div>
                  ))}
                </div>
              </Section>

              {/* 5. Trend Insights */}
              <Section icon={TrendingUp} iconColor="#2DD4BF" label={t('trendInsights')} delay={0.25}>
                <div className="space-y-4">
                  {/* Badges/insights */}
                  <div className="flex gap-2 flex-wrap">
                    {r.trendInsights?.map((insight, idx) => (
                      <span key={idx} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full text-emerald-400 border border-emerald-500/20 bg-emerald-500/5">
                        <ArrowUpRight size={12} />
                        {insight}
                      </span>
                    ))}
                  </div>

                  {/* Baseline Comparisons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                      <span className="text-[10px] text-muted font-bold block uppercase tracking-wider">vs Previous Session</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-lg font-mono font-bold text-white">
                          {trendStats.prevScore ? `${r.mindScore} vs ${trendStats.prevScore}` : `${r.mindScore}`}
                        </span>
                        {trendStats.prevScore && (
                          <span className={`text-xs font-bold ${trendStats.diffPrev >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {trendStats.diffPrev >= 0 ? `+${trendStats.diffPrev}` : trendStats.diffPrev}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                      <span className="text-[10px] text-muted font-bold block uppercase tracking-wider">vs 7-Day Baseline</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-lg font-mono font-bold text-white">
                          {trendStats.avg7d ? trendStats.avg7d : '—'}
                        </span>
                        {trendStats.avg7d && (
                          <span className={`text-xs font-bold ${trendStats.diff7d >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {trendStats.diff7d >= 0 ? `+${trendStats.diff7d}` : trendStats.diff7d}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                      <span className="text-[10px] text-muted font-bold block uppercase tracking-wider">vs 30-Day Baseline</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-lg font-mono font-bold text-white">
                          {trendStats.avg30d ? trendStats.avg30d : '—'}
                        </span>
                        {trendStats.avg30d && (
                          <span className={`text-xs font-bold ${trendStats.diff30d >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {trendStats.diff30d >= 0 ? `+${trendStats.diff30d}` : trendStats.diff30d}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mood trends graph row */}
                  <div className="pt-2 border-t border-white/5">
                    <div className="text-xs text-slate-400 font-semibold mb-3">7-Session Mood Baseline History:</div>
                    <div className="flex gap-2 flex-wrap">
                      {r.moodTrend?.map((entry, i) => {
                        const cfg = EMOTION_CONFIG[entry.mood] || EMOTION_CONFIG.Neutral;
                        return (
                          <div
                            key={i}
                            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg border text-center shrink-0"
                            style={{ background: cfg.bg, borderColor: cfg.border }}
                          >
                            <span className="text-lg">{cfg.emoji}</span>
                            <span className="text-[9px] font-bold" style={{ color: cfg.color }}>
                              {r.outputLanguage === 'hi' ? cfg.emoji === '😌' ? 'शांत' : cfg.emoji === '😊' ? 'खुश' : entry.mood : entry.mood}
                            </span>
                            <span className="text-[9px] text-muted font-bold">{entry.session.replace('Session ', '#')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Section>

              {/* 6. Risk Status */}
              {riskCfg && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.3, ease: [0.16,1,0.3,1] }}
                  className="p-6 rounded-2xl"
                  style={{ background: 'rgba(17,24,39,0.85)', backdropFilter: 'blur(12px)', border: `1px solid ${riskCfg.border}` }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Shield size={16} style={{ color: riskCfg.color }} />
                    <span className="text-sm font-semibold" style={{ color: riskCfg.color }}>{t('riskStatus')}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm shrink-0 border"
                      style={{ background: riskCfg.bg, borderColor: riskCfg.border, color: riskCfg.color }}
                    >
                      <riskCfg.icon size={15} />
                      <span>{r.risk.label || t('lowConcern')}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300 font-medium">{r.risk.explanation}</p>
                  </div>
                </motion.div>
              )}

              {/* 7. Conversation Summary (Lower Priority) */}
              <Section icon={Sparkles} iconColor="#A78BFA" label={t('conversationSummary')} delay={0.35}>
                <p className="text-sm leading-relaxed text-slate-300 font-medium" style={{ lineHeight: 1.8 }}>
                  {r.summary}
                </p>
              </Section>

              {/* 8. View Detailed Analysis (Accordion) - Contains all technical metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.4 }}
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex items-center justify-between px-6 py-4 cursor-pointer transition-all border-none"
                  style={{ background: showDetails ? 'rgba(124,58,237,0.12)' : 'rgba(17,24,39,0.85)' }}
                >
                  <div className="flex items-center gap-2">
                    <Zap size={16} style={{ color: '#A78BFA' }} />
                    <span className="text-sm font-bold text-white">{t('viewDetailedAnalysis')}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA' }}>
                      {t('technicalBlockchainCharts')}
                    </span>
                  </div>
                  {showDetails ? <ChevronUp size={16} style={{ color: '#64748B' }} /> : <ChevronDown size={16} style={{ color: '#64748B' }} />}
                </button>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16,1,0.3,1] }}
                      style={{ overflow: 'hidden', background: 'rgba(12,16,26,0.9)' }}
                    >
                      <div className="p-6 space-y-6">
                        {/* Overall MindScore Gauge */}
                        <div>
                          <h3 className="text-sm font-bold text-white mb-4">{t('overallMindscore')}</h3>
                          <div className="flex items-center gap-8 flex-wrap">
                            <MindScoreGauge score={r.mindScore} size={180} />
                            <div className="flex flex-col gap-3">
                              <div>
                                <div className="text-[10px] text-muted font-bold block uppercase tracking-wider">{t('trend30Day')}</div>
                                <div className="font-mono font-bold text-base mt-0.5 animate-pulse"
                                  style={{ color: r.trend >= 0 ? '#10B981' : '#EF4444' }}>
                                  {r.trend >= 0 ? '+' : ''}{r.trend?.toFixed(1)}
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] text-muted font-bold block uppercase tracking-wider">{t('sessionNum')}</div>
                                <div className="font-mono font-bold text-base text-white mt-0.5">28</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Acoustic Biomarkers measurements */}
                        {r.acousticMetrics && (
                          <div>
                            <h3 className="text-sm font-bold text-white mb-4">{t('acousticBiomarkers')}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                              <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-center">
                                <span className="text-[10px] text-muted font-bold block uppercase tracking-wider">{t('speechRate')}</span>
                                <span className="font-mono text-sm font-bold text-white mt-1 block">{Math.round(calculatedWpm || 120)} WPM</span>
                              </div>
                              <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-center">
                                <span className="text-[10px] text-muted font-bold block uppercase tracking-wider">{t('pauseDuration')}</span>
                                <span className="font-mono text-sm font-bold text-white mt-1 block">{r.acousticMetrics.pauseDuration || 0}s</span>
                              </div>
                              <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-center">
                                <span className="text-[10px] text-muted font-bold block uppercase tracking-wider">{t('pauseFrequency')}</span>
                                <span className="font-mono text-sm font-bold text-white mt-1 block">{r.acousticMetrics.pauseFrequency || 0} / min</span>
                              </div>
                              <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-center">
                                <span className="text-[10px] text-muted font-bold block uppercase tracking-wider">{t('volumeVariation')}</span>
                                <span className="font-mono text-sm font-bold text-white mt-1 block">{Math.round((r.acousticMetrics.volumeVariation || 0.05) * 1000)} dB</span>
                              </div>
                              <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-center">
                                <span className="text-[10px] text-muted font-bold block uppercase tracking-wider">{t('pitchVariation')}</span>
                                <span className="font-mono text-sm font-bold text-white mt-1 block">{r.acousticMetrics.pitchVariation || 0} Hz</span>
                              </div>
                              <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-center">
                                <span className="text-[10px] text-muted font-bold block uppercase tracking-wider">{t('emotionalIntensity')}</span>
                                <span className="font-mono text-sm font-bold text-white mt-1 block">{r.acousticMetrics.emotionalIntensity || 0}%</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Biomarker Scores (Plain English) */}
                        <div>
                          <h3 className="text-sm font-bold text-white mb-4">{t('biomarkerScores')}</h3>
                          <div className="space-y-4">
                            {BIOMARKERS_META.map((bm, i) => {
                              const detail = r.biomarkerDetails?.[bm.key] || {};
                              return (
                                <FriendlyBiomarkerCard
                                  key={bm.key}
                                  icon={bm.icon}
                                  label={t(bm.labelKey)}
                                  score={r.scores[bm.key]}
                                  status={detail.status || 'Fair'}
                                  explanation={detail.explanation || ''}
                                  color={BIOMARKER_COLORS[bm.key]}
                                  delay={0.05 + i * 0.05}
                                />
                              );
                            })}
                          </div>
                        </div>

                        {/* Blockchain Record */}
                        <div>
                          <h3 className="text-sm font-bold text-white mb-4">{t('blockchainRecord')}</h3>
                          <BlockchainRecord
                            txHash={r.txHash} blockNumber={r.blockNumber}
                            timestamp={r.timestamp} gasUsed={r.gasUsed}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Privacy Notice */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-6 p-4 rounded-xl text-center"
          style={{ background: 'rgba(13,148,136,0.04)', border: '1px solid rgba(13,148,136,0.12)' }}
        >
          <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
            🔒 <strong style={{ color: '#94A3B8' }}>{t('privacyFirst')}</strong> {t('privacyNote')}
          </p>
        </motion.div>
      </div>

      {/* Transcript Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <TranscriptEditor
            transcript={transcript}
            onSave={handleEditTranscript}
            onClose={() => setShowEditor(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
