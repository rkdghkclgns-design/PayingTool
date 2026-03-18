import { Pencil, Trash2, Package } from 'lucide-react';
import type { Product } from '../../models';
import { PRODUCT_CATEGORY_LABELS, RETENTION_STAGE_LABELS, SALES_TECHNIQUE_LABELS } from '../../utils/constants';
import { formatPrice } from '../../utils/formatters';
import Badge from '../ui/Badge';

interface ProductCardProps {
  readonly product: Product;
  readonly onEdit: (product: Product) => void;
  readonly onDelete: (productId: string) => void;
}

const PURCHASE_LIMIT_LABELS: Record<string, string> = {
  once: '1회 한정',
  daily: '일일',
  weekly: '주간',
  monthly: '월간',
  unlimited: '무제한',
};

function formatPurchaseLimit(product: Product): string {
  const typeLabel = PURCHASE_LIMIT_LABELS[product.purchaseLimit.type] ?? product.purchaseLimit.type;
  if (product.purchaseLimit.type === 'unlimited') return typeLabel;
  if (product.purchaseLimit.type === 'once') return typeLabel;
  return `${typeLabel} ${product.purchaseLimit.maxCount}회`;
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const categoryLabel = PRODUCT_CATEGORY_LABELS.get(product.category) ?? product.category;
  const retentionLabel = RETENTION_STAGE_LABELS.get(product.targetRetentionStage) ?? product.targetRetentionStage;
  const contentsSummary = product.contents.length > 0
    ? product.contents.slice(0, 3).map((c) => c.itemName).join(', ')
    : '-';
  const hasMoreContents = product.contents.length > 3;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950 flex items-center justify-center flex-shrink-0">
            <Package className="w-4 h-4 text-brand-500" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {product.name}
          </h4>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <button
            onClick={() => onEdit(product)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors"
            aria-label="수정"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            aria-label="삭제"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge variant="primary" size="sm">{categoryLabel}</Badge>
        <Badge variant="warning" size="sm">{retentionLabel}</Badge>
        {product.salesTechnique && product.salesTechnique !== 'standard' && (
          <Badge
            variant={
              product.salesTechnique === 'relay' || product.salesTechnique === 'bundle_step' ? 'danger'
              : product.salesTechnique === 'flash_sale' || product.salesTechnique === 'limited_time' ? 'warning'
              : product.salesTechnique === 'first_purchase' || product.salesTechnique === 'comeback' ? 'success'
              : 'primary'
            }
            size="sm"
          >
            {SALES_TECHNIQUE_LABELS.get(product.salesTechnique) ?? product.salesTechnique}
          </Badge>
        )}
        {product.isPaid === false && (
          <Badge variant="success" size="sm">비유료</Badge>
        )}
      </div>

      {/* Price */}
      <div className="mb-3">
        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {formatPrice(product.priceKRW, product.priceUSD)}
        </span>
      </div>

      {/* Contents */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">구성품</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
          {contentsSummary}
          {hasMoreContents && ` 외 ${product.contents.length - 3}건`}
        </p>
      </div>

      {/* Purchase Limit */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          구매 제한: {formatPurchaseLimit(product)}
        </span>
      </div>
    </div>
  );
}
