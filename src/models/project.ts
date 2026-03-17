export type GameGenre =
  | 'rpg'
  | 'puzzle'
  | 'strategy'
  | 'casual'
  | 'simulation'
  | 'action'
  | 'sports'
  | 'idle'
  | 'mmorpg'
  | 'other';

export type TargetMarket = 'kr' | 'cn' | 'jp' | 'global';

export interface Project {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly gameGenre: GameGenre;
  readonly targetMarket: TargetMarket;
  readonly createdAt: string;
  readonly updatedAt: string;
}
