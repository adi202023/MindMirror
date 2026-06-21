import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, TrendingDown, TrendingUp, Flame, Activity, Brain,
  ChevronRight, ExternalLink, Plus, X, CheckCircle, Shield, Key
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ReferenceLine, Area, AreaChart
} from 'recharts';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import { useCountUp } from '../hooks/useCountUp.js';

// Generate 28 data points for the chart
function generateChartData() {
  const data = [];
  const now = new Date();
  let score = 84;
  for (let i = 28; i >= 1; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    score = score - (Math.random() * 0.6) + (Math.random() * 0.2);
    score = Math.max(65, Math.min(90, score + (Math.sin(i * 0.5) * 1.5)));
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: parseFloat(score.toFixed(1)),
      fullDate: date.toISOString(),
    });
  }
  return data;
}

const CHART_DATA = generateChartData();

function getScoreColor(score) {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#F59E0B';
  if (score >= 40) return '#F97316';
  return '#EF4444';
}

function ScoreBadge({ score }) {
  const color = getScoreColor(score);
  return (
    <span
      className="font-mono font-semibold text-sm px-2 py-0.5 rounded-md"
      style={{ color, background: `${color}18`, border: `1px solid ${color}25` }}
    >
      {score}
    </span>
  );
}

function StatCard({ label, value, suffix, icon: Icon, trend, color, delay }) {
  const numVal = typeof value === 'number' ? value : parseFloat(value) || 0;
  const displayVal = useCountUp(numVal, 1200, Number.isInteger(numVal) ? 0 : 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="p-6 rounded-2xl"
      style={{
        background: 'rgba(17, 24, 39, 0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>
          {label}
        </span>
        {Icon && <Icon size={16} style={{ color }} />}
      </div>
      <div className="font-mono text-3xl font-bold text-white mb-1">
        {typeof value === 'string' && !parseFloat(value) ? value : `${displayVal.toLocaleString()}${suffix || ''}`}
      </div>
      {trend && (
        <div
          className="flex items-center gap-1 text-xs font-semibold"
          style={{ color: trend.startsWith('-') ? '#EF4444' : '#10B981' }}
        >
          {trend.startsWith('-') ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
          {trend}
        </div>
      )}
    </motion.div>
  );
}

// Custom tooltip for recharts
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const score = payload[0]?.value;
  const color = getScoreColor(score);
  return (
    <div
      className="px-3 py-2 rounded-xl text-sm"
      style={{
        background: 'rgba(17, 24, 39, 0.97)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="text-xs mb-1" style={{ color: '#94A3B8' }}>{label}</div>
      <div className="font-mono font-bold" style={{ color }}>
        {score} <span style={{ color: '#94A3B8', fontWeight: 400 }}>MindScore™</span>
      </div>
    </div>
  );
}

// Mock session history for table
function generateSessionHistory(lang) {
  const sessions = [];
  const now = new Date();
  let prevScore = 84;
  for (let i = 10; i >= 1; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const score = parseFloat((prevScore + (Math.random() - 0.6) * 3).toFixed(1));
    const trend = parseFloat((score - prevScore).toFixed(1));
    prevScore = score;
    const localeMonth = date.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric' });
    sessions.push({
      id: i,
      date: localeMonth,
      duration: `${Math.floor(45 + Math.random() * 75)}s`,
      mindScore: Math.max(60, Math.min(90, score)),
      trend,
      txHash: '0x' + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '...',
    });
  }
  return sessions.reverse();
}

// Blockchain activity feed
const BLOCKCHAIN_ACTIVITY = [
  { time: '2 hours ago', sessionNum: 28, score: 71.4, txHash: '0x7f3a...c94e', status: 'confirmed' },
  { time: 'Yesterday', sessionNum: 27, score: 73.1, txHash: '0x4b2c...d891', status: 'confirmed' },
  { time: '2 days ago', sessionNum: 26, score: 72.8, txHash: '0x9e1f...a302', status: 'confirmed' },
  { time: '3 days ago', sessionNum: 25, score: 74.2, txHash: '0x3c7d...f541', status: 'confirmed' },
  { time: '4 days ago', sessionNum: 24, score: 75.0, txHash: '0x8a5e...b293', status: 'confirmed' },
];

// Grant Access Modal
function GrantAccessModal({ onClose, onGrant }) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;
    setLoading(true);
    await onGrant(name, role);
    setLoading(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-md p-6 rounded-2xl"
        style={{
          background: 'rgba(17, 24, 39, 0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">{t('grantNewAccess')}</h3>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
              Create a Consent NFT for this recipient
            </p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white transition-colors cursor-pointer p-1 border-none bg-transparent">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#94A3B8' }}>
              {t('entityName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Dr. Ramesh Kumar"
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontFamily: 'Inter, sans-serif',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(124, 58, 237, 0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#94A3B8' }}>
              {t('entityRole')}
            </label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="e.g. Neurologist, Family, Researcher"
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontFamily: 'Inter, sans-serif',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(124, 58, 237, 0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name || !role}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm cursor-pointer mt-2 border-none"
            style={{
              background: loading || (!name || !role)
                ? 'rgba(124, 58, 237, 0.4)'
                : 'linear-gradient(135deg, #7C3AED, #5B21B6)',
              boxShadow: loading ? 'none' : '0 0 20px rgba(124, 58, 237, 0.3)',
              transition: 'all 200ms',
            }}
          >
            <Key size={14} />
            {loading ? 'Minting NFT...' : t('grantAccess')}
          </button>
        </form>

        <p className="text-xs text-center mt-4" style={{ color: '#475569' }}>
          An ERC-721 Consent NFT will be minted on Ethereum Sepolia
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { sessions, accessList, fetchSessions, grantAccess, revokeAccess } = useApp();
  const { t, lang } = useI18n();
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [revoking, setRevoking] = useState(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchSessions();
      setIsLoading(false);
    };
    load();
  }, [fetchSessions]);

  const handleRevoke = async (accessId) => {
    setRevoking(accessId);
    await revokeAccess(accessId);
    setRevoking(null);
  };

  const handleGrant = async (name, role) => {
    await grantAccess(name, role);
  };

  const walletShort = '0x742d...35Cb';
  const totalSessions = sessions.length || 28;
  const currentScore = sessions.length > 0 ? sessions[sessions.length - 1].mindScore : 71.4;
  
  // Calculate average change or trend
  const trendVal = sessions.length > 1 
    ? (sessions[sessions.length - 1].mindScore - sessions[0].mindScore).toFixed(1)
    : '-0.2';
  const trend30Day = trendVal >= 0 ? `+${trendVal}%` : `${trendVal}%`;
  
  const streak = 12;

  // Radar chart localized data
  const radarData = [
    { subject: t('wordFindingSpeed'), score: 74, fullMark: 100 },
    { subject: t('vocabularyDiversity'), score: 68, fullMark: 100 },
    { subject: t('sentenceComplexity'), score: 71, fullMark: 100 },
    { subject: t('semanticCoherence'), score: 76, fullMark: 100 },
    { subject: t('phonemicFluency'), score: 69, fullMark: 100 },
  ];

  const sessionHistory = generateSessionHistory(lang);

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard size={18} style={{ color: '#A78BFA' }} />
              <span className="text-sm font-semibold uppercase tracking-wider text-purple-light">{t('dashboard')}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{t('cognitiveInsightsTitle')}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
              style={{
                background: 'rgba(17, 24, 39, 0.8)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs text-white">{walletShort}</span>
              <span
                className="px-2 py-0.5 rounded text-xs font-bold"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', fontSize: '10px' }}
              >
                Sepolia
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Sessions" value={totalSessions} icon={Activity} color="#A78BFA" delay={0} />
          <StatCard label={t('overallMindscore')} value={currentScore} icon={Brain} color="#2DD4BF" delay={0.05} />
          <StatCard label={t('trend30Day')} value={trend30Day} trend={trend30Day} icon={TrendingUp} color="#EF4444" delay={0.1} />
          <StatCard label="Streak" value={streak} suffix=" days 🔥" icon={Flame} color="#F59E0B" delay={0.15} />
        </div>

        {/* Main Chart */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-6 rounded-2xl mb-6"
          style={{
            background: 'rgba(17, 24, 39, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">{t('cognitiveScoreTrend')}</h2>
              <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{totalSessions} sessions · {t('last30Days')}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 rounded" style={{ background: '#7C3AED' }} />
                <span className="text-xs" style={{ color: '#94A3B8' }}>Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 rounded border border-dashed" style={{ borderColor: '#F59E0B' }} />
                <span className="text-xs" style={{ color: '#94A3B8' }}>Alert Threshold</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="h-60 skeleton rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={CHART_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#4B5563', fontSize: 11, fontFamily: 'Inter' }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                  tickLine={false}
                  interval={3}
                />
                <YAxis
                  domain={[60, 90]}
                  tick={{ fill: '#4B5563', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={70}
                  stroke="#F59E0B"
                  strokeDasharray="6 3"
                  strokeWidth={1.5}
                  label={{ value: 'Alert Threshold', position: 'right', fill: '#F59E0B', fontSize: 10, fontFamily: 'Inter' }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#7C3AED"
                  strokeWidth={2.5}
                  fill="url(#scoreGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#A78BFA', strokeWidth: 0 }}
                  isAnimationActive={true}
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Below Chart: Radar + Session History */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2 p-6 rounded-2xl"
            style={{
              background: 'rgba(17, 24, 39, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <h2 className="text-base font-semibold text-white mb-4">{t('biomarkersBreakdown')}</h2>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'Inter' }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#7C3AED"
                  fill="#7C3AED"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  isAnimationActive={true}
                  animationDuration={800}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Session History Table */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="lg:col-span-3 p-6 rounded-2xl"
            style={{
              background: 'rgba(17, 24, 39, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <h2 className="text-base font-semibold text-white mb-4">{t('blockchainRecordsTitle')}</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="text-left">{lang === 'hi' ? 'तिथि' : 'Date'}</th>
                    <th className="text-left">{lang === 'hi' ? 'अवधि' : 'Duration'}</th>
                    <th className="text-left">MindScore™</th>
                    <th className="text-left">{lang === 'hi' ? 'रुझान' : 'Trend'}</th>
                    <th className="text-left">Tx Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <SkeletonLoader key={i} type="table-row" rows={5} />
                    ))
                  ) : (
                    sessionHistory.map(session => (
                      <tr key={session.id}>
                        <td className="text-sm font-semibold">{session.date}</td>
                        <td className="font-mono text-xs" style={{ color: '#94A3B8' }}>{session.duration}</td>
                        <td><ScoreBadge score={session.mindScore.toFixed(1)} /></td>
                        <td>
                          <span
                            className="flex items-center gap-1 text-xs font-semibold"
                            style={{ color: session.trend >= 0 ? '#10B981' : '#EF4444' }}
                          >
                            {session.trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {session.trend >= 0 ? '+' : ''}{session.trend.toFixed(1)}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono text-xs" style={{ color: '#A78BFA' }}>
                            {session.txHash}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Blockchain Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="p-6 rounded-2xl mb-6"
          style={{
            background: 'rgba(17, 24, 39, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <h2 className="text-base font-semibold text-white mb-5">{t('blockchainRecord')}</h2>
          <div className="space-y-4">
            {BLOCKCHAIN_ACTIVITY.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.06 }}
                className="flex items-center gap-4"
              >
                <div className="relative flex flex-col items-center">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: '#10B981', boxShadow: '0 0 8px rgba(16,185,129,0.6)' }}
                  />
                  {i < BLOCKCHAIN_ACTIVITY.length - 1 && (
                    <div className="w-px h-6 mt-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  )}
                </div>
                <div className="flex-1 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-sm text-white font-medium">
                      Session #{activity.sessionNum} recorded
                    </span>
                    <span className="text-xs ml-2 text-muted font-semibold">{activity.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ScoreBadge score={activity.score} />
                    <span className="font-mono text-xs text-purple-light">{activity.txHash}</span>
                    <CheckCircle size={14} style={{ color: '#10B981' }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Consent & Access Control */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="p-6 rounded-2xl"
          style={{
            background: 'rgba(17, 24, 39, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(124, 58, 237, 0.15)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Key size={16} style={{ color: '#F59E0B' }} />
                <h2 className="text-base font-semibold text-white">{t('authorizedEntities')}</h2>
              </div>
              <p className="text-xs font-semibold text-muted">
                {t('authorizedDesc')}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowGrantModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer border-none"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
                boxShadow: '0 0 16px rgba(124, 58, 237, 0.3)',
              }}
            >
              <Plus size={14} />
              {t('grantNewAccess')}
            </motion.button>
          </div>

          {accessList.length === 0 ? (
            <div className="text-center py-8">
              <Shield size={32} style={{ color: '#374151' }} className="mx-auto mb-2" />
              <p className="text-sm text-muted">No access granted yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accessList.map(access => (
                <motion.div
                  key={access.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{
                    background: 'rgba(30, 33, 48, 0.6)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        background: 'rgba(124, 58, 237, 0.15)',
                        color: '#A78BFA',
                      }}
                    >
                      {access.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{access.name}</div>
                      <div className="text-xs font-semibold text-muted">
                        {t(`role${access.role}`) || access.role} · Granted {access.grantedDaysAgo === 0 ? 'just now' : `${access.grantedDaysAgo} days ago`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className="px-2 py-1 rounded-lg text-xs font-semibold"
                      style={{
                        background: access.accessType === 'READ'
                          ? 'rgba(13, 148, 136, 0.12)'
                          : 'rgba(245, 158, 11, 0.12)',
                        color: access.accessType === 'READ' ? '#2DD4BF' : '#F59E0B',
                        border: access.accessType === 'READ'
                          ? '1px solid rgba(13, 148, 136, 0.2)'
                          : '1px solid rgba(245, 158, 11, 0.2)',
                      }}
                    >
                      {access.accessType}
                    </span>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRevoke(access.id)}
                      disabled={revoking === access.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#EF4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        opacity: revoking === access.id ? 0.5 : 1,
                      }}
                    >
                      {revoking === access.id ? 'Revoking...' : t('revokeAccess')}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Grant Modal */}
      <AnimatePresence>
        {showGrantModal && (
          <GrantAccessModal
            onClose={() => setShowGrantModal(false)}
            onGrant={handleGrant}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
