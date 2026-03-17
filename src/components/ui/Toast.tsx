import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  readonly message: string;
  readonly type: ToastType;
  readonly onClose: () => void;
  readonly duration?: number;
}

const typeConfig: Record<ToastType, { icon: typeof CheckCircle; styles: string }> = {
  success: {
    icon: CheckCircle,
    styles:
      'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200',
  },
  error: {
    icon: AlertCircle,
    styles:
      'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200',
  },
  info: {
    icon: Info,
    styles:
      'bg-brand-50 border-brand-200 text-brand-800 dark:bg-brand-950 dark:border-brand-800 dark:text-brand-200',
  },
};

export default function Toast({
  message,
  type,
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-[60] flex items-center gap-3
        px-4 py-3 rounded-lg border shadow-lg
        animate-in slide-in-from-right-full
        ${config.styles}
      `.trim()}
      role="alert"
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="닫기"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
