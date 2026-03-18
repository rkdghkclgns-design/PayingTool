import { useState, useCallback, useMemo } from 'react';
import { RotateCcw, Users, Lightbulb, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useFunnelStore } from '../../stores/funnel-store';
import { useProductStore } from '../../stores/product-store';
import { useGenreStore } from '../../stores/genre-store';
import { useMindmapStore } from '../../stores/mindmap-store';
import { getGenreBlueprint } from '../../data/genre-blueprints/index';
import { suggestFunnelStrategies } from '../../services/gemini';
import { GAME_GENRE_LABELS } from '../../utils/constants';
import type { GameGenre } from '../../models/project';
import PageContainer from '../layout/PageContainer';
import Button from '../ui/Button';
import Input from '../ui/Input';
import FunnelCanvas from './FunnelCanvas';
import FunnelMetricsPanel from './FunnelMetricsPanel';
import ProductAssignModal from './ProductAssignModal';

// ─────────────────────────────────────────────
// Genre Selector for Funnel Tips
// ─────────────────────────────────────────────
const GENRE_OPTIONS: readonly { value: string; label: string }[] = Array.from(
  GAME_GENRE_LABELS.entries(),
).filter(([key]) => key !== 'other').map(([key, label]) => ({ value: key, label }));

// ─────────────────────────────────────────────
// Funnel Tips Section (collapsible) with genre selector
// ─────────────────────────────────────────────
interface FunnelTipsSectionProps {
  readonly tips: readonly string[];
  readonly selectedGenre: string | null;
  readonly genreSource: 'manual' | 'mindmap';
  readonly onGenreChange: (genre: string) => void;
}

function FunnelTipsSection({ tips, selectedGenre, genreSource, onGenreChange }: FunnelTipsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex items-center justify-between w-full px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            장르별 퍼널 팁
          </span>
          {selectedGenre && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              ({tips.length}개)
              {genreSource === 'mindmap' && ' · AI 감지'}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-amber-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-500" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4">
          {/* Genre selector */}
          <div className="mb-3">
            <select
              value={selectedGenre ?? ''}
              onChange={(e) => onGenreChange(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 text-sm rounded-lg border border-amber-300 bg-white dark:bg-gray-900 dark:border-amber-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-400"
            >
              <option value="">장르를 선택하세요</option>
              {GENRE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                  {opt.value === selectedGenre && genreSource === 'mindmap' ? ' (AI 감지)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Tips list */}
          {tips.length > 0 ? (
            <ul className="space-y-2">
              {tips.map((tip) => (
                <li
                  key={tip}
                  className="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-100"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              장르를 선택하면 퍼널 전략 팁이 표시됩니다
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Funnel Designer Page
// ─────────────────────────────────────────────
export default function FunnelDesignerPage() {
  const {
    stages,
    updateStage,
    addStage,
    removeStage,
    updateStageLabel,
    updateStageDescription,
    assignProduct,
    removeProduct,
    resetStages,
  } = useFunnelStore();
  const { products } = useProductStore();
  const selectedGenre = useGenreStore((s) => s.selectedGenre);
  const genreSource = useGenreStore((s) => s.genreSource);
  const setGenre = useGenreStore((s) => s.setGenre);

  const blueprint = selectedGenre ? getGenreBlueprint(selectedGenre as GameGenre) : undefined;
  const funnelTips = useMemo(() => blueprint?.funnelTips ?? [], [blueprint]);

  const handleGenreChange = useCallback(
    (genre: string) => {
      if (genre) {
        setGenre(genre, 'manual');
      }
    },
    [setGenre],
  );

  const [totalUsers, setTotalUsers] = useState('100000');
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [assignModalStageId, setAssignModalStageId] = useState<string | null>(null);

  const totalUsersNum = parseInt(totalUsers, 10) || 0;

  const handleConversionChange = useCallback(
    (stageId: string, rate: number) => {
      updateStage(stageId, { conversionRate: rate });
    },
    [updateStage],
  );

  const handleAssignProduct = useCallback(
    (stageId: string) => {
      setAssignModalStageId(stageId);
    },
    [],
  );

  const handleRemoveProduct = useCallback(
    (stageId: string, productId: string) => {
      removeProduct(stageId, productId);
    },
    [removeProduct],
  );

  const handleLabelChange = useCallback(
    (stageId: string, label: string) => {
      updateStageLabel(stageId, label);
    },
    [updateStageLabel],
  );

  const handleDescriptionChange = useCallback(
    (stageId: string, description: string) => {
      updateStageDescription(stageId, description);
    },
    [updateStageDescription],
  );

  const handleRemoveStage = useCallback(
    (stageId: string) => {
      removeStage(stageId);
      if (selectedStageId === stageId) {
        setSelectedStageId(null);
      }
    },
    [removeStage, selectedStageId],
  );

  const handleAddStage = useCallback(
    (label: string, description: string) => {
      addStage(label, description);
    },
    [addStage],
  );

  const handleReset = useCallback(() => {
    resetStages();
    setSelectedStageId(null);
  }, [resetStages]);

  // ─── AI 퍼널 추천 ───
  const analysisResult = useMindmapStore((s) => s.analysisResult);
  const [isAiFunnel, setIsAiFunnel] = useState(false);
  const [aiFunnelError, setAiFunnelError] = useState<string | null>(null);

  // 상품 카테고리 → 퍼널 단계 매핑
  const CATEGORY_TO_STAGE: Readonly<Record<string, string>> = {
    starter_pack: 'first_purchase',
    piggy_bank: 'first_purchase',
    battle_pass: 'repeat_purchase',
    subscription: 'repeat_purchase',
    pass: 'repeat_purchase',
    currency_pack: 'repeat_purchase',
    bundle: 'repeat_purchase',
    gacha: 'subscription_or_vip',
    vip: 'subscription_or_vip',
    cosmetic: 'core_loop_engaged',
    energy: 'core_loop_engaged',
    boost: 'core_loop_engaged',
    remove_ads: 'first_purchase_prompt',
    other: 'first_purchase_prompt',
  };

  const handleAiFunnel = useCallback(async () => {
    const structure = analysisResult;
    if (!structure) {
      setAiFunnelError('마인드맵을 먼저 분석해주세요.');
      setTimeout(() => setAiFunnelError(null), 3000);
      return;
    }

    setIsAiFunnel(true);
    setAiFunnelError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aiStages: any[] = await suggestFunnelStrategies(structure, products);

      // 먼저 기본 스테이지 리셋 후 AI 데이터를 한 번에 적용
      resetStages();
      const defaultStages = useFunnelStore.getState().stages;

      // AI 반환 데이터로 기본 스테이지 업데이트 (한 번에 구성)
      const mergedStages = defaultStages.map((stage) => {
        const aiMatch = aiStages.find((ai: Record<string, unknown>) =>
          ai.name === stage.name
        );
        if (!aiMatch) return stage;

        // conversionRate: AI는 퍼센트 정수(100, 80, 3 등)로 반환 → 소수로 변환
        const rawRate = Number(aiMatch.conversionRate ?? 0);
        const normalizedRate = rawRate > 1 ? rawRate / 100 : rawRate;

        // 상품 자동 배치 — 이 단계에 맞는 상품 ID 수집
        const targetCategories = Object.entries(CATEGORY_TO_STAGE)
          .filter(([, sName]) => sName === stage.name)
          .map(([cat]) => cat);
        const matchedProductIds = products
          .filter((p) => targetCategories.includes(p.category))
          .map((p) => p.id);

        // AI strategies를 description에 병합
        const strategies = Array.isArray(aiMatch.strategies) ? (aiMatch.strategies as string[]).join(', ') : '';
        const descParts = [aiMatch.notes, aiMatch.targetKpi, strategies].filter(Boolean);
        const description = descParts.length > 0 ? descParts.join(' | ') : stage.description;

        return {
          ...stage,
          label: ((aiMatch.labelKo || aiMatch.label || stage.label) as string),
          conversionRate: normalizedRate || stage.conversionRate,
          description: description as string,
          assignedProductIds: [...new Set([...stage.assignedProductIds, ...matchedProductIds])],
        };
      });

      // loadStages로 한 번에 적용 (UI 깜빡임 방지)
      useFunnelStore.getState().loadStages(mergedStages);

      setSelectedStageId(null);
    } catch (err) {
      setAiFunnelError(err instanceof Error ? err.message : 'AI 퍼널 추천 실패');
      setTimeout(() => setAiFunnelError(null), 5000);
    } finally {
      setIsAiFunnel(false);
    }
  }, [analysisResult, resetStages, products]);

  const assignModalStage = assignModalStageId
    ? stages.find((s) => s.id === assignModalStageId) ?? null
    : null;

  return (
    <PageContainer title="퍼널 디자이너" description="사용자 전환 퍼널을 설계하고 각 단계에 상품을 배치합니다." exportId="page-funnel" exportName="퍼널디자이너">
      {/* Genre Funnel Tips */}
      <FunnelTipsSection
        tips={funnelTips}
        selectedGenre={selectedGenre}
        genreSource={genreSource}
        onGenreChange={handleGenreChange}
      />

      {/* Top Controls */}
      <div className="flex items-end gap-4 mb-6">
        <div className="flex items-end gap-2">
          <Input
            label="총 유저 수"
            type="number"
            value={totalUsers}
            onChange={setTotalUsers}
            placeholder="100000"
            className="w-48"
          />
          <div className="pb-1">
            <Users className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAiFunnel}
          loading={isAiFunnel}
          icon={<Sparkles className="w-4 h-4" />}
        >
          {isAiFunnel ? 'AI 분석 중...' : 'AI 퍼널 추천'}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleReset}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          초기화
        </Button>
      </div>

      {aiFunnelError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 rounded-lg text-sm text-red-700 dark:text-red-300">
          {aiFunnelError}
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel Canvas */}
        <div className="lg:col-span-2">
          <FunnelCanvas
            stages={stages}
            totalUsers={totalUsersNum}
            allProducts={products}
            selectedStageId={selectedStageId}
            onSelectStage={setSelectedStageId}
            onConversionChange={handleConversionChange}
            onAssignProduct={handleAssignProduct}
            onRemoveProduct={handleRemoveProduct}
            onLabelChange={handleLabelChange}
            onDescriptionChange={handleDescriptionChange}
            onRemoveStage={handleRemoveStage}
            onAddStage={handleAddStage}
          />
        </div>

        {/* Metrics Panel */}
        <div className="lg:col-span-1">
          <FunnelMetricsPanel
            stages={stages}
            totalUsers={totalUsersNum}
            allProducts={products}
          />
        </div>
      </div>

      {/* Product Assign Modal */}
      {assignModalStage && (
        <ProductAssignModal
          isOpen={assignModalStageId !== null}
          onClose={() => setAssignModalStageId(null)}
          stage={assignModalStage}
          allProducts={products}
          onAssign={(productId) => assignProduct(assignModalStage.id, productId)}
          onRemove={(productId) => removeProduct(assignModalStage.id, productId)}
        />
      )}
    </PageContainer>
  );
}
