import { useState } from 'react';
import {
  Swords,
  Puzzle,
  Castle,
  Gamepad2,
  Factory,
  Trophy,
  Crosshair,
  Timer,
  Spade,
  Shield,
  Globe,
} from 'lucide-react';
import type { GenreBlueprint } from '../../models/genre-blueprint';
import type { GameGenre } from '../../models/project';
import { GENRE_BLUEPRINTS } from '../../data/genre-blueprints';
import PageContainer from '../layout/PageContainer';
import Badge from '../ui/Badge';
import BlueprintDetail from './BlueprintDetail';

// ─────────────────────────────────────────────
// Genre Icon Mapping
// ─────────────────────────────────────────────
const GENRE_ICONS: Readonly<Record<string, typeof Swords>> = {
  rpg: Swords,
  mmorpg: Globe,
  casual: Gamepad2,
  puzzle: Puzzle,
  strategy: Castle,
  simulation: Factory,
  sports: Trophy,
  shooter: Crosshair,
  idle: Timer,
  card_board: Spade,
  moba: Shield,
};

function getGenreIcon(genre: GameGenre) {
  return GENRE_ICONS[genre] ?? Gamepad2;
}

// ─────────────────────────────────────────────
// Genre Card
// ─────────────────────────────────────────────
interface GenreCardProps {
  readonly blueprint: GenreBlueprint;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}

function GenreCard({ blueprint, isSelected, onSelect }: GenreCardProps) {
  const Icon = getGenreIcon(blueprint.genre);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        w-full text-left p-4 rounded-xl border-2 transition-all duration-200
        hover:shadow-md cursor-pointer
        ${
          isSelected
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950 dark:border-brand-400 shadow-md'
            : 'border-gray-200 bg-white hover:border-brand-300 dark:bg-gray-900 dark:border-gray-700 dark:hover:border-brand-600'
        }
      `.trim()}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            ${
              isSelected
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
            }
          `.trim()}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {blueprint.genreLabelKo}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {blueprint.genreLabel}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {blueprint.subGenres.slice(0, 3).map((sub) => (
          <Badge key={sub} size="sm">
            {sub}
          </Badge>
        ))}
        {blueprint.subGenres.length > 3 && (
          <Badge size="sm" variant="primary">
            +{blueprint.subGenres.length - 3}
          </Badge>
        )}
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function GenreBlueprintPage() {
  const [selectedGenre, setSelectedGenre] = useState<GenreBlueprint | null>(null);

  const handleSelect = (blueprint: GenreBlueprint) => {
    setSelectedGenre((prev) =>
      prev?.id === blueprint.id ? null : blueprint,
    );
  };

  return (
    <PageContainer
      title="장르별 추천 설계도"
      description="게임 장르별 최적화된 유료화 설계 전략을 확인하세요"
    >
      {/* Genre Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {GENRE_BLUEPRINTS.map((bp) => (
          <GenreCard
            key={bp.id}
            blueprint={bp}
            isSelected={selectedGenre?.id === bp.id}
            onSelect={() => handleSelect(bp)}
          />
        ))}
      </div>

      {/* Detail View */}
      {selectedGenre && <BlueprintDetail blueprint={selectedGenre} />}
    </PageContainer>
  );
}
