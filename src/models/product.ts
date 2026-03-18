export type ProductCategory =
  | 'currency_pack'
  | 'subscription'
  | 'battle_pass'
  | 'starter_pack'
  | 'piggy_bank'
  | 'limited_offer'
  | 'cosmetic'
  | 'gacha'
  | 'energy'
  | 'boost'
  | 'bundle'
  | 'vip'
  | 'probability_package'
  | 'pass'
  | 'remove_ads'
  | 'other';

export type UserSegment =
  | 'offerwall'
  | 'non_payer'
  | 'minnow'
  | 'dolphin'
  | 'whale'
  | 'super_whale';

export type RetentionStage =
  | 'd1'
  | 'd3'
  | 'd7'
  | 'd14'
  | 'd30'
  | 'd60'
  | 'd90'
  | 'd180'
  | 'd365';

export interface ProductContent {
  readonly itemName: string;
  readonly quantity: number;
  readonly description: string;
}

export type SalesTechnique =
  | 'standard'       // 상시 판매
  | 'relay'          // 릴레이 (전단계 구매 필요)
  | 'popup'          // 팝업 오퍼 (조건 달성 시 노출)
  | 'custom'         // 맞춤 오퍼 (유저 데이터 기반 개인화)
  | 'limited_time'   // 기간 한정 판매
  | 'first_purchase' // 첫 결제 전용 (1회 한정 초특가)
  | 'level_up'       // 레벨업/성장 오퍼
  | 'comeback'       // 복귀 유저 전용
  | 'bundle_step'    // 단계별 번들 (구매할수록 가치 상승)
  | 'flash_sale';    // 플래시 세일 (짧은 시간 대폭 할인)

export interface PurchaseLimit {
  readonly type: 'once' | 'daily' | 'weekly' | 'monthly' | 'unlimited';
  readonly maxCount: number;
}

export interface Product {
  readonly id: string;
  readonly projectId: string;
  readonly name: string;
  readonly description: string;
  readonly category: ProductCategory;
  readonly priceKRW: number;
  readonly priceUSD: number;
  readonly targetSegments: readonly UserSegment[];
  readonly targetRetentionStage: RetentionStage;
  readonly contents: readonly ProductContent[];
  readonly purchaseLimit: PurchaseLimit;
  readonly funnelStageId: string | null;
  readonly salesTechnique: SalesTechnique;
  readonly isPaid: boolean;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}
