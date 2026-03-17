import type { GenreBlueprint } from '../../models/genre-blueprint';
import type { GameGenre } from '../../models/project';

import { RPG_BLUEPRINT } from './rpg';
import { CASUAL_BLUEPRINT } from './casual';
import { PUZZLE_BLUEPRINT } from './puzzle';
import { STRATEGY_BLUEPRINT } from './strategy';
import { SIMULATION_BLUEPRINT } from './simulation';
import { SPORTS_BLUEPRINT } from './sports-racing';
import { SHOOTER_BLUEPRINT } from './shooter';
import { IDLE_BLUEPRINT } from './idle';
import { CARD_BOARD_BLUEPRINT } from './card-board';
import { MOBA_BLUEPRINT } from './moba';
import { MMORPG_BLUEPRINT } from './mmorpg';

// ─────────────────────────────────────────────
// All Genre Blueprints
// ─────────────────────────────────────────────
export const GENRE_BLUEPRINTS: readonly GenreBlueprint[] = [
  RPG_BLUEPRINT,
  MMORPG_BLUEPRINT,
  CASUAL_BLUEPRINT,
  PUZZLE_BLUEPRINT,
  STRATEGY_BLUEPRINT,
  SIMULATION_BLUEPRINT,
  SPORTS_BLUEPRINT,
  SHOOTER_BLUEPRINT,
  IDLE_BLUEPRINT,
  CARD_BOARD_BLUEPRINT,
  MOBA_BLUEPRINT,
] as const;

// ─────────────────────────────────────────────
// Lookup by GameGenre
// ─────────────────────────────────────────────
const blueprintMap = new Map<GameGenre, GenreBlueprint>(
  GENRE_BLUEPRINTS.map((bp) => [bp.genre, bp])
);

export function getGenreBlueprint(genre: GameGenre): GenreBlueprint | undefined {
  return blueprintMap.get(genre);
}

export function getGenreBlueprintOrThrow(genre: GameGenre): GenreBlueprint {
  const blueprint = blueprintMap.get(genre);
  if (!blueprint) {
    throw new Error(`No blueprint found for genre: ${genre}`);
  }
  return blueprint;
}

// ─────────────────────────────────────────────
// Re-exports
// ─────────────────────────────────────────────
export { RPG_BLUEPRINT } from './rpg';
export { CASUAL_BLUEPRINT } from './casual';
export { PUZZLE_BLUEPRINT } from './puzzle';
export { STRATEGY_BLUEPRINT } from './strategy';
export { SIMULATION_BLUEPRINT } from './simulation';
export { SPORTS_BLUEPRINT } from './sports-racing';
export { SHOOTER_BLUEPRINT } from './shooter';
export { IDLE_BLUEPRINT } from './idle';
export { CARD_BOARD_BLUEPRINT } from './card-board';
export { MOBA_BLUEPRINT } from './moba';
export { MMORPG_BLUEPRINT } from './mmorpg';
