import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Zap, DollarSign, Crown, ArrowRight, Settings } from 'lucide-react';
import type { PriceTier } from '../../models/genre-blueprint';
import { useGenreStore } from '../../stores/genre-store';
import { getGenreBlueprint } from '../../data/genre-blueprints/index';
import type { GameGenre } from '../../models';

// ─────────────────────────────────────────────
// Tier visual config
// ─────────────────────────────────────────────
const TIER_STYLE: Readonly<Record<PriceTier['tier'], {
  readonly icon: typeof DollarSign;
  readonly card: string;
  readonly iconBg: string;
  readonly iconColor: string;
  readonly priceColor: string;
}>> = {
  starter: {
    icon: Zap,
    card: 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800',
    iconBg: 'bg-green-100 dark:bg-green-900/50',
    iconColor: 'text-green-600 dark:text-green-400',
    priceColor: 'text-green-700 dark:text-green-300',
  },
  mid: {
    icon: DollarSign,
    card: 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    priceColor: 'text-blue-700 dark:text-blue-300',
  },
  whale: {
    icon: Crown,
    card: 'bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    iconColor: 'text-purple-600 dark:text-purple-400',
    priceColor: 'text-purple-700 dark:text-purple-300',
  },
};

// ─────────────────────────────────────────────
// Component — 장르 설계도 기준으로 가격 전략 표시
// ─────────────────────────────────────────────
export default function PriceTierGuidance() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const selectedGenre = useGenreStore((s) => s.selectedGenre);
  const blueprint = selectedGenre
    ? getGenreBlueprint(selectedGenre as GameGenre)
    : undefined;

  // 장르가 선택되지 않은 경우 → 안내 메시지 + 장르 설계도 링크
  if (!selectedGenre || !blueprint) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
          <Settings className="w-4 h-4 text-gray-400" />
          장르 가격 전략
        </div>
        <div className="px-4 pb-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
              장르가 선택되지 않았습니다.
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
              장르 설계도에서 장르를 먼저 지정해주세요. 장르에 맞는 가격 전략이 여기에 표시됩니다.
            </p>
            <button
              onClick={() => navigate('/blueprint')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors cursor-pointer"
            >
              장르 설계도로 이동
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        장르 가격 전략
        <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400">
          ({blueprint.genreLabelKo})
        </span>
      </button>

      {/* Collapsible body */}
      {isOpen && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {blueprint.priceTiers.map((tier) => {
              const style = TIER_STYLE[tier.tier];
              const Icon = style.icon;

              return (
                <div
                  key={tier.tier}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${style.card}`}
                >
                  <div className={`w-7 h-7 shrink-0 rounded-md flex items-center justify-center ${style.iconBg}`}>
                    <Icon className={`w-3.5 h-3.5 ${style.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-xs font-semibold ${style.priceColor}`}>
                        {tier.labelKo}
                      </span>
                      <span className={`text-xs font-medium ${style.priceColor}`}>
                        ${tier.minUsd.toFixed(2)} - ${tier.maxUsd.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                      {tier.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
