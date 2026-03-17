import {
  Gamepad2,
  RefreshCw,
  TrendingUp,
  Users,
  Coins,
  Anchor,
  Swords,
} from 'lucide-react';
import type { GameStructure, GameCurrency } from '../../models';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface GameStructureCardProps {
  readonly structure: GameStructure;
}

const GENRE_LABELS: Record<string, string> = {
  rpg: 'RPG',
  puzzle: '퍼즐',
  strategy: '전략',
  casual: '캐주얼',
  simulation: '시뮬레이션',
  action: '액션',
  sports: '스포츠',
  idle: '아이들',
  mmorpg: 'MMORPG',
  other: '기타',
};

const CURRENCY_TYPE_LABELS: Record<GameCurrency['type'], string> = {
  hard: '유료 재화',
  soft: '무료 재화',
  premium: '프리미엄',
  event: '이벤트',
};

const CURRENCY_TYPE_VARIANTS: Record<GameCurrency['type'], 'danger' | 'success' | 'warning' | 'primary'> = {
  hard: 'danger',
  soft: 'success',
  premium: 'warning',
  event: 'primary',
};

function SectionHeader({ icon: Icon, title }: {
  readonly icon: typeof Gamepad2;
  readonly title: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4 text-brand-500 dark:text-brand-400" />
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {title}
      </h4>
    </div>
  );
}

function TagList({ items }: { readonly items: readonly string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} variant="default" size="sm">
          {item}
        </Badge>
      ))}
    </div>
  );
}

function CurrencyTable({ currencies }: { readonly currencies: readonly GameCurrency[] }) {
  if (currencies.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            <th className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">이름</th>
            <th className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">유형</th>
            <th className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 text-center">무료 획득</th>
            <th className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 text-center">구매 가능</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {currencies.map((c) => (
            <tr key={c.name} className="bg-white dark:bg-gray-900">
              <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">
                {c.name}
              </td>
              <td className="px-3 py-2">
                <Badge variant={CURRENCY_TYPE_VARIANTS[c.type]} size="sm">
                  {CURRENCY_TYPE_LABELS[c.type]}
                </Badge>
              </td>
              <td className="px-3 py-2 text-center">
                {c.earnableFree ? (
                  <span className="text-green-500">O</span>
                ) : (
                  <span className="text-red-400">X</span>
                )}
              </td>
              <td className="px-3 py-2 text-center">
                {c.purchasable ? (
                  <span className="text-green-500">O</span>
                ) : (
                  <span className="text-red-400">X</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GameStructureCard({ structure }: GameStructureCardProps) {
  return (
    <Card
      title="게임 구조 분석 결과"
      subtitle="AI가 마인드맵에서 추출한 게임 유료화 구조"
    >
      <div className="space-y-6">
        {/* Genre */}
        <div>
          <SectionHeader icon={Gamepad2} title="장르" />
          <Badge variant="primary" size="md">
            {GENRE_LABELS[structure.genre] ?? structure.genre}
          </Badge>
        </div>

        {/* Core Loop */}
        <div>
          <SectionHeader icon={RefreshCw} title="코어 루프" />
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            {structure.coreLoop}
          </p>
        </div>

        {/* Progression Systems */}
        {structure.progressionSystems.length > 0 && (
          <div>
            <SectionHeader icon={TrendingUp} title="성장 시스템" />
            <TagList items={structure.progressionSystems} />
          </div>
        )}

        {/* Social Features */}
        {structure.socialFeatures.length > 0 && (
          <div>
            <SectionHeader icon={Users} title="소셜 기능" />
            <ul className="space-y-1">
              {structure.socialFeatures.map((f) => (
                <li
                  key={f}
                  className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Currencies */}
        {structure.currencies.length > 0 && (
          <div>
            <SectionHeader icon={Coins} title="재화 시스템" />
            <CurrencyTable currencies={structure.currencies} />
          </div>
        )}

        {/* Retention Hooks */}
        {structure.retentionHooks.length > 0 && (
          <div>
            <SectionHeader icon={Anchor} title="리텐션 장치" />
            <ul className="space-y-1">
              {structure.retentionHooks.map((hook) => (
                <li
                  key={hook}
                  className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                  {hook}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Competitive Elements */}
        {structure.competitiveElements.length > 0 && (
          <div>
            <SectionHeader icon={Swords} title="경쟁 요소" />
            <ul className="space-y-1">
              {structure.competitiveElements.map((el) => (
                <li
                  key={el}
                  className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  {el}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
