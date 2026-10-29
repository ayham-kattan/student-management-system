import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Toast from '../components/ui/Toast';

const ToastContext = createContext(null);

// App-wide success messages, so a page can notify and then navigate away
// (e.g. delete on the details page, then show the toast on the list).
export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const dismiss = useCallback(() => setMessage(''), []);
  const value = useMemo(() => ({ notify: setMessage }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast message={message} onClose={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
