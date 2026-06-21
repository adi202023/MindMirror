import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

function getScoreColor(score) {
  if (score >= 80) return { stroke: '#10B981', text: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' };
  if (score >= 60) return { stroke: '#F59E0B', text: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)' };
  if (score >= 40) return { stroke: '#F97316', text: '#F97316', glow: 'rgba(249, 115, 22, 0.4)' };
  return { stroke: '#EF4444', text: '#EF4444', glow: 'rgba(239, 68, 68, 0.4)' };
}

function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Attention';
}

export default function MindScoreGauge({ score = 0, size = 200, animate = true }) {
  const [displayScore, setDisplayScore] = useState(0);
  const frameRef = useRef(null);
  const startRef = useRef(null);

  const RADIUS = (size / 2) - 16;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  // Arc goes from 210deg to 330deg (270deg sweep)
  const SWEEP = 270;
  const ARC_LENGTH = (SWEEP / 360) * CIRCUMFERENCE;

  const colors = getScoreColor(score);

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score);
      return;
    }

    const duration = 1200;
    const startVal = 0;

    const animateCount = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(parseFloat((startVal + (score - startVal) * eased).toFixed(1)));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animateCount);
      }
    };

    frameRef.current = requestAnimationFrame(animateCount);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      startRef.current = null;
    };
  }, [score, animate]);

  const percent = Math.max(0, Math.min(score / 100, 1));
  const offset = ARC_LENGTH - percent * ARC_LENGTH;

  const cx = size / 2;
  const cy = size / 2;

  // Start angle: 135deg (bottom-left), end: 45deg (bottom-right) going clockwise
  const startAngle = 135 * (Math.PI / 180);
  const startX = cx + RADIUS * Math.cos(startAngle);
  const startY = cy + RADIUS * Math.sin(startAngle);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible">
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={10}
            strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE - ARC_LENGTH}`}
            strokeDashoffset={-(CIRCUMFERENCE - ARC_LENGTH) / 4}
            strokeLinecap="round"
            style={{ transform: `rotate(135deg)`, transformOrigin: `${cx}px ${cy}px` }}
          />

          {/* Glow filter */}
          <defs>
            <filter id="gaugeGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor={colors.stroke} />
            </linearGradient>
          </defs>

          {/* Animated arc */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={RADIUS}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE - ARC_LENGTH}`}
            strokeDashoffset={ARC_LENGTH - ARC_LENGTH * 0}
            style={{ transform: `rotate(135deg)`, transformOrigin: `${cx}px ${cy}px` }}
            filter="url(#gaugeGlow)"
            initial={{ strokeDashoffset: ARC_LENGTH }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          />
        </svg>

        {/* Center content */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ top: 0 }}
        >
          <div
            className="font-mono font-bold"
            style={{
              fontSize: size * 0.2,
              color: colors.text,
              textShadow: `0 0 20px ${colors.glow}`,
              lineHeight: 1,
            }}
          >
            {displayScore.toFixed(1)}
          </div>
          <div className="text-xs mt-1" style={{ color: '#94A3B8' }}>MindScore™</div>
        </div>
      </div>

      <div
        className="text-sm font-semibold px-3 py-1 rounded-full"
        style={{
          color: colors.text,
          background: `${colors.glow.replace('0.4', '0.12')}`,
          border: `1px solid ${colors.glow.replace('0.4', '0.3')}`,
        }}
      >
        {getScoreLabel(score)}
      </div>
    </div>
  );
}
