import { useState, useMemo, useCallback } from 'react';
import { Plus, Download, LayoutGrid, List, Package } from 'lucide-react';
import type { Product, UserSegment } from '../../models';
import { USER_SEGMENT_LABELS } from '../../utils/constants';
import { useProductStore } from '../../stores/product-store';
import { DEFAULT_PRODUCTS } from '../../data/default-products';
import PageContainer from '../layout/PageContainer';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import AiProductMixPanel from './AiProductMixPanel';
import PriceTierGuidance from './PriceTierGuidance';
import SegmentTabs from './SegmentTabs';
import ProductCard from './ProductCard';
import ProductList from './ProductList';
import ProductForm from './ProductForm';

type ViewMode = 'grid' | 'list';

const ALL_SEGMENTS: readonly UserSegment[] = ['non_payer', 'minnow', 'dolphin', 'whale', 'super_whale'];

export default function ProductBuilderPage() {
  const { products, selectedSegment, addProduct, updateProduct, deleteProduct, setSelectedSegment } = useProductStore();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const productCountBySegment = useMemo(() => {
    const counts = new Map<UserSegment, number>();
    ALL_SEGMENTS.forEach((seg) => {
      const count = products.filter((p) => p.targetSegments.includes(seg)).length;
      counts.set(seg, count);
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(
    () => products.filter((p) => p.targetSegments.includes(selectedSegment)),
    [products, selectedSegment],
  );

  const handleAdd = useCallback(() => {
    setEditingProduct(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteProduct(id);
  }, [deleteProduct]);

  const handleBulkDelete = useCallback((ids: readonly string[]) => {
    ids.forEach((id) => deleteProduct(id));
  }, [deleteProduct]);

  const handleSubmit = useCallback((product: Product) => {
    if (editingProduct) {
      updateProduct(product.id, product);
    } else {
      addProduct(product);
    }
  }, [editingProduct, updateProduct, addProduct]);

  const handleLoadTemplates = useCallback(() => {
    const existingIds = new Set(products.map((p) => p.id));
    DEFAULT_PRODUCTS.forEach((template) => {
      if (!existingIds.has(template.id)) {
        addProduct({ ...template });
      }
    });
  }, [products, addProduct]);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingProduct(null);
  }, []);

  return (
    <PageContainer title="상품 빌더" description="인앱 상품을 설계하고 가격 전략을 수립합니다." exportId="page-products" exportName="상품빌더">
      {/* AI Product Mix Recommendation */}
      <AiProductMixPanel />

      {/* Genre Price Strategy */}
      <PriceTierGuidance />

      {/* Segment Tabs */}
      <SegmentTabs
        activeSegment={selectedSegment}
        onSegmentChange={setSelectedSegment}
        productCountBySegment={productCountBySegment}
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between mt-4 mb-4">
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleAdd} icon={<Plus className="w-4 h-4" />}>
            상품 추가
          </Button>
          <Button variant="secondary" size="sm" onClick={handleLoadTemplates} icon={<Download className="w-4 h-4" />}>
            템플릿 가져오기
          </Button>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
            aria-label="그리드 보기"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
            aria-label="리스트 보기"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="상품이 없습니다"
          description={`${USER_SEGMENT_LABELS.get(selectedSegment) ?? selectedSegment} 세그먼트에 등록된 상품이 없습니다. 상품을 추가하거나 템플릿을 가져오세요.`}
          action={
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleAdd} icon={<Plus className="w-4 h-4" />}>상품 추가</Button>
              <Button variant="secondary" size="sm" onClick={handleLoadTemplates} icon={<Download className="w-4 h-4" />}>템플릿 가져오기</Button>
            </div>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <ProductList products={filteredProducts} onEdit={handleEdit} onDelete={handleDelete} onBulkDelete={handleBulkDelete} />
        </div>
      )}

      {/* Product Form Modal */}
      {isFormOpen && (
        <ProductForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          editingProduct={editingProduct}
          projectId=""
        />
      )}
    </PageContainer>
  );
}
