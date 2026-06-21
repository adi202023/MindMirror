import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const TOAST_ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const TOAST_COLORS = {
  success: {
    border: 'rgba(16, 185, 129, 0.4)',
    icon: '#10B981',
    bg: 'rgba(16, 185, 129, 0.08)',
    bar: '#10B981',
  },
  error: {
    border: 'rgba(239, 68, 68, 0.4)',
    icon: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.08)',
    bar: '#EF4444',
  },
  info: {
    border: 'rgba(124, 58, 237, 0.4)',
    icon: '#A78BFA',
    bg: 'rgba(124, 58, 237, 0.08)',
    bar: '#7C3AED',
  },
  warning: {
    border: 'rgba(245, 158, 11, 0.4)',
    icon: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.08)',
    bar: '#F59E0B',
  },
};

function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);
  const colors = TOAST_COLORS[toast.type] || TOAST_COLORS.info;
  const Icon = TOAST_ICONS[toast.type] || Info;

  const handleRemove = () => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <motion.div
      layout
      initial={{ x: 120, opacity: 0, scale: 0.9 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 120, opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="relative overflow-hidden rounded-xl"
      style={{
        background: 'rgba(17, 24, 39, 0.95)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${colors.border}`,
        borderLeft: `3px solid ${colors.icon}`,
        minWidth: '300px',
        maxWidth: '400px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-start gap-3 p-4">
        <Icon size={18} style={{ color: colors.icon, flexShrink: 0, marginTop: 1 }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{toast.message}</p>
          {toast.detail && (
            <p className="text-xs mt-0.5 font-mono" style={{ color: '#94A3B8' }}>
              {toast.detail}
            </p>
          )}
        </div>
        <button
          onClick={handleRemove}
          className="text-muted hover:text-white transition-colors cursor-pointer p-0.5"
        >
          <X size={14} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          className="h-full"
          style={{ background: colors.bar }}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 4, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
}

export default function Toast() {
  const { toasts, removeToast } = useApp();

  return (
    <div
      className="fixed top-20 right-4 z-[100] flex flex-col gap-2"
      style={{ pointerEvents: 'none' }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
