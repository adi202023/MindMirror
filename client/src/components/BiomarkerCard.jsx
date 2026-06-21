import React from 'react';
import { motion } from 'framer-motion';

const BIOMARKER_COLORS = {
  wordFindingSpeed: { color: '#A78BFA', glow: 'rgba(167, 139, 250, 0.3)' },
  vocabularyDiversity: { color: '#2DD4BF', glow: 'rgba(45, 212, 191, 0.3)' },
  sentenceComplexity: { color: '#60A5FA', glow: 'rgba(96, 165, 250, 0.3)' },
  semanticCoherence: { color: '#34D399', glow: 'rgba(52, 211, 153, 0.3)' },
  phonemicFluency: { color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.3)' },
};

export default function BiomarkerCard({ icon: Icon, label, description, score, biomarkerKey, delay = 0 }) {
  const colorConfig = BIOMARKER_COLORS[biomarkerKey] || { color: '#A78BFA', glow: 'rgba(167, 139, 250, 0.3)' };

  const getScoreColor = (s) => {
    if (s >= 80) return '#10B981';
    if (s >= 60) return '#F59E0B';
    if (s >= 40) return '#F97316';
    return '#EF4444';
  };

  const scoreColor = getScoreColor(score);

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="p-4 rounded-xl"
      style={{
        background: 'rgba(30, 33, 48, 0.6)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: `${colorConfig.color}18`,
              border: `1px solid ${colorConfig.color}30`,
            }}
          >
            {Icon && <Icon size={15} style={{ color: colorConfig.color }} />}
          </div>
          <div>
            <div className="text-sm font-medium text-white">{label}</div>
            <div className="text-xs" style={{ color: '#64748B' }}>{description}</div>
          </div>
        </div>
        <div
          className="font-mono font-bold text-lg"
          style={{ color: scoreColor }}
        >
          {score}
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="relative h-1.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${colorConfig.color}80, ${colorConfig.color})`,
            boxShadow: `0 0 8px ${colorConfig.glow}`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.0, delay: delay + 0.2, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </motion.div>
  );
}
