import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const ICONS = {
  success: <CheckCircle size={20} className="text-green-500" />,
  error:   <XCircle    size={20} className="text-red-500"   />,
  warning: <AlertCircle size={20} className="text-yellow-500" />,
  info:    <Info       size={20} className="text-blue-500"  />,
};

const BG = {
  success: 'border-green-200  bg-green-50',
  error:   'border-red-200    bg-red-50',
  warning: 'border-yellow-200 bg-yellow-50',
  info:    'border-blue-200   bg-blue-50',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-sm pointer-events-auto
              animate-slide-in ${BG[toast.type]}`}
          >
            <span className="mt-0.5 shrink-0">{ICONS[toast.type]}</span>
            <p className="text-sm font-semibold text-slate-800 flex-1 leading-snug">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-slate-400 hover:text-slate-700 transition-colors mt-0.5"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
