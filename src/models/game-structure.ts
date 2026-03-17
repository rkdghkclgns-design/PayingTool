import type { GameGenre } from './project';

export interface GameCurrency {
  readonly name: string;
  readonly type: 'hard' | 'soft' | 'premium' | 'event';
  readonly earnableFree: boolean;
  readonly purchasable: boolean;
}

export interface AdPlacement {
  readonly location: string;
  readonly adType: string;
  readonly reward: string;
  readonly description: string;
}

export interface GameStructure {
  readonly genre: GameGenre;
  readonly coreLoop: string;
  readonly progressionSystems: readonly string[];
  readonly socialFeatures: readonly string[];
  readonly contentTypes: readonly string[];
  readonly currencies: readonly GameCurrency[];
  readonly retentionHooks: readonly string[];
  readonly competitiveElements: readonly string[];
  readonly adPlacements: readonly AdPlacement[];
  readonly rawAnalysis: string;
}
