import React, { useEffect } from 'react';

// Light theme specific icons
const CheckCircleIcon = (props) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationTriangleIcon = (props) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const ICONS = {
  success: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
  error: <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />,
  warning: <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />,
};

const COLORS = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error:   'border-red-200 bg-red-50 text-red-800',
  warning: 'border-orange-200 bg-orange-50 text-orange-800',
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
                  rounded-xl border shadow-lg
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
      <span
        className="absolute bottom-0 left-0 h-0.5 rounded-b-xl bg-current opacity-20"
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
