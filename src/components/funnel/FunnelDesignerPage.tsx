import { useState, useCallback } from 'react';
import { RotateCcw, Users, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { useFunnelStore } from '../../stores/funnel-store';
import { useProductStore } from '../../stores/product-store';
import { useMindmapStore } from '../../stores/mindmap-store';
import { getGenreBlueprint } from '../../data/genre-blueprints/index';
import PageContainer from '../layout/PageContainer';
import Button from '../ui/Button';
import Input from '../ui/Input';
import FunnelCanvas from './FunnelCanvas';
import FunnelMetricsPanel from './FunnelMetricsPanel';
import ProductAssignModal from './ProductAssignModal';

// ─────────────────────────────────────────────
// Funnel Tips Section (collapsible)
// ─────────────────────────────────────────────
interface FunnelTipsSectionProps {
  readonly tips: readonly string[];
}

function FunnelTipsSection({ tips }: FunnelTipsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (tips.length === 0) return null;

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
          <span className="text-xs text-amber-600 dark:text-amber-400">
            ({tips.length}개)
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-amber-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-500" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4">
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
  const analysisResult = useMindmapStore((s) => s.analysisResult);

  const detectedGenre = analysisResult?.genre ?? null;
  const blueprint = detectedGenre ? getGenreBlueprint(detectedGenre) : undefined;
  const funnelTips = blueprint?.funnelTips ?? [];

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

  const assignModalStage = assignModalStageId
    ? stages.find((s) => s.id === assignModalStageId) ?? null
    : null;

  return (
    <PageContainer title="퍼널 디자이너" description="사용자 전환 퍼널을 설계하고 각 단계에 상품을 배치합니다." exportId="page-funnel" exportName="퍼널디자이너">
      {/* Genre Funnel Tips */}
      {funnelTips.length > 0 && <FunnelTipsSection tips={funnelTips} />}

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
          variant="secondary"
          size="sm"
          onClick={handleReset}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          초기화
        </Button>
      </div>

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
