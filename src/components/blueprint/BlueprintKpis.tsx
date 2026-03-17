import type { BenchmarkKpis, RangedMetric } from '../../models/genre-blueprint';
import Card from '../ui/Card';

interface BlueprintKpisProps {
  readonly kpis: BenchmarkKpis;
}

interface KpiCardConfig {
  readonly label: string;
  readonly metric: RangedMetric;
  readonly unit: string;
}

function formatMetricValue(value: number, unit: string): string {
  if (unit === 'USD') return `$${value.toFixed(2)}`;
  if (unit === '%') return `${value.toFixed(1)}%`;
  return String(value);
}

function KpiMetricCard({ label, metric, unit }: KpiCardConfig) {
  return (
    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
        {label}
      </h4>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">Low</p>
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            {formatMetricValue(metric.low, unit)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">Median</p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {formatMetricValue(metric.median, unit)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">High</p>
          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
            {formatMetricValue(metric.high, unit)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BlueprintKpis({ kpis }: BlueprintKpisProps) {
  const metrics: readonly KpiCardConfig[] = [
    { label: 'ARPU (월)', metric: kpis.arpu, unit: 'USD' },
    { label: 'ARPPU (월)', metric: kpis.arppu, unit: 'USD' },
    { label: '과금 전환율', metric: kpis.conversionRate, unit: '%' },
    { label: 'D1 리텐션', metric: kpis.d1Retention, unit: '%' },
    { label: 'D7 리텐션', metric: kpis.d7Retention, unit: '%' },
    { label: 'D30 리텐션', metric: kpis.d30Retention, unit: '%' },
    { label: 'ARPDAU', metric: kpis.arpdau, unit: 'USD' },
  ];

  return (
    <Card title="벤치마크 KPI">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <KpiMetricCard key={m.label} {...m} />
        ))}
        {/* Extra stats */}
        <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            세션/참여
          </h4>
          <div className="space-y-1">
            <p className="text-xs text-gray-700 dark:text-gray-300">
              평균 세션: <span className="font-semibold">{kpis.sessionLength}분</span>
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              일일 세션: <span className="font-semibold">{kpis.sessionsPerDay}회</span>
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              Stickiness: <span className="font-semibold">{kpis.stickiness}%</span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
