import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const TOAST_STYLES = {
  success: { icon: CheckCircle2, className: 'text-success' },
  error: { icon: AlertCircle, className: 'text-danger' },
  info: { icon: Info, className: 'text-primary' },
};

export default function NotificationToast({ toast, onClose }) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const style = TOAST_STYLES[toast?.type] || TOAST_STYLES.info;
  const Icon = style.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:justify-end sm:p-6"
    >
      {toast && (
        <div
          key={toast.id}
          className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-lg shadow-black/10 animate-toast-in"
        >
          <Icon className={`mt-0.5 size-5 shrink-0 ${style.className}`} />
          <p className="flex-1 text-sm font-medium text-foreground break-words">{toast.message}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss notification"
            className="icon-btn -my-1.5 -mr-1.5 size-8"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
