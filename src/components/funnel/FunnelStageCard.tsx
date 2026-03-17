import { useState } from 'react';
import { Package, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { FunnelStage, Product } from '../../models';
import { formatPercent, formatNumber, formatUSD } from '../../utils/formatters';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface FunnelStageCardProps {
  readonly stage: FunnelStage;
  readonly userCount: number;
  readonly widthPercent: number;
  readonly onConversionChange: (rate: number) => void;
  readonly onAssignProduct: () => void;
  readonly onRemoveProduct: (productId: string) => void;
  readonly assignedProducts: readonly Product[];
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}

export default function FunnelStageCard({
  stage,
  userCount,
  widthPercent,
  onConversionChange,
  onAssignProduct,
  onRemoveProduct,
  assignedProducts,
  isSelected,
  onSelect,
}: FunnelStageCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [rateInput, setRateInput] = useState(String(Math.round(stage.conversionRate * 100)));
  const [expanded, setExpanded] = useState(false);

  const handleRateSubmit = () => {
    const parsed = parseFloat(rateInput);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      onConversionChange(parsed / 100);
    }
    setIsEditing(false);
  };

  const stageRevenue = assignedProducts.reduce((sum, p) => sum + p.priceUSD * userCount * 0.01, 0);

  return (
    <div
      className={`relative transition-all duration-300 ${isSelected ? 'ring-2 ring-brand-500' : ''}`}
      style={{ width: `${Math.max(widthPercent, 30)}%`, margin: '0 auto' }}
    >
      <div
        onClick={onSelect}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-500 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-full">
              {stage.order + 1}
            </span>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{stage.label}</h4>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-2">
          {/* Conversion Rate */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">전환율:</span>
            {isEditing ? (
              <input
                type="number"
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                onBlur={handleRateSubmit}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRateSubmit(); }}
                onClick={(e) => e.stopPropagation()}
                className="w-16 px-1.5 py-0.5 text-xs rounded border border-brand-300 dark:border-brand-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                min="0"
                max="100"
                autoFocus
              />
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                {formatPercent(stage.conversionRate)}
              </button>
            )}
          </div>

          {/* User Count */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">유저:</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {formatNumber(Math.round(userCount))}
            </span>
          </div>
        </div>

        {/* Products */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {assignedProducts.slice(0, 3).map((product) => (
            <div key={product.id} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full pl-2 pr-1 py-0.5">
              <Package className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-700 dark:text-gray-300 max-w-[100px] truncate">{product.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onRemoveProduct(product.id); }}
                className="p-0.5 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {assignedProducts.length > 3 && (
            <Badge variant="default" size="sm">+{assignedProducts.length - 3}</Badge>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onAssignProduct(); }}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          상품 배치
        </Button>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
            {stage.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{stage.description}</p>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <span>예상 수익 기여:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{formatUSD(stageRevenue)}</span>
            </div>
            {assignedProducts.length > 3 && (
              <div className="flex flex-wrap gap-1.5">
                {assignedProducts.slice(3).map((product) => (
                  <div key={product.id} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full pl-2 pr-1 py-0.5">
                    <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{product.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); onRemoveProduct(product.id); }} className="p-0.5 text-gray-400 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
