import { useState, useCallback, useRef } from 'react';
import { Upload, Image, FileText, X, AlertCircle, FileType } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import Button from '../ui/Button';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.worker.min.mjs`;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const ACCEPTED_TEXT_TYPES = ['text/plain'];
const ACCEPTED_PDF_TYPES = ['application/pdf'];
const ALL_ACCEPTED = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_TEXT_TYPES, ...ACCEPTED_PDF_TYPES];

const PDF_RENDER_SCALE = 2;

interface MindmapUploaderProps {
  readonly uploadedImage: string | null;
  readonly onUpload: (base64: string) => void;
  readonly onClear: () => void;
  readonly isAnalyzing: boolean;
  readonly onAnalyze: () => void;
}

const renderPdfToBase64 = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageCount = pdf.numPages;

  const pageCanvases: HTMLCanvasElement[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D 컨텍스트를 생성할 수 없습니다.');
    }
    await page.render({ canvasContext: ctx, viewport }).promise;
    pageCanvases.push(canvas);
  }

  if (pageCanvases.length === 1) {
    return pageCanvases[0].toDataURL('image/png');
  }

  // Multi-page: concatenate all pages vertically into a single image
  const totalWidth = Math.max(...pageCanvases.map((c) => c.width));
  const totalHeight = pageCanvases.reduce((sum, c) => sum + c.height, 0);

  const combinedCanvas = document.createElement('canvas');
  combinedCanvas.width = totalWidth;
  combinedCanvas.height = totalHeight;
  const combinedCtx = combinedCanvas.getContext('2d');
  if (!combinedCtx) {
    throw new Error('Canvas 2D 컨텍스트를 생성할 수 없습니다.');
  }

  let yOffset = 0;
  for (const pageCanvas of pageCanvases) {
    combinedCtx.drawImage(pageCanvas, 0, yOffset);
    yOffset += pageCanvas.height;
  }

  return combinedCanvas.toDataURL('image/png');
};

export default function MindmapUploader({
  uploadedImage,
  onUpload,
  onClear,
  isAnalyzing,
  onAnalyze,
}: MindmapUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPdfProcessing, setIsPdfProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!ALL_ACCEPTED.includes(file.type)) {
        setError('PNG, JPG, WEBP 이미지, TXT 파일 또는 PDF 파일만 지원됩니다.');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError('파일 크기는 10MB 이하여야 합니다.');
        return;
      }

      // Handle PDF files
      if (ACCEPTED_PDF_TYPES.includes(file.type)) {
        try {
          setIsPdfProcessing(true);
          const base64 = await renderPdfToBase64(file);
          onUpload(base64);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'PDF 처리 중 오류가 발생했습니다.';
          setError(message);
        } finally {
          setIsPdfProcessing(false);
        }
        return;
      }

      // Handle image and text files
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        onUpload(result);
      };
      reader.onerror = () => {
        setError('파일을 읽는 중 오류가 발생했습니다.');
      };
      reader.readAsDataURL(file);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [processFile]
  );

  const isImage = uploadedImage?.startsWith('data:image');

  return (
    <div className="space-y-4">
      {!uploadedImage ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-xl p-8
            flex flex-col items-center justify-center text-center
            transition-colors cursor-pointer min-h-[240px]
            ${
              isDragOver
                ? 'border-brand-400 bg-brand-50 dark:border-brand-600 dark:bg-brand-950'
                : 'border-gray-300 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700'
            }
          `.trim()}
          onClick={() => fileInputRef.current?.click()}
        >
          {isPdfProcessing ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-3 border-gray-300 border-t-brand-500 animate-spin dark:border-gray-700 dark:border-t-brand-400" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                PDF 변환 중...
              </p>
            </div>
          ) : (
            <>
              <Upload
                className={`w-10 h-10 mb-4 ${
                  isDragOver
                    ? 'text-brand-500 dark:text-brand-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                마인드맵 파일을 드래그하거나 클릭하여 업로드
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, WEBP, PDF 이미지 또는 TXT 파일 (최대 10MB)
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                  <Image className="w-3.5 h-3.5" />
                  이미지
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                  <FileType className="w-3.5 h-3.5" />
                  PDF
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                  <FileText className="w-3.5 h-3.5" />
                  텍스트
                </div>
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={ALL_ACCEPTED.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-800">
            {isImage ? (
              <img
                src={uploadedImage}
                alt="업로드된 마인드맵"
                className="w-full max-h-[400px] object-contain"
              />
            ) : (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    텍스트 파일
                  </span>
                </div>
                <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {atob(uploadedImage.split(',')[1] ?? '')}
                </pre>
              </div>
            )}
            <button
              onClick={onClear}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-900/60 text-white hover:bg-gray-900/80 transition-colors cursor-pointer"
              title="파일 제거"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={onAnalyze}
              loading={isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? 'AI 분석 중...' : '분석하기'}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={onClear}
              disabled={isAnalyzing}
            >
              초기화
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
