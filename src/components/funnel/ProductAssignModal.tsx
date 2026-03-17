import { useState, useMemo } from 'react';
import { Package, Check, Search } from 'lucide-react';
import type { Product, FunnelStage } from '../../models';
import { PRODUCT_CATEGORY_LABELS } from '../../utils/constants';
import { formatUSD } from '../../utils/formatters';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface ProductAssignModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly stage: FunnelStage;
  readonly allProducts: readonly Product[];
  readonly onAssign: (productId: string) => void;
  readonly onRemove: (productId: string) => void;
}

export default function ProductAssignModal({
  isOpen,
  onClose,
  stage,
  allProducts,
  onAssign,
  onRemove,
}: ProductAssignModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return allProducts;
    const query = searchQuery.toLowerCase();
    return allProducts.filter(
      (p) => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query),
    );
  }, [allProducts, searchQuery]);

  const assignedSet = useMemo(
    () => new Set(stage.assignedProductIds),
    [stage.assignedProductIds],
  );

  const toggleProduct = (productId: string) => {
    if (assignedSet.has(productId)) {
      onRemove(productId);
    } else {
      onAssign(productId);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${stage.label} - 상품 배치`} size="lg">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="상품 검색..."
            className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Product List */}
        {filteredProducts.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            등록된 상품이 없습니다. 상품 빌더에서 상품을 먼저 추가하세요.
          </p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredProducts.map((product) => {
              const isAssigned = assignedSet.has(product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => toggleProduct(product.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                    isAssigned
                      ? 'border-brand-300 bg-brand-50 dark:border-brand-700 dark:bg-brand-950'
                      : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                    isAssigned
                      ? 'bg-brand-500 text-white'
                      : 'border border-gray-300 dark:border-gray-600'
                  }`}>
                    {isAssigned && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 block truncate">
                      {product.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {PRODUCT_CATEGORY_LABELS.get(product.category)} | {formatUSD(product.priceUSD)}
                    </span>
                  </div>
                  <Badge variant={isAssigned ? 'primary' : 'default'} size="sm">
                    {isAssigned ? '배치됨' : '미배치'}
                  </Badge>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button variant="primary" onClick={onClose}>완료</Button>
        </div>
      </div>
    </Modal>
  );
}
