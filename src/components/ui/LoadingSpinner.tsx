type SpinnerSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
  readonly size?: SpinnerSize;
  readonly className?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
};

export default function LoadingSpinner({
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`} role="status">
      <div
        className={`
          ${sizeStyles[size]}
          rounded-full animate-spin
          border-gray-300 border-t-brand-500
          dark:border-gray-700 dark:border-t-brand-400
        `.trim()}
      />
      <span className="sr-only">로딩 중...</span>
    </div>
  );
}
