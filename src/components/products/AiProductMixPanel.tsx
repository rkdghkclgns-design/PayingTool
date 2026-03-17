import { useState, useCallback, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Sparkles, ChevronDown, ChevronUp, RefreshCw, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import type { ProductMixRecommendation } from '../../services/gemini';
import type { GameStructure } from '../../models/game-structure';
import type { Product, ProductCategory } from '../../models';
import { recommendProductMix } from '../../services/gemini';
import { useMindmapStore } from '../../stores/mindmap-store';
import { useProductStore } from '../../stores/product-store';
import { useProjectStore } from '../../stores/project-store';
import { GENRE_BLUEPRINTS } from '../../data/genre-blueprints';
import { getGenreBlueprint } from '../../data/genre-blueprints/index';
import { KRW_USD_RATE } from '../../utils/constants';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import LoadingSpinner from '../ui/LoadingSpinner';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const MAX_HISTORY = 3;

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
// Recommendation type -> ProductCategory mapping
// ─────────────────────────────────────────────
const TYPE_TO_CATEGORY: Readonly<Record<string, ProductCategory>> = {
  gacha: 'gacha',
  battle_pass: 'battle_pass',
  subscription: 'subscription',
  currency_packs: 'currency_pack',
  starter_pack: 'starter_pack',
  cosmetics: 'cosmetic',
  energy_stamina: 'energy',
  progression_boost: 'boost',
  bundles: 'bundle',
  vip_membership: 'vip',
  remove_ads: 'remove_ads',
  season_content: 'limited_offer',
  expansion_dlc: 'limited_offer',
  rewarded_ads: 'other',
  offerwalls: 'other',
  loot_box: 'other',
} as const;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function generateProductId(): string {
  return `prod_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function mapTypeToCategory(type: string): ProductCategory {
  return TYPE_TO_CATEGORY[type] ?? 'other';
}

function getStarterTierMidpointUsd(genre: string | undefined): number {
  if (!genre) return 2.99;

  const blueprint = getGenreBlueprint(genre as Parameters<typeof getGenreBlueprint>[0]);
  if (!blueprint || blueprint.priceTiers.length === 0) return 2.99;

  const starterTier = blueprint.priceTiers[0];
  if (!starterTier) return 2.99;

  return Math.round(((starterTier.minUsd + starterTier.maxUsd) / 2) * 100) / 100;
}

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

// ─────────────────────────────────────────────
// Custom Legend formatter
// ─────────────────────────────────────────────
function renderLegendText(value: string, entry: { payload?: { value?: number } }) {
  const percentage = entry.payload?.value ?? 0;
  return (
    <span className="text-xs text-gray-700 dark:text-gray-300">
      {value} ({percentage}%)
    </span>
  );
}

export default function AiProductMixPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mixHistory, setMixHistory] = useState<readonly (readonly ProductMixRecommendation[])[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [showRequirements, setShowRequirements] = useState(false);
  const [userRequirements, setUserRequirements] = useState('');

  const analysisResult = useMindmapStore((s) => s.analysisResult);
  const addProduct = useProductStore((s) => s.addProduct);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);

  // Current recommendations based on active index
  const currentRecommendations = useMemo(
    () => (mixHistory.length > 0 ? mixHistory[activeIndex] ?? null : null),
    [mixHistory, activeIndex],
  );

  const handleRequest = useCallback(async () => {
    setError(null);
    setApplySuccess(null);
    setIsLoading(true);

    try {
      const structure = analysisResult ?? buildFallbackStructure();
      if (!structure) {
        setError('게임 구조 데이터가 없습니다. 마인드맵을 먼저 분석하거나 장르 블루프린트를 확인하세요.');
        return;
      }

      const requirements = showRequirements ? userRequirements : undefined;
      const result = await recommendProductMix(structure, requirements);

      // Prepend new result, cap at MAX_HISTORY (immutable)
      setMixHistory((prev) => {
        const updated = [result, ...prev];
        return updated.length > MAX_HISTORY ? updated.slice(0, MAX_HISTORY) : updated;
      });
      setActiveIndex(0);
      setIsExpanded(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI 추천 요청에 실패했습니다.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [analysisResult, showRequirements, userRequirements]);

  const handleRetry = useCallback(() => {
    setError(null);
    handleRequest();
  }, [handleRequest]);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleSwitchHistory = useCallback((index: number) => {
    setActiveIndex(index);
    setApplySuccess(null);
  }, []);

  const handleApplyToProducts = useCallback(() => {
    if (!currentRecommendations || currentRecommendations.length === 0) return;

    const genre = analysisResult?.genre;
    const midpointUsd = getStarterTierMidpointUsd(genre);
    const midpointKrw = Math.round(midpointUsd * KRW_USD_RATE);
    const projectId = activeProjectId ?? '';
    const now = new Date().toISOString();

    const newProducts: readonly Product[] = currentRecommendations.map((item, index) => ({
      id: generateProductId(),
      projectId,
      name: item.label,
      description: `AI 추천 상품 - ${item.rationale}`,
      category: mapTypeToCategory(item.type),
      priceKRW: midpointKrw,
      priceUSD: midpointUsd,
      targetSegments: ['minnow', 'dolphin'] as const,
      targetRetentionStage: 'd7' as const,
      contents: [],
      purchaseLimit: { type: 'unlimited' as const, maxCount: 0 },
      funnelStageId: null,
      sortOrder: index,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }));

    for (const product of newProducts) {
      addProduct(product);
    }

    setApplySuccess(`상품 ${newProducts.length}개가 추가되었습니다`);

    // Auto-dismiss success message after 4 seconds
    setTimeout(() => {
      setApplySuccess(null);
    }, 4000);
  }, [currentRecommendations, analysisResult, activeProjectId, addProduct]);

  const pieData = useMemo(
    () =>
      currentRecommendations?.map((item) => ({
        name: item.label,
        value: item.percentage,
      })) ?? [],
    [currentRecommendations],
  );

  return (
    <Card className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
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
          {currentRecommendations && !isLoading && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleApplyToProducts}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              상품에 반영
            </Button>
          )}
          <Button
            variant={showRequirements ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowRequirements((prev) => !prev)}
            icon={<MessageSquare className="w-4 h-4" />}
          >
            {showRequirements ? '요구사항 접기' : '요구사항 입력'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRequest}
            loading={isLoading}
            icon={<Sparkles className="w-4 h-4" />}
          >
            {isLoading ? '분석 중...' : 'AI 추천 요청'}
          </Button>
          {currentRecommendations && (
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

      {/* User Requirements Input */}
      {showRequirements && (
        <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            추가 요구사항 (선택)
          </label>
          <textarea
            value={userRequirements}
            onChange={(e) => setUserRequirements(e.target.value)}
            placeholder="예: 가챠를 반드시 포함해주세요, 구독 비중을 높게 해주세요, 광고 제거 상품도 추가해주세요..."
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-400 focus:border-brand-400 resize-none"
          />
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            요구사항을 입력하면 AI가 해당 내용을 반영하여 상품 믹스를 추천합니다
          </p>
        </div>
      )}

      {/* Success toast */}
      {applySuccess && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            {applySuccess}
          </span>
        </div>
      )}

      {/* History tabs */}
      {mixHistory.length > 1 && !isLoading && (
        <div className="mt-4 flex items-center gap-2">
          {mixHistory.map((_entry, index) => (
            <button
              key={`history-tab-${index}`}
              onClick={() => handleSwitchHistory(index)}
              className={`
                px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer
                ${
                  index === activeIndex
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }
              `.trim()}
            >
              추천 {index + 1}
            </button>
          ))}
        </div>
      )}

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
      {currentRecommendations && isExpanded && !isLoading && (
        <div className="mt-6 space-y-6">
          {/* Pie Chart with Legend (no inline labels to avoid clipping) */}
          <div className="flex justify-center">
            <div className="w-full max-w-lg" style={{ height: 380 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="40%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
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
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
                    formatter={renderLegendText}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommendation cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentRecommendations.map((item, index) => (
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
