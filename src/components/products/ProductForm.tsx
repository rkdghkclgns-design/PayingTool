import { useState, useEffect, useMemo } from 'react';
import { Plus, X } from 'lucide-react';
import type { Product, ProductCategory, UserSegment, RetentionStage, ProductContent, PurchaseLimit } from '../../models';
import type { PriceTier } from '../../models/genre-blueprint';
import {
  PRODUCT_CATEGORY_LABELS,
  USER_SEGMENT_LABELS,
  RETENTION_STAGE_LABELS,
  KRW_USD_RATE,
} from '../../utils/constants';
import { useMindmapStore } from '../../stores/mindmap-store';
import { getGenreBlueprint } from '../../data/genre-blueprints/index';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface ProductFormProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (product: Product) => void;
  readonly editingProduct: Product | null;
  readonly projectId: string;
}

interface FormState {
  readonly name: string;
  readonly description: string;
  readonly category: ProductCategory;
  readonly targetSegments: readonly UserSegment[];
  readonly targetRetentionStage: RetentionStage;
  readonly priceUSD: string;
  readonly contents: readonly ProductContent[];
  readonly purchaseLimitType: PurchaseLimit['type'];
  readonly purchaseLimitMaxCount: string;
}

const ALL_SEGMENTS: readonly UserSegment[] = ['non_payer', 'minnow', 'dolphin', 'whale', 'super_whale'];

function buildInitialState(product: Product | null): FormState {
  if (product) {
    return {
      name: product.name,
      description: product.description,
      category: product.category,
      targetSegments: product.targetSegments,
      targetRetentionStage: product.targetRetentionStage,
      priceUSD: String(product.priceUSD),
      contents: product.contents,
      purchaseLimitType: product.purchaseLimit.type,
      purchaseLimitMaxCount: String(product.purchaseLimit.maxCount),
    };
  }
  return {
    name: '',
    description: '',
    category: 'starter_pack',
    targetSegments: ['non_payer'],
    targetRetentionStage: 'd3',
    priceUSD: '',
    contents: [{ itemName: '', quantity: 0, description: '' }],
    purchaseLimitType: 'once',
    purchaseLimitMaxCount: '1',
  };
}

const categoryOptions = Array.from(PRODUCT_CATEGORY_LABELS.entries()).map(([value, label]) => ({ value, label }));
const retentionOptions = Array.from(RETENTION_STAGE_LABELS.entries()).map(([value, label]) => ({ value, label }));
const limitTypeOptions = [
  { value: 'once', label: '1회 한정' },
  { value: 'daily', label: '일일 제한' },
  { value: 'weekly', label: '주간 제한' },
  { value: 'monthly', label: '월간 제한' },
  { value: 'unlimited', label: '무제한' },
];

export default function ProductForm({ isOpen, onClose, onSubmit, editingProduct, projectId }: ProductFormProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(editingProduct));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Re-initialize form when editingProduct changes
  useEffect(() => {
    setForm(buildInitialState(editingProduct));
    setErrors({});
  }, [editingProduct]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const toggleSegment = (segment: UserSegment) => {
    const current = form.targetSegments;
    const updated = current.includes(segment)
      ? current.filter((s) => s !== segment)
      : [...current, segment];
    updateField('targetSegments', updated);
  };

  // ── Genre-based price suggestion ──────────────
  const genre = useMindmapStore((s) => s.analysisResult?.genre);
  const blueprint = genre ? getGenreBlueprint(genre) : undefined;

  const suggestedTier: PriceTier | undefined = useMemo(() => {
    if (!blueprint) return undefined;
    const segments = form.targetSegments;
    const tierName: PriceTier['tier'] =
      segments.includes('whale') || segments.includes('super_whale')
        ? 'whale'
        : segments.includes('dolphin')
          ? 'mid'
          : 'starter';
    return blueprint.priceTiers.find((t) => t.tier === tierName);
  }, [blueprint, form.targetSegments]);

  const applySuggestedPrice = () => {
    if (!suggestedTier) return;
    const midpoint = ((suggestedTier.minUsd + suggestedTier.maxUsd) / 2).toFixed(2);
    updateField('priceUSD', midpoint);
  };

  const updateContent = (index: number, field: keyof ProductContent, value: string | number) => {
    const updated = form.contents.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    );
    updateField('contents', updated);
  };

  const addContent = () => {
    updateField('contents', [...form.contents, { itemName: '', quantity: 0, description: '' }]);
  };

  const removeContent = (index: number) => {
    updateField('contents', form.contents.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = '상품명을 입력해주세요';
    const usd = parseFloat(form.priceUSD);
    if (isNaN(usd) || usd <= 0) newErrors.priceUSD = '가격은 0보다 커야 합니다';
    if (form.targetSegments.length === 0) newErrors.targetSegments = '대상 세그먼트를 1개 이상 선택하세요';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const usd = parseFloat(form.priceUSD);
    const now = new Date().toISOString();
    const product: Product = {
      id: editingProduct?.id ?? `product-${Date.now()}`,
      projectId,
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      priceUSD: usd,
      priceKRW: Math.round(usd * KRW_USD_RATE),
      targetSegments: form.targetSegments,
      targetRetentionStage: form.targetRetentionStage,
      contents: form.contents.filter((c) => c.itemName.trim() !== ''),
      purchaseLimit: {
        type: form.purchaseLimitType,
        maxCount: form.purchaseLimitType === 'unlimited' ? 0 : parseInt(form.purchaseLimitMaxCount, 10) || 1,
      },
      funnelStageId: editingProduct?.funnelStageId ?? null,
      salesTechnique: editingProduct?.salesTechnique ?? 'standard',
      isPaid: editingProduct?.isPaid ?? true,
      sortOrder: editingProduct?.sortOrder ?? 0,
      isActive: editingProduct?.isActive ?? true,
      createdAt: editingProduct?.createdAt ?? now,
      updatedAt: now,
    };
    onSubmit(product);
    onClose();
  };

  const priceKRWPreview = parseFloat(form.priceUSD) > 0
    ? Math.round(parseFloat(form.priceUSD) * KRW_USD_RATE)
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingProduct ? '상품 수정' : '상품 추가'} size="lg">
      <div className="space-y-4">
        <Input label="상품명 *" value={form.name} onChange={(v) => updateField('name', v)} placeholder="예: 스타터 팩" error={errors.name} />
        <Input label="설명" value={form.description} onChange={(v) => updateField('description', v)} placeholder="상품 설명을 입력하세요" />
        <Select label="카테고리" options={categoryOptions} value={form.category} onChange={(v) => updateField('category', v as ProductCategory)} />

        {/* Target Segments */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">대상 세그먼트 *</span>
          <div className="flex flex-wrap gap-2">
            {ALL_SEGMENTS.map((seg) => (
              <label key={seg} className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" checked={form.targetSegments.includes(seg)} onChange={() => toggleSegment(seg)}
                  className="rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800" />
                {USER_SEGMENT_LABELS.get(seg)}
              </label>
            ))}
          </div>
          {errors.targetSegments && <p className="text-sm text-red-500">{errors.targetSegments}</p>}
        </div>

        <Select label="대상 리텐션 단계" options={retentionOptions} value={form.targetRetentionStage} onChange={(v) => updateField('targetRetentionStage', v as RetentionStage)} />

        {/* Price */}
        <div className="flex flex-col gap-1">
          <div className="flex items-end gap-3">
            <Input label="가격 (USD) *" type="number" value={form.priceUSD} onChange={(v) => updateField('priceUSD', v)} placeholder="0.99" error={errors.priceUSD} className="flex-1" />
            <div className="pb-1 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {priceKRWPreview > 0 ? `= ₩${priceKRWPreview.toLocaleString('ko-KR')}` : ''}
            </div>
          </div>
          {suggestedTier && blueprint && (
            <button
              type="button"
              onClick={applySuggestedPrice}
              className="self-start text-xs text-brand-500 cursor-pointer hover:underline"
            >
              추천 가격: ${suggestedTier.minUsd.toFixed(2)} - ${suggestedTier.maxUsd.toFixed(2)} ({blueprint.genreLabelKo} 장르 {suggestedTier.labelKo} 티어)
            </button>
          )}
        </div>

        {/* Contents */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">구성품</span>
          {form.contents.map((content, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <input value={content.itemName} onChange={(e) => updateContent(idx, 'itemName', e.target.value)} placeholder="아이템명"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <input type="number" value={content.quantity || ''} onChange={(e) => updateContent(idx, 'quantity', parseInt(e.target.value, 10) || 0)} placeholder="수량"
                className="w-20 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <input value={content.description} onChange={(e) => updateContent(idx, 'description', e.target.value)} placeholder="설명"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              {form.contents.length > 1 && (
                <button onClick={() => removeContent(idx)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" aria-label="구성품 삭제">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={addContent} icon={<Plus className="w-4 h-4" />}>구성품 추가</Button>
        </div>

        {/* Purchase Limit */}
        <div className="flex items-end gap-3">
          <Select label="구매 제한" options={limitTypeOptions} value={form.purchaseLimitType} onChange={(v) => updateField('purchaseLimitType', v as PurchaseLimit['type'])} className="flex-1" />
          {form.purchaseLimitType !== 'unlimited' && form.purchaseLimitType !== 'once' && (
            <Input label="최대 횟수" type="number" value={form.purchaseLimitMaxCount} onChange={(v) => updateField('purchaseLimitMaxCount', v)} className="w-28" />
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button variant="primary" onClick={handleSubmit}>{editingProduct ? '수정' : '추가'}</Button>
        </div>
      </div>
    </Modal>
  );
}
