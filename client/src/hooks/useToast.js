import { useCallback } from 'react';
import { useApp } from '../context/AppContext.jsx';

export function useToast() {
  const { addToast, removeToast, toasts } = useApp();

  const success = useCallback((message, detail) => addToast({ type: 'success', message, detail }), [addToast]);
  const error = useCallback((message, detail) => addToast({ type: 'error', message, detail }), [addToast]);
  const info = useCallback((message, detail) => addToast({ type: 'info', message, detail }), [addToast]);
  const warning = useCallback((message, detail) => addToast({ type: 'warning', message, detail }), [addToast]);

  return { success, error, info, warning, toasts, removeToast, addToast };
}

export default useToast;
