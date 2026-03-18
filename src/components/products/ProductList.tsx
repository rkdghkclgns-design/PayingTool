import { useState, useMemo } from 'react';
import { ArrowUpDown, Pencil, Trash2, CheckSquare, Square } from 'lucide-react';
import type { Product } from '../../models';
import { PRODUCT_CATEGORY_LABELS, RETENTION_STAGE_LABELS } from '../../utils/constants';
import { formatProductPrice } from '../../utils/formatters';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface ProductListProps {
  readonly products: readonly Product[];
  readonly onEdit: (product: Product) => void;
  readonly onDelete: (productId: string) => void;
  readonly onBulkDelete: (productIds: readonly string[]) => void;
}

type SortField = 'name' | 'priceUSD' | 'category';
type SortDir = 'asc' | 'desc';

export default function ProductList({ products, onEdit, onDelete, onBulkDelete }: ProductListProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());

  const sortedProducts = useMemo(() => {
    const sorted = [...products].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name': cmp = a.name.localeCompare(b.name, 'ko'); break;
        case 'priceUSD': cmp = a.priceUSD - b.priceUSD; break;
        case 'category': cmp = a.category.localeCompare(b.category); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [products, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };

  const handleBulkDelete = () => {
    onBulkDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button onClick={() => toggleSort(field)} className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
      {label}
      <ArrowUpDown className={`w-3 h-3 ${sortField === field ? 'text-brand-500' : ''}`} />
    </button>
  );

  const allSelected = products.length > 0 && selectedIds.size === products.length;

  return (
    <div>
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
          <span className="text-sm text-red-700 dark:text-red-300">{selectedIds.size}개 선택됨</span>
          <Button variant="danger" size="sm" onClick={handleBulkDelete}>선택 삭제</Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="py-3 px-2 text-left w-10">
                <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                </button>
              </th>
              <th className="py-3 px-2 text-left"><SortButton field="name" label="상품명" /></th>
              <th className="py-3 px-2 text-left"><SortButton field="category" label="카테고리" /></th>
              <th className="py-3 px-2 text-right"><SortButton field="priceUSD" label="가격" /></th>
              <th className="py-3 px-2 text-left">리텐션</th>
              <th className="py-3 px-2 text-center">구성품</th>
              <th className="py-3 px-2 text-right">작업</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map((product) => (
              <tr key={product.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="py-3 px-2">
                  <button onClick={() => toggleSelect(product.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {selectedIds.has(product.id) ? <CheckSquare className="w-4 h-4 text-brand-500" /> : <Square className="w-4 h-4" />}
                  </button>
                </td>
                <td className="py-3 px-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{product.name}</span>
                </td>
                <td className="py-3 px-2">
                  <Badge variant="primary" size="sm">{PRODUCT_CATEGORY_LABELS.get(product.category) ?? product.category}</Badge>
                </td>
                <td className="py-3 px-2 text-right whitespace-nowrap">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{formatProductPrice(product.priceKRW, product.priceUSD)}</span>
                </td>
                <td className="py-3 px-2">
                  <Badge variant="warning" size="sm">{RETENTION_STAGE_LABELS.get(product.targetRetentionStage) ?? product.targetRetentionStage}</Badge>
                </td>
                <td className="py-3 px-2 text-center text-gray-500">{product.contents.length}개</td>
                <td className="py-3 px-2">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onEdit(product)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors" aria-label="수정">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(product.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors" aria-label="삭제">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
