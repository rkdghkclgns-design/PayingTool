import type { ReactNode } from 'react';
import ExportButtons from '../ui/ExportButtons';

interface PageExportWrapperProps {
  readonly pageId: string;
  readonly pageName: string;
  readonly children: ReactNode;
}

export default function PageExportWrapper({
  pageId,
  pageName,
  children,
}: PageExportWrapperProps) {
  return (
    <>
      <div id={pageId}>{children}</div>
      <ExportButtons pageId={pageId} pageName={pageName} />
    </>
  );
}
