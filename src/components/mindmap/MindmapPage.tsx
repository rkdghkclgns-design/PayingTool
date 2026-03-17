import { useCallback } from 'react';
import { Brain } from 'lucide-react';
import { useMindmapStore } from '../../stores/mindmap-store';
import { analyzeMindmapImage, analyzeMindmapText } from '../../services/gemini';
import PageContainer from '../layout/PageContainer';
import Card from '../ui/Card';
import MindmapUploader from './MindmapUploader';
import AnalysisResultPanel from './AnalysisResultPanel';

export default function MindmapPage() {
  const {
    uploadedImage,
    isAnalyzing,
    analysisResult,
    analysisError,
    setUploadedImage,
    setAnalyzing,
    setAnalysisResult,
    setAnalysisError,
    clearAnalysis,
  } = useMindmapStore();

  const handleAnalyze = useCallback(async () => {
    if (!uploadedImage) return;

    setAnalyzing(true);

    try {
      const isText = uploadedImage.startsWith('data:text');
      const result = isText
        ? await analyzeMindmapText(atob(uploadedImage.split(',')[1] ?? ''))
        : await analyzeMindmapImage(uploadedImage);
      setAnalysisResult(result);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'AI 분석 중 알 수 없는 오류가 발생했습니다.';
      setAnalysisError(message);
    }
  }, [uploadedImage, setAnalyzing, setAnalysisResult, setAnalysisError]);

  const handleRetry = useCallback(() => {
    handleAnalyze();
  }, [handleAnalyze]);

  return (
    <PageContainer
      title="마인드맵 분석기"
      description="게임 구조 마인드맵을 업로드하면 AI가 유료화 구조를 자동으로 분석합니다"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Uploader / Preview */}
        <div>
          <Card
            title="마인드맵 업로드"
            subtitle="이미지 또는 텍스트 파일을 업로드하세요"
            headerAction={
              <Brain className="w-5 h-5 text-brand-500 dark:text-brand-400" />
            }
          >
            <MindmapUploader
              uploadedImage={uploadedImage}
              onUpload={setUploadedImage}
              onClear={clearAnalysis}
              isAnalyzing={isAnalyzing}
              onAnalyze={handleAnalyze}
            />
          </Card>

          {/* Tips */}
          <div className="mt-4 p-4 rounded-xl bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800">
            <h4 className="text-sm font-semibold text-brand-700 dark:text-brand-300 mb-2">
              분석 팁
            </h4>
            <ul className="space-y-1 text-xs text-brand-600 dark:text-brand-400">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 w-1 h-1 rounded-full bg-brand-400 flex-shrink-0" />
                코어 루프, 성장 시스템, 재화 구조가 명확할수록 분석 정확도가 높아집니다
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 w-1 h-1 rounded-full bg-brand-400 flex-shrink-0" />
                소셜 기능과 경쟁 요소도 포함하면 더 풍부한 분석을 받을 수 있습니다
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 w-1 h-1 rounded-full bg-brand-400 flex-shrink-0" />
                텍스트 파일은 계층 구조를 들여쓰기로 표현하면 효과적입니다
              </li>
            </ul>
          </div>
        </div>

        {/* Right: Analysis Results */}
        <div>
          <AnalysisResultPanel
            isAnalyzing={isAnalyzing}
            result={analysisResult}
            error={analysisError}
            onRetry={handleRetry}
          />
        </div>
      </div>
    </PageContainer>
  );
}
