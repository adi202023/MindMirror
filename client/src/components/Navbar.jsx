import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Menu, X, Wallet, Globe, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

const navLinks = [
  { to: '/', labelKey: 'home', exact: true },
  { to: '/checkin', labelKey: 'checkin' },
  { to: '/dashboard', labelKey: 'dashboard' },
  { to: '/wallet', labelKey: 'wallet' },
];

const LANGUAGE_LABELS = {
  en: 'English',
  hi: 'हिन्दी',
  es: 'Español',
  fr: 'Français',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
};

export default function Navbar() {
  const { walletConnected, walletAddress, connectWallet } = useApp();
  const { lang, setLang, t, languages } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConnect = async () => {
    if (walletConnected) return;
    setConnecting(true);
    await connectWallet();
    setConnecting(false);
  };

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '';

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: scrolled
            ? 'rgba(10, 14, 26, 0.92)'
            : 'rgba(10, 14, 26, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled
            ? '1px solid rgba(255,255,255,0.06)'
            : '1px solid transparent',
          transition: 'all 300ms ease',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED, #0D9488)',
                    boxShadow: '0 0 16px rgba(124, 58, 237, 0.4)',
                  }}
                >
                  <Brain size={16} className="text-white" />
                </div>
              </div>
              <span
                className="text-lg font-bold tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #A78BFA, #2DD4BF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                MindMirror
              </span>
            </NavLink>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, labelKey, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                      isActive
                        ? 'text-purple-light bg-purple-900/20'
                        : 'text-muted hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {t(labelKey)}
                      {isActive && (
                        <motion.div
                          layoutId="navIndicator"
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                          style={{ background: 'linear-gradient(90deg, #7C3AED, #A78BFA)' }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Language & Wallet Button Area */}
            <div className="hidden md:flex items-center gap-4">
              {/* Language Selector */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-muted hover:text-white transition-all cursor-pointer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Globe size={14} className="text-purple-light" />
                  <span>{LANGUAGE_LABELS[lang]}</span>
                  <ChevronDown size={12} className={`transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {langDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-40 rounded-xl overflow-hidden shadow-2xl z-50 py-1"
                      style={{
                        background: 'rgba(17, 24, 39, 0.98)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      {languages.map((l) => (
                        <button
                          key={l}
                          onClick={() => {
                            setLang(l);
                            setLangDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-muted hover:text-white hover:bg-purple-900/20 transition-all block cursor-pointer"
                          style={{
                            color: lang === l ? '#A78BFA' : '',
                            background: lang === l ? 'rgba(124, 58, 237, 0.08)' : '',
                          }}
                        >
                          {LANGUAGE_LABELS[l]}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Wallet */}
              {walletConnected ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    color: '#10B981',
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-xs">{shortAddress}</span>
                  <span
                    className="px-2 py-0.5 rounded-md text-xs"
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10B981',
                      fontSize: '10px',
                    }}
                  >
                    Sepolia
                  </span>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConnect}
                  disabled={connecting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer"
                  style={{
                    background: connecting
                      ? 'rgba(124, 58, 237, 0.5)'
                      : 'linear-gradient(135deg, #7C3AED, #5B21B6)',
                    boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)',
                    border: 'none',
                  }}
                >
                  <Wallet size={14} />
                  {connecting ? 'Connecting...' : t('connectWallet')}
                </motion.button>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-muted hover:text-white transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed top-16 left-0 right-0 z-40 overflow-hidden"
            style={{
              background: 'rgba(10, 14, 26, 0.97)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(({ to, labelKey, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'text-purple-light bg-purple-900/20'
                        : 'text-muted hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {t(labelKey)}
                </NavLink>
              ))}

              {/* Mobile Language Selector */}
              <div className="py-2 border-t border-b border-white/5 my-2">
                <div className="text-xs text-muted mb-2 flex items-center gap-1.5 px-4">
                  <Globe size={12} />
                  <span>{t('selectLanguage')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 px-2">
                  {languages.map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setLang(l);
                        setMobileOpen(false);
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-center cursor-pointer transition-all border"
                      style={{
                        background: lang === l ? 'rgba(124, 58, 237, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        borderColor: lang === l ? '#7C3AED' : 'rgba(255,255,255,0.05)',
                        color: lang === l ? '#A78BFA' : '#94A3B8',
                      }}
                    >
                      {LANGUAGE_LABELS[l]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                {walletConnected ? (
                  <div
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      color: '#10B981',
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-xs">{shortAddress}</span>
                    <span className="ml-auto text-xs opacity-70">Sepolia</span>
                  </div>
                ) : (
                  <button
                    onClick={() => { handleConnect(); setMobileOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}
                  >
                    <Wallet size={14} />
                    {t('connectWallet')}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
