import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  push: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const iconMap: Record<ToastKind, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const colorMap: Record<ToastKind, string> = {
  success: 'text-teal-600 bg-teal-50 border-teal-100',
  error: 'text-rose-500 bg-rose-50 border-rose-100',
  info: 'text-accent-600 bg-accent-50 border-accent-100',
};

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-full max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = iconMap[t.kind];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ duration: 0.22 }}
                className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-lift bg-white ${colorMap[t.kind]}`}
                role="status"
              >
                <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="text-sm text-ink-700 flex-1">{t.message}</p>
                <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-ink-300 hover:text-ink-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
