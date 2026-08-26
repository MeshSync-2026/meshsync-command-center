// Toast notification context
import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);


  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, tone = "info", duration = 3500) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, tone }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const toastSuccess = useCallback(
    (msg, dur) => toast(msg, "success", dur),
    [toast]
  );
  const toastWarn = useCallback((msg, dur) => toast(msg, "warn", dur), [toast]);
  const toastDanger = useCallback(
    (msg, dur) => toast(msg, "danger", dur),
    [toast]
  );
  const toastInfo = useCallback((msg, dur) => toast(msg, "info", dur), [toast]);

  const value = {
    toast,
    toastSuccess,
    toastWarn,
    toastDanger,
    toastError: toastDanger,
    toastInfo,
    dismiss,
    toasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

const TONE_STYLES = {
  success: "border-ok-500/40 bg-ok-500/10 text-ok-500",
  warn: "border-warn-500/40 bg-warn-500/10 text-warn-500",
  danger: "border-danger-600/40 bg-danger-600/10 text-danger-600",
  info: "border-brand-500/40 bg-brand-50 text-brand-600",
};


const TONE_ICONS = {
  success: "M5 13l4 4L19 7",
  warn: "M12 9v2m0 4h.01M5 19h14a2 2 0 001.732-3l-7-12a2 2 0 00-3.464 0l-7 12A2 2 0 005 19z",
  danger: "M6 18L18 6M6 6l12 12",
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

function ToastContainer({ toasts, dismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-elevated animate-slide-in ${
            TONE_STYLES[t.tone] || TONE_STYLES.info
          }`}
        >
          <svg
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={TONE_ICONS[t.tone] || TONE_ICONS.info}
            />
          </svg>
          <span className="text-sm flex-1">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="text-gray-500 hover:text-gray-900 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
