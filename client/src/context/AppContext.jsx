import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

const WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

const DEFAULT_ACCESS_LIST = [
  {
    id: 'access-1',
    name: 'Dr. Meera Nair',
    role: 'Neurologist',
    accessType: 'READ',
    grantedDaysAgo: 14,
    grantedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
  },
  {
    id: 'access-2',
    name: 'Priya Sheregar',
    role: 'Family',
    accessType: 'READ',
    grantedDaysAgo: 6,
    grantedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
  },
  {
    id: 'access-3',
    name: 'Stanford Research Group',
    role: 'Research Institution',
    accessType: 'AGGREGATE',
    grantedDaysAgo: 2,
    grantedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
  },
];

export function AppProvider({ children }) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [sessions, setSessions] = useState([]);
  const [mindTokenBalance, setMindTokenBalance] = useState(1240);
  const [accessList, setAccessList] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Load persisted data from localStorage
  useEffect(() => {
    try {
      const savedWallet = localStorage.getItem('mm_wallet');
      if (savedWallet) {
        const parsed = JSON.parse(savedWallet);
        setWalletConnected(parsed.connected || false);
        setWalletAddress(parsed.address || '');
      }

      const savedSessions = localStorage.getItem('mm_sessions');
      if (savedSessions) {
        setSessions(JSON.parse(savedSessions));
      }

      const savedAccessList = localStorage.getItem('mm_access_list');
      if (savedAccessList) {
        setAccessList(JSON.parse(savedAccessList));
      } else {
        setAccessList(DEFAULT_ACCESS_LIST);
        localStorage.setItem('mm_access_list', JSON.stringify(DEFAULT_ACCESS_LIST));
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
      setAccessList(DEFAULT_ACCESS_LIST);
    }
  }, []);

  // Persist sessions
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('mm_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Persist access list
  useEffect(() => {
    localStorage.setItem('mm_access_list', JSON.stringify(accessList));
  }, [accessList]);

  // Persist wallet
  useEffect(() => {
    localStorage.setItem('mm_wallet', JSON.stringify({
      connected: walletConnected,
      address: walletAddress,
    }));
  }, [walletConnected, walletAddress]);

  // Connect wallet (mock)
  const connectWallet = useCallback(async () => {
    await new Promise(r => setTimeout(r, 800));
    setWalletConnected(true);
    setWalletAddress(WALLET_ADDRESS);
    addToast({ type: 'success', message: 'Wallet connected', detail: '0x742d...f44e · Sepolia' });
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setWalletConnected(false);
    setWalletAddress('');
  }, []);

  // Fetch sessions from API
  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (e) {
      console.error('Error fetching sessions:', e);
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  // Add session
  const addSession = useCallback((session) => {
    setSessions(prev => {
      const existingIdx = prev.findIndex(s => s.id === session.id);
      let updated;
      if (existingIdx !== -1) {
        updated = [...prev];
        updated[existingIdx] = session;
      } else {
        updated = [...prev, session];
      }
      localStorage.setItem('mm_sessions', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Grant access
  const grantAccess = useCallback(async (name, role) => {
    const res = await fetch('/api/grant-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role }),
    });
    const data = await res.json();
    if (data.success) {
      const newAccess = {
        id: data.accessId || `access-${Date.now()}`,
        name,
        role,
        accessType: 'READ',
        grantedDaysAgo: 0,
        grantedAt: new Date().toISOString(),
        txHash: data.txHash,
        nftTokenId: data.nftTokenId,
      };
      setAccessList(prev => [...prev, newAccess]);
      addToast({ type: 'success', message: `Access granted to ${name}`, detail: `Tx: ${data.txHash.slice(0, 10)}...` });
    }
    return data;
  }, []);

  // Revoke access
  const revokeAccess = useCallback(async (accessId) => {
    const res = await fetch('/api/revoke-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessId }),
    });
    const data = await res.json();
    if (data.success) {
      setAccessList(prev => prev.filter(a => a.id !== accessId));
      addToast({ type: 'info', message: 'Access revoked · Transaction confirmed', detail: `Tx: ${data.txHash.slice(0, 10)}...` });
    }
    return data;
  }, []);

  // Add MIND tokens
  const addMindTokens = useCallback((amount) => {
    setMindTokenBalance(prev => prev + amount);
  }, []);

  // Toast system
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      walletConnected,
      walletAddress,
      sessions,
      mindTokenBalance,
      accessList,
      toasts,
      isLoadingSessions,
      connectWallet,
      disconnectWallet,
      fetchSessions,
      addSession,
      grantAccess,
      revokeAccess,
      addMindTokens,
      addToast,
      removeToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export default AppContext;
