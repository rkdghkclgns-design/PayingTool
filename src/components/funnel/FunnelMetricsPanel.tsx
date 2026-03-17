import { useMemo } from 'react';
import { TrendingDown, DollarSign, AlertTriangle, Users } from 'lucide-react';
import type { FunnelStage, Product } from '../../models';
import { formatPercent, formatUSD, formatCompactNumber } from '../../utils/formatters';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface FunnelMetricsPanelProps {
  readonly stages: readonly FunnelStage[];
  readonly totalUsers: number;
  readonly allProducts: readonly Product[];
}

interface StageMetric {
  readonly stageId: string;
  readonly label: string;
  readonly userCount: number;
  readonly conversionRate: number;
  readonly revenue: number;
}

export default function FunnelMetricsPanel({ stages, totalUsers, allProducts }: FunnelMetricsPanelProps) {
  const metrics = useMemo(() => {
    let cumulativeUsers = totalUsers;
    const stageMetrics: StageMetric[] = stages.map((stage, index) => {
      if (index === 0) {
        cumulativeUsers = totalUsers * stage.conversionRate;
      } else {
        cumulativeUsers = cumulativeUsers * stage.conversionRate;
      }
      const assignedProducts = stage.assignedProductIds
        .map((pid) => allProducts.find((p) => p.id === pid))
        .filter((p): p is Product => p !== undefined);
      const revenue = assignedProducts.reduce((sum, p) => sum + p.priceUSD * cumulativeUsers * 0.01, 0);
      return {
        stageId: stage.id,
        label: stage.label,
        userCount: cumulativeUsers,
        conversionRate: stage.conversionRate,
        revenue,
      };
    });

    const totalConversion = stageMetrics.length > 0
      ? stageMetrics[stageMetrics.length - 1].userCount / totalUsers
      : 0;

    const totalRevenue = stageMetrics.reduce((sum, s) => sum + s.revenue, 0);

    // Find bottleneck: stage with lowest conversion rate (excluding first)
    const bottleneck = stageMetrics.length > 1
      ? stageMetrics.slice(1).reduce((worst, s) =>
          s.conversionRate < worst.conversionRate ? s : worst
        , stageMetrics[1])
      : null;

    return { stageMetrics, totalConversion, totalRevenue, bottleneck };
  }, [stages, totalUsers, allProducts]);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">총 전환율</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {totalUsers > 0 ? formatPercent(metrics.totalConversion) : '-'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-950 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">총 예상 수익</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatUSD(metrics.totalRevenue)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">최종 단계 유저</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {metrics.stageMetrics.length > 0
                  ? formatCompactNumber(metrics.stageMetrics[metrics.stageMetrics.length - 1].userCount)
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Bottleneck */}
      {metrics.bottleneck && (
        <Card>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 dark:bg-yellow-950 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">병목 구간</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {metrics.bottleneck.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                전환율 {formatPercent(metrics.bottleneck.conversionRate)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Per-Stage Revenue */}
      <Card title="단계별 수익">
        <div className="space-y-2">
          {metrics.stageMetrics.map((sm) => (
            <div key={sm.stageId} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{sm.label}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs text-gray-500 dark:text-gray-400">{formatCompactNumber(sm.userCount)}명</span>
                <Badge variant={sm.revenue > 0 ? 'success' : 'default'} size="sm">
                  {formatUSD(sm.revenue)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
