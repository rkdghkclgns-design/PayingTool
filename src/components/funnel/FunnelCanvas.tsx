import { useMemo } from 'react';
import { ArrowDown } from 'lucide-react';
import type { FunnelStage, Product } from '../../models';
import FunnelStageCard from './FunnelStageCard';

interface FunnelCanvasProps {
  readonly stages: readonly FunnelStage[];
  readonly totalUsers: number;
  readonly allProducts: readonly Product[];
  readonly selectedStageId: string | null;
  readonly onSelectStage: (stageId: string) => void;
  readonly onConversionChange: (stageId: string, rate: number) => void;
  readonly onAssignProduct: (stageId: string) => void;
  readonly onRemoveProduct: (stageId: string, productId: string) => void;
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
}: FunnelCanvasProps) {
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
          />
          {index < stageData.length - 1 && (
            <div className="flex justify-center py-1">
              <ArrowDown className="w-4 h-4 text-gray-300 dark:text-gray-600" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
