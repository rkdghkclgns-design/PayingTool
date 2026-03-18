import { useState, useCallback, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Sparkles, ChevronDown, ChevronUp, RefreshCw, AlertCircle, CheckCircle2, MessageSquare, Replace, Plus, X } from 'lucide-react';
import type { ProductMixRecommendation } from '../../services/gemini';
import type { GameStructure } from '../../models/game-structure';
import type { Product, ProductCategory } from '../../models';
import { recommendProductMix, recommendProducts } from '../../services/gemini';
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

function mapSegment(segment: string | undefined): Product['targetSegments'][number] {
  const map: Record<string, Product['targetSegments'][number]> = {
    npu: 'non_payer',
    non_payer: 'non_payer',
    minnow: 'minnow',
    dolphin: 'dolphin',
    whale: 'whale',
    super_whale: 'super_whale',
    offerwall: 'offerwall',
  };
  return map[segment ?? ''] ?? 'minnow';
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
// Mandatory products — NPU유도 + 오퍼월
// ─────────────────────────────────────────────
interface MandatoryProductDef {
  readonly name: string;
  readonly category: ProductCategory;
  readonly description: string;
  readonly matchName: readonly string[];
  readonly matchType: readonly string[];
}

const MANDATORY_PRODUCT_DEFS: readonly MandatoryProductDef[] = [
  {
    name: 'NPU유도 스타터 팩',
    category: 'starter_pack',
    description: '비과금 유저의 첫 결제를 유도하는 저가 패키지',
    matchName: ['npu', 'NPU', 'NPU유도'],
    matchType: ['starter_pack'],
  },
  {
    name: '오퍼월 보상',
    category: 'other',
    description: '오퍼월을 통한 무료 재화 획득 시스템. 외부 광고/설문 완료 시 인게임 재화 지급.',
    matchName: ['오퍼월', 'offerwall', '오퍼 월'],
    matchType: ['offerwalls', 'rewarded_ads'],
  },
  {
    name: '시즌 패스',
    category: 'battle_pass',
    description: '시즌별 보상을 제공하는 패스권 상품',
    matchName: ['패스', '시즌패스', '배틀패스', 'pass', 'battle_pass'],
    matchType: ['battle_pass', 'pass'],
  },
  // 비유료 상품 — 골드(인게임 재화) 상품
  {
    name: '골드 일일 상점',
    category: 'other',
    description: '골드(인게임 재화)로 구매 가능한 일일 한정 아이템 상점. 매일 갱신되며 강화석, 경험치 포션, 소모품 등을 제공.',
    matchName: ['골드 상점', '골드 일일', '인게임 재화 상점'],
    matchType: [],
  },
  {
    name: '골드 장비 상자',
    category: 'other',
    description: '골드로 구매 가능한 랜덤 장비 상자. 일반~레어 등급 장비를 획득할 수 있으며, 뽑기 시스템의 무료 버전.',
    matchName: ['골드 장비', '골드 상자', '무료 뽑기'],
    matchType: [],
  },
  {
    name: '골드 스태미나 충전',
    category: 'energy',
    description: '골드로 에너지/스태미나를 즉시 충전. 유료 다이아몬드 충전 대비 효율은 낮지만 무과금 유저도 이용 가능.',
    matchName: ['골드 스태미나', '골드 에너지', '골드 충전'],
    matchType: [],
  },
  // 보상형 광고 상품 (0원)
  {
    name: '보상형 광고 - 2배 보상',
    category: 'other',
    description: '스테이지 클리어 후 30초 광고를 시청하면 획득 보상이 2배가 됩니다. 하루 10회 제한.',
    matchName: ['보상형 광고', '광고 시청', '2배 보상', 'rewarded'],
    matchType: ['rewarded_ads'],
  },
] as const;

function hasMandatoryProduct(
  products: readonly Product[],
  def: MandatoryProductDef,
): boolean {
  return products.some((p) => {
    const nameLC = p.name.toLowerCase();
    const descLC = p.description.toLowerCase();
    return def.matchName.some((m) => nameLC.includes(m.toLowerCase()) || descLC.includes(m.toLowerCase()));
  });
}

function ensureMandatoryProducts(
  products: readonly Product[],
  projectId: string,
  midpointUsd: number,
  midpointKrw: number,
): readonly Product[] {
  const now = new Date().toISOString();
  const missing: Product[] = [];

  for (const def of MANDATORY_PRODUCT_DEFS) {
    if (!hasMandatoryProduct(products, def)) {
      // 유료 판정: starter_pack, battle_pass 등은 유료. 골드/오퍼월/보상형 광고는 비유료
      const isFreeProduct = def.name.includes('골드') || def.name.includes('오퍼월') || def.name.includes('보상형 광고');
      const isPaidProduct = !isFreeProduct && def.category !== 'other';

      missing.push({
        id: generateProductId(),
        projectId,
        name: def.name,
        description: def.description,
        category: def.category,
        priceKRW: isPaidProduct ? (def.category === 'starter_pack' ? midpointKrw : midpointKrw * 3) : 0,
        priceUSD: isPaidProduct ? (def.category === 'starter_pack' ? midpointUsd : midpointUsd * 3) : 0,
        targetSegments: isFreeProduct ? ['non_payer', 'offerwall'] as const : ['non_payer', 'minnow'] as const,
        targetRetentionStage: 'd7' as const,
        contents: [],
        purchaseLimit: { type: 'unlimited' as const, maxCount: 0 },
        funnelStageId: null,
        salesTechnique: 'standard' as const,
        isPaid: isPaidProduct,
        sortOrder: products.length + missing.length,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return missing.length > 0 ? [...products, ...missing] : products;
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
    adPlacements: [],
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
  const [showApplyMode, setShowApplyMode] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const analysisResult = useMindmapStore((s) => s.analysisResult);
  const addProduct = useProductStore((s) => s.addProduct);
  const setProducts = useProductStore((s) => s.setProducts);
  const existingProducts = useProductStore((s) => s.products);
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

  const buildNewProducts = useCallback((): readonly Product[] => {
    if (!currentRecommendations || currentRecommendations.length === 0) return [];

    const genre = analysisResult?.genre;
    const midpointUsd = getStarterTierMidpointUsd(genre);
    const midpointKrw = Math.round(midpointUsd * KRW_USD_RATE);
    const projectId = activeProjectId ?? '';
    const now = new Date().toISOString();

    return currentRecommendations.map((item, index) => ({
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
      salesTechnique: 'standard' as const,
      isPaid: true,
      sortOrder: index,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }));
  }, [currentRecommendations, analysisResult, activeProjectId]);

  /** AI로 상세 상품 목록 생성 (contents 포함) */
  const fetchAiProducts = useCallback(async (): Promise<readonly Product[]> => {
    const structure = analysisResult ?? buildFallbackStructure();
    if (!structure) return buildNewProducts();

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aiProducts: any[] = await recommendProducts(structure);
      const projectId = activeProjectId ?? '';
      const now = new Date().toISOString();

      // AI 반환 상품을 Product 형식으로 정규화
      return aiProducts.map((p: Record<string, unknown>, index: number) => ({
        id: generateProductId(),
        projectId,
        name: (p.name || p.nameKo || `상품 ${index + 1}`) as string,
        description: (p.description || '') as string,
        category: ((p.category || 'other') as string) as ProductCategory,
        priceKRW: (p.priceKRW || p.priceKrw || Math.round(((p.priceUSD || p.priceUsd || 2.99) as number) * KRW_USD_RATE)) as number,
        priceUSD: (p.priceUSD || p.priceUsd || 2.99) as number,
        targetSegments: [mapSegment((p.userSegment || (Array.isArray(p.targetSegments) ? p.targetSegments[0] : undefined)) as string)] as const,
        targetRetentionStage: ((p.targetRetentionStage || p.retentionStage || 'd7') as string) as Product['targetRetentionStage'],
        contents: (Array.isArray(p.contents) ? p.contents : []).map((c: Record<string, unknown>) => ({
          itemName: (c.itemName || '') as string,
          quantity: (c.quantity || 1) as number,
          description: (c.description || '') as string,
        })),
        purchaseLimit: (p.purchaseLimit || { type: 'unlimited' as const, maxCount: 0 }) as Product['purchaseLimit'],
        funnelStageId: null,
        salesTechnique: ((p.salesTechnique || 'standard') as string) as Product['salesTechnique'],
        isPaid: p.isPaid !== false,
        sortOrder: index,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }));
    } catch {
      // AI 실패 시 기존 방식 fallback
      return buildNewProducts();
    }
  }, [analysisResult, activeProjectId, buildNewProducts]);

  const handleApplyToProducts = useCallback(async () => {
    if (!currentRecommendations || currentRecommendations.length === 0) return;

    if (existingProducts.length > 0) {
      setShowApplyMode(true);
      return;
    }

    setIsApplying(true);
    try {
      const genre = analysisResult?.genre;
      const midUsd = getStarterTierMidpointUsd(genre);
      const midKrw = Math.round(midUsd * KRW_USD_RATE);
      const aiProducts = await fetchAiProducts();
      const productsWithMandatory = ensureMandatoryProducts(aiProducts, activeProjectId ?? '', midUsd, midKrw);
      setProducts(productsWithMandatory);
      setApplySuccess(`AI가 구성품 포함 상품 ${productsWithMandatory.length}개를 생성했습니다`);
      setTimeout(() => { setApplySuccess(null); }, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 상품 생성 실패');
    } finally {
      setIsApplying(false);
    }
  }, [currentRecommendations, existingProducts, fetchAiProducts, analysisResult, activeProjectId, setProducts]);

  const handleApplyReplace = useCallback(async () => {
    setIsApplying(true);
    try {
      const genre = analysisResult?.genre;
      const midUsd = getStarterTierMidpointUsd(genre);
      const midKrw = Math.round(midUsd * KRW_USD_RATE);
      const aiProducts = await fetchAiProducts();
      const productsWithMandatory = ensureMandatoryProducts(aiProducts, activeProjectId ?? '', midUsd, midKrw);
      setProducts(productsWithMandatory);
      setShowApplyMode(false);
      setApplySuccess(`기존 상품을 교체하고 ${productsWithMandatory.length}개가 등록되었습니다`);
      setTimeout(() => { setApplySuccess(null); }, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 상품 생성 실패');
    } finally {
      setIsApplying(false);
    }
  }, [fetchAiProducts, setProducts, analysisResult, activeProjectId]);

  const handleApplyAppend = useCallback(async () => {
    setIsApplying(true);
    try {
      const genre = analysisResult?.genre;
      const midUsd = getStarterTierMidpointUsd(genre);
      const midKrw = Math.round(midUsd * KRW_USD_RATE);
      const aiProducts = await fetchAiProducts();
      for (const product of aiProducts) {
        addProduct(product);
      }
      const allProducts = [...existingProducts, ...aiProducts];
      const withMandatory = ensureMandatoryProducts(allProducts, activeProjectId ?? '', midUsd, midKrw);
      if (withMandatory.length > allProducts.length) {
        const addedMandatory = withMandatory.slice(allProducts.length);
        for (const product of addedMandatory) {
          addProduct(product);
        }
      }
      setShowApplyMode(false);
      setApplySuccess(`기존 상품에 ${aiProducts.length}개가 추가되었습니다`);
      setTimeout(() => { setApplySuccess(null); }, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 상품 생성 실패');
    } finally {
      setIsApplying(false);
    }
  }, [fetchAiProducts, addProduct, existingProducts, analysisResult, activeProjectId]);

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
              loading={isApplying}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              {isApplying ? 'AI 상품 생성 중...' : '상품에 반영'}
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

      {/* Apply mode selection */}
      {showApplyMode && (
        <div className="mt-4 p-4 rounded-lg border-2 border-brand-300 dark:border-brand-600 bg-brand-50 dark:bg-brand-950">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              상품 반영 방식을 선택하세요
            </h4>
            <button
              onClick={() => setShowApplyMode(false)}
              className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 space-y-1">
            <p>현재 등록된 상품: <span className="font-semibold text-gray-700 dark:text-gray-300">{existingProducts.length}개</span></p>
            <p>새로 반영할 상품: <span className="font-semibold text-gray-700 dark:text-gray-300">{currentRecommendations?.length ?? 0}개</span></p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleApplyReplace}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors cursor-pointer"
            >
              <Replace className="w-4 h-4" />
              교체하기
            </button>
            <button
              onClick={handleApplyAppend}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              추가하기
            </button>
          </div>
          <div className="mt-3 text-xs text-gray-400 dark:text-gray-500 space-y-0.5">
            <p><span className="font-medium">교체:</span> 기존 상품을 삭제하고 새 상품만 등록</p>
            <p><span className="font-medium">추가:</span> 기존 상품을 유지하고 새 상품을 추가</p>
          </div>
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
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
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
