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
  | 'other';

export type UserSegment =
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
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}
