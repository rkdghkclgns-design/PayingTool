import { useState, useMemo, useCallback, useRef } from 'react';
import { Plus, Upload, FileDown, LayoutGrid, List, Package, Lightbulb, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Product, UserSegment, ProductCategory } from '../../models';
import { USER_SEGMENT_LABELS, PRODUCT_CATEGORY_LABELS } from '../../utils/constants';
import { useProductStore } from '../../stores/product-store';
import { useGenreStore } from '../../stores/genre-store';
import { useProjectStore } from '../../stores/project-store';
import { downloadSampleCsv, importProductsFromCsv } from '../../utils/csv-utils';
import PageContainer from '../layout/PageContainer';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import AiProductMixPanel from './AiProductMixPanel';
import PriceTierGuidance from './PriceTierGuidance';
import SegmentTabs from './SegmentTabs';
import ProductCard from './ProductCard';
import ProductList from './ProductList';
import ProductForm from './ProductForm';

type ViewMode = 'grid' | 'list';

const ALL_SEGMENTS: readonly UserSegment[] = ['offerwall', 'non_payer', 'minnow', 'dolphin', 'whale', 'super_whale'];

// 장르별 필수 카테고리
const ESSENTIAL_CATEGORIES: Readonly<Record<string, readonly { category: ProductCategory; reason: string }[]>> = {
  rpg: [
    { category: 'battle_pass', reason: '리텐션 향상의 핵심 상품' },
    { category: 'starter_pack', reason: 'NPU 전환에 효과적' },
    { category: 'gacha', reason: 'RPG 핵심 수익 모델' },
    { category: 'vip', reason: '고과금 유저 유지' },
    { category: 'remove_ads', reason: 'NPU 첫 결제 유도' },
  ],
  casual: [
    { category: 'remove_ads', reason: '캐주얼 필수 상품' },
    { category: 'energy', reason: '에너지 기반 게임에 필수' },
    { category: 'starter_pack', reason: 'NPU 전환율 향상' },
    { category: 'cosmetic', reason: '캐주얼 유저 선호' },
  ],
  puzzle: [
    { category: 'remove_ads', reason: '퍼즐 게임 필수' },
    { category: 'energy', reason: '하트/에너지 시스템' },
    { category: 'boost', reason: '어려운 스테이지 돌파' },
    { category: 'starter_pack', reason: 'NPU 전환' },
  ],
  _default: [
    { category: 'battle_pass', reason: '리텐션 향상에 효과적' },
    { category: 'starter_pack', reason: 'NPU 전환에 필수적' },
    { category: 'remove_ads', reason: '광고 제거 수요' },
  ],
};

// ─── 상품 보강 가이드 ───
function ProductReinforcementGuide({ products, genre }: { readonly products: readonly Product[]; readonly genre: string | null }) {
  const existingCategories = useMemo(
    () => new Set(products.map((p) => p.category)),
    [products],
  );

  const essentials = genre && genre in ESSENTIAL_CATEGORIES
    ? ESSENTIAL_CATEGORIES[genre]
    : ESSENTIAL_CATEGORIES._default;

  const missing = useMemo(
    () => essentials.filter((e) => !existingCategories.has(e.category)),
    [essentials, existingCategories],
  );

  if (products.length === 0 || missing.length === 0) return null;

  return (
    <div className="mb-4 p-4 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
          상품 보강 가이드
        </span>
        <Badge variant="primary" size="sm">{missing.length}개 추천</Badge>
      </div>
      <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
        현재 구성에서 아래 상품 유형을 추가하면 수익 구조가 개선됩니다:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {missing.map((item) => (
          <div
            key={item.category}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-900"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <div>
              <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                {PRODUCT_CATEGORY_LABELS.get(item.category) ?? item.category}
              </span>
              <span className="text-xs text-blue-500 dark:text-blue-400 ml-1.5">
                — {item.reason}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductBuilderPage() {
  const { products, selectedSegment, addProduct, updateProduct, deleteProduct, setSelectedSegment } = useProductStore();
  const selectedGenre = useGenreStore((s) => s.selectedGenre);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [templateToast, setTemplateToast] = useState<string | null>(null);
  const [paidFilter, setPaidFilter] = useState<'paid' | 'free'>('paid');

  // 유료/비유료 분류
  const paidProducts = useMemo(() => products.filter((p) => p.isPaid !== false), [products]);
  const freeProducts = useMemo(() => products.filter((p) => p.isPaid === false), [products]);
  const displayProducts = paidFilter === 'paid' ? paidProducts : freeProducts;

  const productCountBySegment = useMemo(() => {
    const counts = new Map<UserSegment, number>();
    ALL_SEGMENTS.forEach((seg) => {
      const count = displayProducts.filter((p) => p.targetSegments.includes(seg)).length;
      counts.set(seg, count);
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(
    () => displayProducts.filter((p) => p.targetSegments.includes(selectedSegment)),
    [displayProducts, selectedSegment],
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

  // CSV 관련
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [csvError, setCsvError] = useState<string | null>(null);

  const handleDownloadSample = useCallback(() => {
    downloadSampleCsv();
    setTemplateToast('CSV 양식이 다운로드되었습니다');
    setTimeout(() => setTemplateToast(null), 3000);
  }, []);

  const handleCsvImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvError(null);
    try {
      const result = await importProductsFromCsv(file);
      if (result.success) {
        setTemplateToast(`CSV에서 상품 ${result.count}개가 추가되었습니다`);
        setTimeout(() => setTemplateToast(null), 3000);
      }
      if (result.errors.length > 0) {
        setCsvError(result.errors.join('\n'));
        setTimeout(() => setCsvError(null), 8000);
      }
    } catch (err) {
      setCsvError(err instanceof Error ? err.message : 'CSV 가져오기 실패');
      setTimeout(() => setCsvError(null), 5000);
    }

    // Reset file input for re-import
    if (csvInputRef.current) {
      csvInputRef.current.value = '';
    }
  }, []);

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

      {/* Product Reinforcement Guide */}
      <ProductReinforcementGuide products={products} genre={selectedGenre} />

      {/* Paid / Free Tab */}
      <div className="flex items-center gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setPaidFilter('paid')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
            paidFilter === 'paid'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-600 dark:text-brand-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          유료 상품 ({paidProducts.length})
        </button>
        <button
          onClick={() => setPaidFilter('free')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
            paidFilter === 'free'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-green-600 dark:text-green-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          비유료 상품 ({freeProducts.length})
        </button>
      </div>

      {/* Segment Tabs */}
      <SegmentTabs
        activeSegment={selectedSegment}
        onSegmentChange={setSelectedSegment}
        productCountBySegment={productCountBySegment}
      />

      {/* Template toast */}
      {templateToast && (
        <div className="mt-3 mb-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">{templateToast}</span>
        </div>
      )}

      {csvError && (
        <div className="mt-3 mb-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-700 dark:text-red-300 whitespace-pre-line">{csvError}</span>
        </div>
      )}

      {/* Hidden CSV file input */}
      <input
        ref={csvInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleCsvImport}
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between mt-4 mb-4">
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleAdd} icon={<Plus className="w-4 h-4" />}>
            상품 추가
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDownloadSample} icon={<FileDown className="w-4 h-4" />}>
            CSV 양식 다운로드
          </Button>
          <Button variant="secondary" size="sm" onClick={() => csvInputRef.current?.click()} icon={<Upload className="w-4 h-4" />}>
            CSV 가져오기
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
              <Button variant="secondary" size="sm" onClick={() => csvInputRef.current?.click()} icon={<Upload className="w-4 h-4" />}>CSV 가져오기</Button>
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
          projectId={activeProjectId ?? ''}
        />
      )}
    </PageContainer>
  );
}
