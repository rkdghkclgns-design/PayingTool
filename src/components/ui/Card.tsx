import type { ReactNode } from 'react';

interface CardProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly title?: string;
  readonly subtitle?: string;
  readonly headerAction?: ReactNode;
}

export default function Card({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
}: CardProps) {
  const hasHeader = title || subtitle || headerAction;

  return (
    <div
      className={`
        bg-white rounded-xl shadow-sm border border-gray-200
        dark:bg-gray-900 dark:border-gray-800
        ${className}
      `.trim()}
    >
      {hasHeader && (
        <div className="flex items-start justify-between px-6 pt-6 pb-0">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div className="flex-shrink-0 ml-4">{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
