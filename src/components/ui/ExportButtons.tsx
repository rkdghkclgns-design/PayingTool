import { useState, useCallback } from 'react';
import { Camera, FileDown } from 'lucide-react';
import Button from './Button';
import { downloadPageAsPng, downloadReport } from '../../utils/export-utils';

interface ExportButtonsProps {
  readonly pageId: string;
  readonly pageName: string;
}

export default function ExportButtons({ pageId, pageName }: ExportButtonsProps) {
  const [isPngLoading, setIsPngLoading] = useState(false);

  const handlePngDownload = useCallback(async () => {
    setIsPngLoading(true);
    try {
      await downloadPageAsPng(pageId, pageName);
    } catch (error) {
      console.error('PNG 다운로드 실패:', error);
    } finally {
      setIsPngLoading(false);
    }
  }, [pageId, pageName]);

  const handleReportDownload = useCallback(() => {
    try {
      downloadReport();
    } catch (error) {
      console.error('리포트 다운로드 실패:', error);
    }
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <Button
        variant="ghost"
        size="sm"
        icon={<Camera className="w-4 h-4" />}
        loading={isPngLoading}
        onClick={handlePngDownload}
        className="bg-white/90 dark:bg-gray-800/90 shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
        title="현재 페이지를 PNG로 저장"
      >
        PNG 저장
      </Button>
      <Button
        variant="ghost"
        size="sm"
        icon={<FileDown className="w-4 h-4" />}
        onClick={handleReportDownload}
        className="bg-white/90 dark:bg-gray-800/90 shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
        title="전체 리포트를 HTML로 다운로드"
      >
        리포트 다운로드
      </Button>
    </div>
  );
}
