import { DollarSign, Zap, Crown } from 'lucide-react';
import type { PriceTier } from '../../models/genre-blueprint';
import Card from '../ui/Card';

interface BlueprintPriceTiersProps {
  readonly priceTiers: readonly PriceTier[];
}

const TIER_CONFIG: Readonly<Record<string, {
  readonly icon: typeof DollarSign;
  readonly color: string;
  readonly bg: string;
}>> = {
  starter: {
    icon: Zap,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/50',
  },
  mid: {
    icon: DollarSign,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/50',
  },
  whale: {
    icon: Crown,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/50',
  },
};

export default function BlueprintPriceTiers({ priceTiers }: BlueprintPriceTiersProps) {
  return (
    <Card title="가격 티어">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {priceTiers.map((tier) => {
          const config = TIER_CONFIG[tier.tier] ?? TIER_CONFIG.starter;
          const Icon = config.icon;

          return (
            <div
              key={tier.tier}
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bg}`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {tier.labelKo}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{tier.label}</p>
                </div>
              </div>
              <div className="mb-2">
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  ${tier.minUsd.toFixed(2)} - ${tier.maxUsd.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {tier.description}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
