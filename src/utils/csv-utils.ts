import type { Product, ProductCategory, UserSegment, RetentionStage, SalesTechnique, ProductContent } from '../models';
import { useProductStore } from '../stores/product-store';

// ─── CSV Column Headers ───
const CSV_HEADERS = [
  'name',
  'description',
  'category',
  'priceUSD',
  'priceKRW',
  'targetSegments',
  'targetRetentionStage',
  'salesTechnique',
  'isPaid',
  'purchaseLimit_type',
  'purchaseLimit_maxCount',
  'contents_json',
] as const;

// ─── CSV Escape ───
function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// ─── Product → CSV Row ───
function productToCsvRow(product: Product): string {
  const fields = [
    product.name,
    product.description,
    product.category,
    String(product.priceUSD),
    String(product.priceKRW),
    (product.targetSegments as readonly string[]).join('|'),
    product.targetRetentionStage,
    product.salesTechnique ?? 'standard',
    product.isPaid !== false ? 'true' : 'false',
    product.purchaseLimit.type,
    String(product.purchaseLimit.maxCount),
    JSON.stringify(product.contents),
  ];
  return fields.map(escapeCsvField).join(',');
}

// ─── Download Current Products as CSV ───
export function downloadProductsCsv(): void {
  const products = useProductStore.getState().products;
  if (products.length === 0) {
    throw new Error('내보낼 상품이 없습니다.');
  }

  const header = CSV_HEADERS.join(',');
  const rows = products.map(productToCsvRow);
  const csvContent = [header, ...rows].join('\n');

  downloadFile(csvContent, `PayingTool_Products_${formatDate()}.csv`, 'text/csv;charset=utf-8');
}

// ─── Download Sample CSV Template ───
export function downloadSampleCsv(): void {
  const sampleProducts: Array<Omit<Product, 'id' | 'projectId' | 'funnelStageId' | 'sortOrder' | 'isActive' | 'createdAt' | 'updatedAt'>> = [
    {
      name: '스타터 팩',
      description: '첫 결제 유도를 위한 초특가 패키지. 가치 3~5배.',
      category: 'starter_pack',
      priceUSD: 0.99,
      priceKRW: 1350,
      targetSegments: ['non_payer'],
      targetRetentionStage: 'd1',
      salesTechnique: 'first_purchase',
      isPaid: true,
      purchaseLimit: { type: 'once', maxCount: 1 },
      contents: [{ itemName: '다이아몬드', quantity: 100, description: '프리미엄 재화' }],
    },
    {
      name: '시즌 패스',
      description: '시즌별 보상 트랙을 개방하는 패스권. 30일간 매일 보상 지급.',
      category: 'battle_pass',
      priceUSD: 9.99,
      priceKRW: 13500,
      targetSegments: ['minnow', 'dolphin'],
      targetRetentionStage: 'd7',
      salesTechnique: 'standard',
      isPaid: true,
      purchaseLimit: { type: 'monthly', maxCount: 1 },
      contents: [{ itemName: '시즌 패스 티켓', quantity: 1, description: '프리미엄 보상 트랙 해금' }],
    },
    {
      name: '릴레이 성장 번들 1단계',
      description: '1단계 구매 후 2단계 번들 해금. 단계별로 가치 상승.',
      category: 'bundle',
      priceUSD: 4.99,
      priceKRW: 6750,
      targetSegments: ['minnow'],
      targetRetentionStage: 'd3',
      salesTechnique: 'relay',
      isPaid: true,
      purchaseLimit: { type: 'once', maxCount: 1 },
      contents: [{ itemName: '골드', quantity: 5000, description: '기본 재화' }, { itemName: '경험치 부스트', quantity: 3, description: '2배 경험치 (1일)' }],
    },
    {
      name: '플래시 세일 보석 팩',
      description: '2시간 한정! 보석 200% 추가 지급. 놓치면 다음 기회는 랜덤.',
      category: 'currency_pack',
      priceUSD: 19.99,
      priceKRW: 27000,
      targetSegments: ['dolphin', 'whale'],
      targetRetentionStage: 'd14',
      salesTechnique: 'flash_sale',
      isPaid: true,
      purchaseLimit: { type: 'daily', maxCount: 1 },
      contents: [{ itemName: '다이아몬드', quantity: 1500, description: '프리미엄 재화 (200% 보너스)' }],
    },
    {
      name: '오퍼월 보상',
      description: '광고 시청 또는 미션 완료 시 무료 재화 지급. 스테이지 실패 후 노출.',
      category: 'other',
      priceUSD: 0,
      priceKRW: 0,
      targetSegments: ['offerwall', 'non_payer'],
      targetRetentionStage: 'd1',
      salesTechnique: 'popup',
      isPaid: false,
      purchaseLimit: { type: 'daily', maxCount: 5 },
      contents: [{ itemName: '골드', quantity: 200, description: '보상형 광고 시청 보상' }],
    },
  ];

  const header = CSV_HEADERS.join(',');
  const rows = sampleProducts.map((p) => {
    const fields = [
      p.name,
      p.description,
      p.category,
      String(p.priceUSD),
      String(p.priceKRW),
      (p.targetSegments as readonly string[]).join('|'),
      p.targetRetentionStage,
      p.salesTechnique,
      p.isPaid ? 'true' : 'false',
      p.purchaseLimit.type,
      String(p.purchaseLimit.maxCount),
      JSON.stringify(p.contents),
    ];
    return fields.map(escapeCsvField).join(',');
  });

  const csvContent = [header, ...rows].join('\n');
  downloadFile(csvContent, `PayingTool_SampleTemplate.csv`, 'text/csv;charset=utf-8');
}

// ─── Import Products from CSV File ───
export interface CsvImportResult {
  readonly success: boolean;
  readonly count: number;
  readonly errors: readonly string[];
}

export async function importProductsFromCsv(file: File): Promise<CsvImportResult> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return { success: false, count: 0, errors: ['CSV 파일에 데이터가 없습니다. 헤더와 최소 1행의 데이터가 필요합니다.'] };
  }

  const errors: string[] = [];
  const products: Product[] = [];
  const now = new Date().toISOString();

  // Skip header (line 0)
  for (let i = 1; i < lines.length; i++) {
    try {
      const fields = parseCsvLine(lines[i]!);
      if (fields.length < 7) {
        errors.push(`${i + 1}행: 필수 컬럼 부족 (최소 7개 필요, ${fields.length}개 발견)`);
        continue;
      }

      const product: Product = {
        id: `csv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        projectId: '',
        name: fields[0] ?? '',
        description: fields[1] ?? '',
        category: (fields[2] ?? 'other') as ProductCategory,
        priceUSD: parseFloat(fields[3] ?? '0') || 0,
        priceKRW: parseInt(fields[4] ?? '0', 10) || 0,
        targetSegments: (fields[5] ?? 'minnow').split('|').filter(Boolean) as UserSegment[],
        targetRetentionStage: (fields[6] ?? 'd7') as RetentionStage,
        salesTechnique: (fields[7] ?? 'standard') as SalesTechnique,
        isPaid: (fields[8] ?? 'true') !== 'false',
        purchaseLimit: {
          type: (fields[9] ?? 'unlimited') as Product['purchaseLimit']['type'],
          maxCount: parseInt(fields[10] ?? '0', 10) || 0,
        },
        funnelStageId: null,
        contents: parseContentsJson(fields[11]),
        sortOrder: i - 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      if (!product.name.trim()) {
        errors.push(`${i + 1}행: 상품명이 비어있습니다`);
        continue;
      }

      products.push(product);
    } catch (err) {
      errors.push(`${i + 1}행: 파싱 오류 — ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (products.length > 0) {
    const store = useProductStore.getState();
    for (const product of products) {
      store.addProduct(product);
    }
  }

  return {
    success: products.length > 0,
    count: products.length,
    errors,
  };
}

// ─── CSV Line Parser (handles quoted fields) ───
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i]!;
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  fields.push(current);
  return fields;
}

// ─── Parse contents JSON field ───
function parseContentsJson(json: string | undefined): readonly ProductContent[] {
  if (!json || json.trim().length === 0) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item: Record<string, unknown>) => ({
      itemName: String(item.itemName ?? ''),
      quantity: Number(item.quantity ?? 1),
      description: String(item.description ?? ''),
    }));
  } catch {
    return [];
  }
}

// ─── Helper: Download file ───
function downloadFile(content: string, filename: string, mimeType: string): void {
  const bom = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([bom + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Helper: Format date ───
function formatDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
