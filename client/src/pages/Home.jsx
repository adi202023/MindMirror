import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, Shield, Key, ArrowRight, ChevronRight, Zap } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp.js';
import { useI18n } from '../context/I18nContext.jsx';

// Typewriter effect hook
function useTypewriter(text, speed = 60) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

function StatCard({ value, suffix, label, delay }) {
  const num = useCountUp(parseFloat(value) || 0, 1500, value.includes('.') ? 0 : 0, true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="text-center p-6"
    >
      <div
        className="font-mono font-bold text-3xl md:text-4xl mb-1"
        style={{ color: '#A78BFA' }}
      >
        {value.startsWith('0') ? value : value.includes('+') || value.includes('%') || value.includes('yrs') || value.includes('bytes')
          ? value
          : num.toLocaleString() + (suffix || '')
        }
      </div>
      <div className="text-sm" style={{ color: '#64748B' }}>{label}</div>
    </motion.div>
  );
}

export default function Home() {
  const { t, lang } = useI18n();
  const welcomeText = lang === 'hi' 
    ? 'संज्ञानात्मक स्पष्टता का आवाज़ आधारित दर्पण।'
    : 'Your language remembers what your mind forgets.';
  
  const { displayed, done } = useTypewriter(welcomeText, 55);

  const featureCards = [
    {
      icon: Brain,
      title: t('featureVoice'),
      desc: t('featureVoiceDesc'),
      color: '#A78BFA',
      bg: 'rgba(124, 58, 237, 0.08)',
      border: 'rgba(124, 58, 237, 0.2)',
    },
    {
      icon: Shield,
      title: t('featurePrivacy'),
      desc: t('featurePrivacyDesc'),
      color: '#2DD4BF',
      bg: 'rgba(13, 148, 136, 0.08)',
      border: 'rgba(13, 148, 136, 0.2)',
    },
    {
      icon: Key,
      title: t('featureOwnership'),
      desc: t('featureOwnershipDesc'),
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.08)',
      border: 'rgba(245, 158, 11, 0.2)',
    },
  ];

  const localStats = [
    { value: '55M+', label: lang === 'hi' ? 'दुनिया भर में मनोभ्रंश पीड़ित' : 'People with dementia worldwide' },
    { value: '75%', label: lang === 'hi' ? 'शुरुआती दौर में निदान नहीं' : 'Undiagnosed in early stages' },
    { value: '5–7 yrs', label: lang === 'hi' ? 'शुरुआती पहचान का समय' : 'Early detection window' },
    { value: '0 bytes', label: lang === 'hi' ? 'सुरक्षित वॉइस भंडारण' : 'Raw audio stored' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{
            background: 'rgba(124, 58, 237, 0.1)',
            border: '1px solid rgba(124, 58, 237, 0.25)',
          }}
        >
          <Zap size={12} style={{ color: '#A78BFA' }} />
          <span className="text-xs font-medium" style={{ color: '#A78BFA' }}>
            MindMirror Cognitive Guardian
          </span>
        </motion.div>

        {/* Headline - Typewriter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-6 text-center max-w-4xl"
        >
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
            style={{ letterSpacing: '-0.02em' }}
          >
            <span
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #A78BFA 50%, #2DD4BF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {displayed}
            </span>
            {!done && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                style={{ color: '#A78BFA' }}
              >
                |
              </motion.span>
            )}
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center text-base md:text-lg max-w-2xl mb-10 leading-relaxed font-medium"
          style={{ color: '#94A3B8' }}
        >
          {t('subtitle')}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <Link to="/checkin">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white text-sm cursor-pointer border-none"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
                boxShadow: '0 0 30px rgba(124, 58, 237, 0.4)',
              }}
            >
              {t('startCheckin')}
              <ArrowRight size={16} />
            </motion.button>
          </Link>
          <Link to="/dashboard">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm cursor-pointer"
              style={{
                background: 'rgba(124, 58, 237, 0.1)',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                color: '#A78BFA',
              }}
            >
              {t('viewDashboard')}
              <ChevronRight size={16} />
            </motion.button>
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 flex flex-col items-center gap-2"
        >
          <div className="text-xs" style={{ color: '#475569' }}>Scroll to explore</div>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-6 rounded-full"
            style={{ background: 'linear-gradient(to bottom, rgba(124,58,237,0.6), transparent)' }}
          />
        </motion.div>
      </section>

      {/* Feature Cards */}
      <section className="relative max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 rounded-2xl cursor-default animate-pulse-slow"
              style={{
                background: card.bg,
                border: `1px solid ${card.border}`,
                backdropFilter: 'blur(12px)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: card.bg, border: `1px solid ${card.border}` }}
              >
                <card.icon size={22} style={{ color: card.color }} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Row */}
      <section className="relative max-w-5xl mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl"
          style={{
            background: 'rgba(17, 24, 39, 0.7)',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {localStats.map((stat, i) => (
              <StatCard key={stat.label} value={stat.value} label={stat.label} delay={i * 0.1} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="relative max-w-5xl mx-auto px-4 pb-28">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold text-center mb-12"
          style={{ color: '#FFFFFF' }}
        >
          {lang === 'hi' ? 'माइंडमिरर कैसे काम करता है' : 'How MindMirror Works'}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              icon: Zap,
              title: lang === 'hi' ? 'स्वाभाविक रूप से बोलें' : 'Speak Naturally',
              desc: lang === 'hi' ? 'दैनिक संकेतों का उत्तर दें। हमारा ऑन-डिवाइस एआई वास्तविक समय में आपके भाषण पैटर्न का विश्लेषण करता है।' : 'Respond to daily prompts. Our on-device AI analyzes your speech patterns in real-time.',
              color: '#A78BFA',
            },
            {
              step: '02',
              icon: Brain,
              title: lang === 'hi' ? 'बायोमार्कर निकालें' : 'AI Extracts Biomarkers',
              desc: lang === 'hi' ? 'शब्द खोजने की गति, विविधता, जटिलता, अर्थपूर्ण सुसंगतता, और प्रवाह जैसे ५ संज्ञानात्मक बायोमार्कर का मापन।' : '5 linguistic biomarkers measured: word-finding speed, vocabulary diversity, sentence complexity, semantic coherence, and phonemic fluency.',
              color: '#2DD4BF',
            },
            {
              step: '03',
              icon: Shield,
              title: lang === 'hi' ? 'ब्लॉकचेन पर सुरक्षित' : 'Blockchain Secured',
              desc: lang === 'hi' ? 'आपका स्कोर एथेरियम सेपोलिया पर सुरक्षित किया जाता है। केवल आपके पास एनएफटी द्वारा इसे डिक्रिप्ट करने की अनुमति होती है।' : 'Your MindScore™ is hashed and stored on Ethereum Sepolia. Only you hold the decryption key via your Consent NFT.',
              color: '#F59E0B',
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative p-6 rounded-2xl"
              style={{
                background: 'rgba(17, 24, 39, 0.7)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div
                className="font-mono text-4xl font-bold mb-4 opacity-10"
                style={{ color: item.color }}
              >
                {item.step}
              </div>
              <item.icon size={24} style={{ color: item.color }} className="mb-3" />
              <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative border-t py-8 text-center"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <p className="text-sm font-medium" style={{ color: '#475569' }}>
          MindMirror Health Companion · Bharat Academix CodeQuest
        </p>
        <p className="text-xs mt-1" style={{ color: '#334155' }}>
          React + Vite + Ethereum · All data stays entirely secure on your device
        </p>
      </footer>
    </div>
  );
}
