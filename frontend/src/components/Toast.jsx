// components/Toast.jsx
// Lightweight toast notification component.
// Usage: <Toast message="Done!" type="success" onClose={() => setToast(null)} />

import { useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon } from './Icons';

const ICONS = {
  success: <CheckCircleIcon className="w-5 h-5 text-emerald-400" />,
  error: <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />,
  warning: <ExclamationTriangleIcon className="w-5 h-5 text-amber-400" />,
};

const COLORS = {
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  error:   'border-red-500/40 bg-red-500/10 text-red-300',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
};

const Toast = ({ message, type = 'success', onClose, duration = 3500 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 
                  rounded-xl border shadow-xl shadow-black/30
                  animate-[slideIn_0.25s_ease-out]
                  ${COLORS[type]}`}
      style={{ minWidth: '260px', maxWidth: '420px' }}
    >
      {ICONS[type]}
      <span className="text-sm font-medium flex-1">{message}</span>
      <button
        onClick={onClose}
        className="text-current opacity-60 hover:opacity-100 transition-opacity ml-2 text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
      {/* Auto-progress bar */}
      <span
        className="absolute bottom-0 left-0 h-0.5 rounded-b-xl bg-current opacity-30"
        style={{ animation: `shrink ${duration}ms linear forwards`, width: '100%' }}
      />
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Toast;
