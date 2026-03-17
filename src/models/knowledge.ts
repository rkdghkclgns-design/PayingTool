import type { GameGenre } from './project';

export type KnowledgeCategory =
  | 'revenue_metrics'
  | 'user_segmentation'
  | 'retention'
  | 'monetization_models'
  | 'funnel'
  | 'pricing_strategy'
  | 'cash_shop'
  | 'market_specific';

export interface KnowledgeBenchmark {
  readonly low: number;
  readonly median: number;
  readonly high: number;
  readonly topDecile: number;
  readonly unit: string;
  readonly source: string;
}

export interface KnowledgeEntry {
  readonly id: string;
  readonly term: string;
  readonly termKo: string;
  readonly category: KnowledgeCategory;
  readonly definition: string;
  readonly formula: string | null;
  readonly benchmark: KnowledgeBenchmark | null;
  readonly example: string;
  readonly relatedTerms: readonly string[];
  readonly tags: readonly string[];
}

export interface BenchmarkData {
  readonly id: string;
  readonly genre: GameGenre;
  readonly metric: string;
  readonly value: number;
  readonly unit: string;
  readonly percentile: 'p25' | 'p50' | 'p75' | 'p90';
  readonly region: string;
  readonly source: string;
  readonly updatedAt: string;
}
