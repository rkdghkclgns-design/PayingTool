import { AlertCircle, RefreshCw } from 'lucide-react';
import type { GameStructure } from '../../models';
import LoadingSpinner from '../ui/LoadingSpinner';
import Button from '../ui/Button';
import GameStructureCard from './GameStructureCard';

interface AnalysisResultPanelProps {
  readonly isAnalyzing: boolean;
  readonly result: GameStructure | null;
  readonly error: string | null;
  readonly onRetry: () => void;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        AI가 마인드맵을 분석하고 있습니다...
      </p>
    </div>
  );
}

function ErrorDisplay({
  error,
  onRetry,
}: {
  readonly error: string;
  readonly onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-red-500 dark:text-red-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          분석 실패
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          {error}
        </p>
      </div>
      <Button
        variant="secondary"
        onClick={onRetry}
        icon={<RefreshCw className="w-4 h-4" />}
      >
        다시 시도
      </Button>
    </div>
  );
}

export default function AnalysisResultPanel({
  isAnalyzing,
  result,
  error,
  onRetry,
}: AnalysisResultPanelProps) {
  if (isAnalyzing) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={onRetry} />;
  }

  if (result) {
    return <GameStructureCard structure={result} />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-gray-400 dark:text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
          />
        </svg>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        마인드맵을 업로드하고 분석을 시작하세요
      </p>
    </div>
  );
}
