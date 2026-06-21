import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider } from './context/AppContext.jsx';
import { I18nProvider } from './context/I18nContext.jsx';
import Navbar from './components/Navbar.jsx';
import Background from './components/Background.jsx';
import Toast from './components/Toast.jsx';
import Home from './pages/Home.jsx';
import CheckIn from './pages/CheckIn.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Wallet from './pages/Wallet.jsx';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1],
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        style={{ width: '100%', minHeight: '100vh' }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wallet" element={<Wallet />} />
          {/* Fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function AppInner() {
  return (
    <div className="relative min-h-screen" style={{ background: '#0A0E1A' }}>
      {/* Animated Background */}
      <Background />

      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <div className="relative" style={{ zIndex: 1 }}>
        <AnimatedRoutes />
      </div>

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <AppProvider>
          <AppInner />
        </AppProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}
