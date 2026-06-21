import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, Coins, ArrowUpRight, CheckCircle, FlaskConical,
  ChevronRight, Copy, ExternalLink, Shield, Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { useCountUp } from '../hooks/useCountUp.js';

const WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

const getMockEarningHistory = (t) => [
  { date: t('today'), activity: `${t('dailyCheckin')} #28`, mindEarned: 50, status: t('confirmed'), txHash: '0x7f3a...c94e', positive: true },
  { date: t('yesterday'), activity: t('streakBonus7'), mindEarned: 100, status: t('confirmed'), txHash: '0x4b2c...d891', positive: true },
  { date: t('yesterday'), activity: `${t('dailyCheckin')} #27`, mindEarned: 50, status: t('confirmed'), txHash: '0x9e1f...a302', positive: true },
  { date: t('daysAgo2'), activity: `${t('dailyCheckin')} #26`, mindEarned: 50, status: t('confirmed'), txHash: '0x3c7d...f541', positive: true },
  { date: t('daysAgo3'), activity: t('marketplaceReward'), mindEarned: 150, status: t('confirmed'), txHash: '0x8a5e...b293', positive: true },
  { date: t('daysAgo3'), activity: `${t('dailyCheckin')} #25`, mindEarned: 50, status: t('confirmed'), txHash: '0x2f1b...7e84', positive: true },
  { date: t('daysAgo4'), activity: `${t('dailyCheckin')} #24`, mindEarned: 50, status: t('confirmed'), txHash: '0x6d4c...1f29', positive: true },
  { date: t('daysAgo5'), activity: t('milestoneBonus30'), mindEarned: 200, status: t('confirmed'), txHash: '0x5a9e...c473', positive: true },
];

const getResearcherRequests = (t) => [
  {
    id: 'req-1',
    name: t('req1Name'),
    institution: t('req1Inst'),
    seeking: t('req1Seek'),
    offering: 800,
    badge: t('badgeVerified'),
    badgeColor: '#2DD4BF',
  },
  {
    id: 'req-2',
    name: t('req2Name'),
    institution: t('req2Inst'),
    seeking: t('req2Seek'),
    offering: 650,
    badge: t('badgeHealthcare'),
    badgeColor: '#A78BFA',
  },
  {
    id: 'req-3',
    name: t('req3Name'),
    institution: t('req3Inst'),
    seeking: t('req3Seek'),
    offering: 1200,
    badge: t('badgePharma'),
    badgeColor: '#F59E0B',
  },
];

export default function WalletPage() {
  const { mindTokenBalance, addMindTokens, addToast } = useApp();
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [accepting, setAccepting] = useState(null);
  const [accepted, setAccepted] = useState([]);

  const displayBalance = useCountUp(mindTokenBalance, 1000, 0, true);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(WALLET_ADDRESS).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAcceptResearch = async (req) => {
    if (accepted.includes(req.id)) return;
    setAccepting(req.id);
    await new Promise(r => setTimeout(r, 1500));
    addMindTokens(req.offering);
    setAccepted(prev => [...prev, req.id]);
    const fakeTx = '0x' + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '...';
    addToast({
      type: 'success',
      message: `${t('txSubmitted', 'Transaction submitted')} · +${req.offering} MIND`,
      detail: `Tx: ${fakeTx}`,
    });
    setAccepting(null);
  };

  const earningHistory = getMockEarningHistory(t);
  const researcherRequests = getResearcherRequests(t);

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-1">
            <Coins size={18} style={{ color: '#A78BFA' }} />
            <span className="text-sm font-medium" style={{ color: '#A78BFA' }}>MIND Token</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">{t('walletTitle')}</h1>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>
            {t('walletSubtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Wallet Card + History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wallet Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative overflow-hidden p-6 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(17, 24, 39, 0.9) 100%)',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                boxShadow: '0 0 40px rgba(124, 58, 237, 0.15)',
              }}
            >
              {/* Background glow */}
              <div
                className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                  transform: 'translate(30%, -30%)',
                }}
              />

              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(124, 58, 237, 0.2)', border: '1px solid rgba(124, 58, 237, 0.3)' }}
                    >
                      <Wallet size={16} style={{ color: '#A78BFA' }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#A78BFA' }}>{t('ethereumSepolia')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs" style={{ color: '#10B981' }}>{t('connected')}</span>
                  </div>
                </div>

                {/* Address */}
                <div className="mb-6">
                  <div className="text-xs mb-1.5" style={{ color: '#64748B' }}>{t('walletAddress')}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-white break-all">{WALLET_ADDRESS}</span>
                    <button
                      onClick={handleCopyAddress}
                      className="shrink-0 p-1.5 rounded-lg transition-all cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: copied ? '#10B981' : '#94A3B8' }}
                    >
                      {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Balances */}
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="text-xs mb-2" style={{ color: '#94A3B8' }}>{t('ethBalance')}</div>
                    <div className="font-mono text-2xl font-bold text-white">0.0847</div>
                    <div className="text-xs mt-1" style={{ color: '#64748B' }}>ETH</div>
                  </div>
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: 'rgba(124, 58, 237, 0.08)',
                      border: '1px solid rgba(124, 58, 237, 0.2)',
                    }}
                  >
                    <div className="text-xs mb-2" style={{ color: '#A78BFA' }}>{t('mindBalance')}</div>
                    <div
                      className="font-mono text-2xl font-bold"
                      style={{ color: '#A78BFA' }}
                    >
                      {displayBalance.toLocaleString()}
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#7C3AED' }}>MIND</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Token Earning History */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 rounded-2xl"
              style={{
                background: 'rgba(17, 24, 39, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <h2 className="text-base font-semibold text-white mb-4">{t('earningHistory')}</h2>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-left">{t('date', 'Date')}</th>
                      <th className="text-left">{t('activity')}</th>
                      <th className="text-right">{t('mindEarned')}</th>
                      <th className="text-left">{t('status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earningHistory.map((row, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.04 }}
                      >
                        <td className="text-xs" style={{ color: '#94A3B8' }}>{row.date}</td>
                        <td className="text-sm text-white">{row.activity}</td>
                        <td className="text-right">
                          <span
                            className="font-mono font-bold text-sm"
                            style={{ color: '#10B981' }}
                          >
                            +{row.mindEarned}
                          </span>
                          <span className="text-xs ml-1" style={{ color: '#64748B' }}>MIND</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle size={12} style={{ color: '#10B981' }} />
                            <span className="text-xs" style={{ color: '#10B981' }}>{row.status}</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Right: Researcher Marketplace */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="p-6 rounded-2xl"
              style={{
                background: 'rgba(17, 24, 39, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <FlaskConical size={16} style={{ color: '#2DD4BF' }} />
                <h2 className="text-base font-semibold text-white">{t('researchMarketplace')}</h2>
              </div>
              <p className="text-xs mb-5" style={{ color: '#64748B' }}>
                {t('researchMarketplaceDesc')}
              </p>

              {/* Privacy Notice */}
              <div
                className="p-3 rounded-xl mb-5 flex items-start gap-2"
                style={{
                  background: 'rgba(13, 148, 136, 0.06)',
                  border: '1px solid rgba(13, 148, 136, 0.15)',
                }}
              >
                <Shield size={14} style={{ color: '#2DD4BF', flexShrink: 0, marginTop: 1 }} />
                <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>
                  {t('privacyNotice')}
                </p>
              </div>

              <div className="space-y-4">
                {researcherRequests.map((req, i) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="p-4 rounded-xl"
                    style={{
                      background: 'rgba(30, 33, 48, 0.6)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm font-semibold text-white">{req.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#64748B' }}>{req.institution}</div>
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          color: req.badgeColor,
                          background: `${req.badgeColor}15`,
                          border: `1px solid ${req.badgeColor}25`,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {req.badge}
                      </span>
                    </div>

                    <div className="text-xs mb-3 leading-relaxed" style={{ color: '#94A3B8' }}>
                      <strong style={{ color: '#64748B' }}>{t('seeking', 'Seeking')}:</strong> {req.seeking}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs" style={{ color: '#94A3B8' }}>{t('offering')}</div>
                        <div className="font-mono font-bold text-lg" style={{ color: '#A78BFA' }}>
                          {req.offering.toLocaleString()}
                          <span className="text-xs font-normal ml-1" style={{ color: '#7C3AED' }}>MIND</span>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: accepted.includes(req.id) ? 1 : 1.02 }}
                        whileTap={{ scale: accepted.includes(req.id) ? 1 : 0.98 }}
                        onClick={() => handleAcceptResearch(req)}
                        disabled={accepted.includes(req.id) || accepting === req.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                        style={{
                          background: accepted.includes(req.id)
                            ? 'rgba(16, 185, 129, 0.15)'
                            : accepting === req.id
                            ? 'rgba(124, 58, 237, 0.3)'
                            : 'linear-gradient(135deg, #7C3AED, #5B21B6)',
                          color: accepted.includes(req.id) ? '#10B981' : 'white',
                          border: accepted.includes(req.id)
                            ? '1px solid rgba(16, 185, 129, 0.25)'
                            : 'none',
                          boxShadow: accepted.includes(req.id) || accepting === req.id
                            ? 'none'
                            : '0 0 12px rgba(124, 58, 237, 0.3)',
                          transition: 'all 200ms',
                        }}
                      >
                        {accepted.includes(req.id) ? (
                          <>
                            <CheckCircle size={12} />
                            {t('accepted')}
                          </>
                        ) : accepting === req.id ? (
                          t('processing')
                        ) : (
                          <>
                            <Zap size={12} />
                            {t('acceptEarn')}
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="p-5 rounded-2xl"
              style={{
                background: 'rgba(17, 24, 39, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <h3 className="text-sm font-semibold text-white mb-4">{t('tokenStats')}</h3>
              <div className="space-y-3">
                {[
                  { label: t('totalEarned'), value: '1,240 MIND', color: '#A78BFA' },
                  { label: t('thisMonth'), value: '340 MIND', color: '#2DD4BF' },
                  { label: t('checkinRate'), value: `28 ${t('sessions', 'sessions')}`, color: '#10B981' },
                  { label: t('nftNum'), value: '#4821', color: '#F59E0B' },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: '#64748B' }}>{stat.label}</span>
                    <span className="font-mono text-sm font-semibold" style={{ color: stat.color }}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
