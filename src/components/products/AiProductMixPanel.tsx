import { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Sparkles, ChevronDown, ChevronUp, RefreshCw, AlertCircle } from 'lucide-react';
import type { ProductMixRecommendation } from '../../services/gemini';
import type { GameStructure } from '../../models/game-structure';
import { recommendProductMix } from '../../services/gemini';
import { useMindmapStore } from '../../stores/mindmap-store';
import { GENRE_BLUEPRINTS } from '../../data/genre-blueprints';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import LoadingSpinner from '../ui/LoadingSpinner';

// ─────────────────────────────────────────────
// Color palette for pie chart slices
// ─────────────────────────────────────────────
const PIE_COLORS: readonly string[] = [
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#3b82f6', // blue
  '#84cc16', // lime
] as const;

// ─────────────────────────────────────────────
// Fallback: build a minimal GameStructure from the first available blueprint
// ─────────────────────────────────────────────
const buildFallbackStructure = (): GameStructure | null => {
  const blueprint = GENRE_BLUEPRINTS[0];
  if (!blueprint) return null;

  return {
    genre: blueprint.genre,
    coreLoop: blueprint.keyStrategies[0] ?? '',
    progressionSystems: [],
    socialFeatures: [],
    contentTypes: [],
    currencies: [],
    retentionHooks: blueprint.funnelTips,
    competitiveElements: [],
    rawAnalysis: `${blueprint.genreLabelKo} 장르 블루프린트 기반 자동 생성`,
  };
};

export default function AiProductMixPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<readonly ProductMixRecommendation[] | null>(null);

  const analysisResult = useMindmapStore((s) => s.analysisResult);

  const handleRequest = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const structure = analysisResult ?? buildFallbackStructure();
      if (!structure) {
        setError('게임 구조 데이터가 없습니다. 마인드맵을 먼저 분석하거나 장르 블루프린트를 확인하세요.');
        return;
      }
      const result = await recommendProductMix(structure);
      setRecommendations(result);
      setIsExpanded(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI 추천 요청에 실패했습니다.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [analysisResult]);

  const handleRetry = useCallback(() => {
    setError(null);
    handleRequest();
  }, [handleRequest]);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const pieData = recommendations?.map((item) => ({
    name: item.label,
    value: item.percentage,
  })) ?? [];

  return (
    <Card className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI 상품 믹스 추천
          </h3>
          {!analysisResult && (
            <Badge variant="warning" size="sm">블루프린트 기반</Badge>
          )}
          {analysisResult && (
            <Badge variant="primary" size="sm">마인드맵 기반</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleRequest}
            loading={isLoading}
            icon={<Sparkles className="w-4 h-4" />}
          >
            {isLoading ? '분석 중...' : 'AI 추천 요청'}
          </Button>
          {recommendations && (
            <button
              onClick={toggleExpand}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label={isExpanded ? '접기' : '펼치기'}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            AI가 최적의 상품 믹스를 분석하고 있습니다...
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetry}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                className="mt-2 text-red-600 dark:text-red-400"
              >
                다시 시도
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {recommendations && isExpanded && !isLoading && (
        <div className="mt-6 space-y-6">
          {/* Pie Chart */}
          <div className="flex justify-center">
            <div className="w-full max-w-md" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name} ${value}%`}
                    labelLine={true}
                  >
                    {pieData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, '비율']}
                    contentStyle={{
                      backgroundColor: 'var(--color-gray-900, #1a1a1a)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommendation cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendations.map((item, index) => (
              <div
                key={item.type}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {item.label}
                    </span>
                  </div>
                  <Badge variant="primary" size="sm">
                    {item.percentage}%
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {item.rationale}
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 font-mono">
                  {item.type}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
