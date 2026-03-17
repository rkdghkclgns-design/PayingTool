import type { GameGenre, TargetMarket } from './project';

// ─────────────────────────────────────────────
// Product Mix (recommended revenue split by product type)
// ─────────────────────────────────────────────
export interface ProductMixItem {
  readonly type:
    | 'currency_packs'
    | 'battle_pass'
    | 'cosmetics'
    | 'gacha'
    | 'subscription'
    | 'starter_pack'
    | 'loot_box'
    | 'energy_stamina'
    | 'progression_boost'
    | 'remove_ads'
    | 'season_content'
    | 'expansion_dlc'
    | 'vip_membership'
    | 'bundles'
    | 'rewarded_ads'
    | 'offerwalls';
  readonly label: string;
  readonly labelKo: string;
  readonly recommendedPct: number; // 0-100
}

// ─────────────────────────────────────────────
// Price Tiers
// ─────────────────────────────────────────────
export interface PriceTier {
  readonly tier: 'starter' | 'mid' | 'whale';
  readonly label: string;
  readonly labelKo: string;
  readonly minUsd: number;
  readonly maxUsd: number;
  readonly description: string;
}

// ─────────────────────────────────────────────
// Benchmark KPIs
// ─────────────────────────────────────────────
export interface RangedMetric {
  readonly low: number;
  readonly median: number;
  readonly high: number;
}

export interface BenchmarkKpis {
  readonly arpu: RangedMetric;       // USD/month
  readonly arppu: RangedMetric;      // USD/month
  readonly conversionRate: RangedMetric; // percentage
  readonly d1Retention: RangedMetric;    // percentage
  readonly d7Retention: RangedMetric;    // percentage
  readonly d30Retention: RangedMetric;   // percentage
  readonly arpdau: RangedMetric;         // USD
  readonly sessionLength: number;        // minutes (avg)
  readonly sessionsPerDay: number;       // average
  readonly stickiness: number;           // DAU/MAU percentage
}

// ─────────────────────────────────────────────
// LTV by Region
// ─────────────────────────────────────────────
export interface RegionalLtv {
  readonly region: TargetMarket;
  readonly label: string;
  readonly d30Ltv: RangedMetric;   // USD
  readonly d90Ltv: RangedMetric;   // USD
  readonly d180Ltv: RangedMetric;  // USD
  readonly notes: string;
}

// ─────────────────────────────────────────────
// Successful Example
// ─────────────────────────────────────────────
export interface SuccessfulExample {
  readonly name: string;
  readonly developer: string;
  readonly annualRevenue: string;
  readonly monetizationApproach: string;
  readonly keyTakeaway: string;
}

// ─────────────────────────────────────────────
// Genre Blueprint (top-level)
// ─────────────────────────────────────────────
export interface GenreBlueprint {
  readonly id: string;
  readonly genre: GameGenre;
  readonly genreLabel: string;
  readonly genreLabelKo: string;
  readonly subGenres: readonly string[];
  readonly productMix: readonly ProductMixItem[];
  readonly priceTiers: readonly PriceTier[];
  readonly benchmarkKpis: BenchmarkKpis;
  readonly keyStrategies: readonly string[];
  readonly funnelTips: readonly string[];
  readonly regionalLtv: readonly RegionalLtv[];
  readonly commonMistakes: readonly string[];
  readonly successfulExamples: readonly SuccessfulExample[];
  readonly updatedAt: string;
}
