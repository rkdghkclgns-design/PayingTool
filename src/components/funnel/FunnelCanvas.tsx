import { useMemo, useState } from 'react';
import { ArrowDown, Plus } from 'lucide-react';
import type { FunnelStage, Product } from '../../models';
import FunnelStageCard from './FunnelStageCard';
import Button from '../ui/Button';

interface FunnelCanvasProps {
  readonly stages: readonly FunnelStage[];
  readonly totalUsers: number;
  readonly allProducts: readonly Product[];
  readonly selectedStageId: string | null;
  readonly onSelectStage: (stageId: string) => void;
  readonly onConversionChange: (stageId: string, rate: number) => void;
  readonly onAssignProduct: (stageId: string) => void;
  readonly onRemoveProduct: (stageId: string, productId: string) => void;
  readonly onLabelChange: (stageId: string, label: string) => void;
  readonly onDescriptionChange: (stageId: string, description: string) => void;
  readonly onRemoveStage: (stageId: string) => void;
  readonly onAddStage: (label: string, description: string) => void;
}

export default function FunnelCanvas({
  stages,
  totalUsers,
  allProducts,
  selectedStageId,
  onSelectStage,
  onConversionChange,
  onAssignProduct,
  onRemoveProduct,
  onLabelChange,
  onDescriptionChange,
  onRemoveStage,
  onAddStage,
}: FunnelCanvasProps) {
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const canDeleteStages = stages.length > 2;

  const stageData = useMemo(() => {
    let cumulativeUsers = totalUsers;
    return stages.map((stage, index) => {
      if (index === 0) {
        cumulativeUsers = totalUsers * stage.conversionRate;
      } else {
        cumulativeUsers = cumulativeUsers * stage.conversionRate;
      }
      const widthPercent = totalUsers > 0
        ? (cumulativeUsers / totalUsers) * 100
        : 100 - index * 8;
      const assignedProducts = stage.assignedProductIds
        .map((pid) => allProducts.find((p) => p.id === pid))
        .filter((p): p is Product => p !== undefined);
      return {
        stage,
        userCount: cumulativeUsers,
        widthPercent: Math.max(widthPercent, 30),
        assignedProducts,
      };
    });
  }, [stages, totalUsers, allProducts]);

  const handleAddStageSubmit = () => {
    const trimmedLabel = newLabel.trim();
    if (trimmedLabel.length === 0) {
      return;
    }
    onAddStage(trimmedLabel, newDescription.trim());
    setNewLabel('');
    setNewDescription('');
    setIsAddingStage(false);
  };

  const handleAddStageCancel = () => {
    setNewLabel('');
    setNewDescription('');
    setIsAddingStage(false);
  };

  return (
    <div className="space-y-2">
      {stageData.map((data, index) => (
        <div key={data.stage.id}>
          <FunnelStageCard
            stage={data.stage}
            userCount={data.userCount}
            widthPercent={data.widthPercent}
            onConversionChange={(rate) => onConversionChange(data.stage.id, rate)}
            onAssignProduct={() => onAssignProduct(data.stage.id)}
            onRemoveProduct={(pid) => onRemoveProduct(data.stage.id, pid)}
            assignedProducts={data.assignedProducts}
            isSelected={selectedStageId === data.stage.id}
            onSelect={() => onSelectStage(data.stage.id)}
            onLabelChange={(label) => onLabelChange(data.stage.id, label)}
            onDescriptionChange={(desc) => onDescriptionChange(data.stage.id, desc)}
            onRemove={() => onRemoveStage(data.stage.id)}
            canDelete={canDeleteStages}
          />
          {index < stageData.length - 1 && (
            <div className="flex justify-center py-1">
              <ArrowDown className="w-4 h-4 text-gray-300 dark:text-gray-600" />
            </div>
          )}
        </div>
      ))}

      {/* Add Stage Section */}
      <div className="flex justify-center pt-2">
        <ArrowDown className="w-4 h-4 text-gray-300 dark:text-gray-600" />
      </div>

      {isAddingStage ? (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-900 border border-dashed border-brand-300 dark:border-brand-700 rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            새 단계 추가
          </h4>
          <div className="space-y-2">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="단계 이름"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddStageSubmit();
                if (e.key === 'Escape') handleAddStageCancel();
              }}
            />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="단계 설명 (선택사항)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleAddStageCancel();
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddStageSubmit}
              disabled={newLabel.trim().length === 0}
            >
              추가
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddStageCancel}
            >
              취소
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAddingStage(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            새 단계 추가
          </Button>
        </div>
      )}
    </div>
  );
}
