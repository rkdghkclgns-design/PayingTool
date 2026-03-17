import type { ReactNode } from 'react';
import PageExportWrapper from './PageExportWrapper';

interface PageContainerProps {
  readonly children: ReactNode;
  readonly title?: string;
  readonly description?: string;
  readonly className?: string;
  readonly exportId?: string;
  readonly exportName?: string;
}

export default function PageContainer({
  children,
  title,
  description,
  className = '',
  exportId,
  exportName,
}: PageContainerProps) {
  const content = (
    <div className={`max-w-7xl mx-auto px-4 py-6 lg:px-6 lg:py-8 ${className}`}>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );

  if (exportId && exportName) {
    return (
      <PageExportWrapper pageId={exportId} pageName={exportName}>
        {content}
      </PageExportWrapper>
    );
  }

  return content;
}
