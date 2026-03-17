import { Globe, MapPin } from 'lucide-react';
import type { KnowledgeEntry } from '../../models';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

interface MarketComparisonPanelProps {
  readonly entries: readonly KnowledgeEntry[];
}

const MARKET_ICONS: Record<string, string> = {
  'Korean Market': 'KR',
  'Chinese Market': 'CN',
  'Japanese Market': 'JP',
};

const MARKET_COLORS: Record<string, string> = {
  'Korean Market': 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
  'Chinese Market': 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
  'Japanese Market': 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800',
};

const MARKET_BADGE_VARIANT: Record<string, 'primary' | 'danger' | 'warning'> = {
  'Korean Market': 'primary',
  'Chinese Market': 'danger',
  'Japanese Market': 'warning',
};

export default function MarketComparisonPanel({ entries }: MarketComparisonPanelProps) {
  const marketEntries = entries.filter(
    (e) => e.category === 'market_specific'
  );

  const mainMarkets = marketEntries.filter(
    (e) => MARKET_ICONS[e.term] !== undefined
  );
  const otherEntries = marketEntries.filter(
    (e) => MARKET_ICONS[e.term] === undefined
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Globe className="w-5 h-5 text-brand-500 dark:text-brand-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          시장별 비교
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mainMarkets.map((entry) => {
          const countryCode = MARKET_ICONS[entry.term] ?? '';
          const colorClass = MARKET_COLORS[entry.term] ?? '';
          const badgeVariant = MARKET_BADGE_VARIANT[entry.term] ?? 'primary';

          return (
            <div
              key={entry.id}
              className={`rounded-xl border p-4 space-y-3 ${colorClass}`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <Badge variant={badgeVariant} size="md">
                  {countryCode}
                </Badge>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {entry.termKo}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-4">
                {entry.definition}
              </p>
              {entry.benchmark && (
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-white/60 dark:bg-gray-900/60 rounded-lg p-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">ARPPU 중간값</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      ${entry.benchmark.median}
                    </p>
                  </div>
                  <div className="bg-white/60 dark:bg-gray-900/60 rounded-lg p-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">상위 10%</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      ${entry.benchmark.topDecile}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-1">
                {entry.tags.map((tag) => (
                  <Badge key={tag} variant="default" size="sm">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {otherEntries.length > 0 && (
        <Card title="시장별 세부 전략" subtitle="각 시장의 고유한 수익화 전략과 시스템">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherEntries.map((entry) => (
              <div
                key={entry.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {entry.termKo}
                  </h4>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {entry.term}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {entry.definition}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
