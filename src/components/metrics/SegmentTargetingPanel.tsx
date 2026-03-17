import { useState, useMemo, useCallback } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Users } from 'lucide-react';
import type { UserSegment, SegmentMetrics } from '../../models';
import { useMetricsStore } from '../../stores/metrics-store';
import { USER_SEGMENT_LABELS } from '../../utils/constants';
import { formatNumber, formatUSD, formatPercent } from '../../utils/formatters';
import Card from '../ui/Card';

const SEGMENTS: readonly UserSegment[] = [
  'non_payer',
  'minnow',
  'dolphin',
  'whale',
  'super_whale',
];

const SEGMENT_COLORS: Record<UserSegment, string> = {
  non_payer: '#94a3b8',
  minnow: '#60a5fa',
  dolphin: '#a78bfa',
  whale: '#f59e0b',
  super_whale: '#ef4444',
};

const DEFAULT_PERCENTAGES: Record<UserSegment, number> = {
  non_payer: 70,
  minnow: 20,
  dolphin: 7,
  whale: 2.5,
  super_whale: 0.5,
};

const AVG_SPEND: Record<UserSegment, number> = {
  non_payer: 0,
  minnow: 5,
  dolphin: 30,
  whale: 150,
  super_whale: 800,
};

export default function SegmentTargetingPanel() {
  const config = useMetricsStore((s) => s.config);
  const [percentages, setPercentages] = useState<Record<UserSegment, number>>(DEFAULT_PERCENTAGES);

  const handlePercentageChange = useCallback(
    (segment: UserSegment, value: number) => {
      setPercentages((prev) => {
        const updated = { ...prev, [segment]: value };
        return updated;
      });
    },
    [],
  );

  const totalPercent = useMemo(
    () => SEGMENTS.reduce((sum, s) => sum + percentages[s], 0),
    [percentages],
  );

  const isValid = useMemo(() => Math.abs(totalPercent - 100) < 0.01, [totalPercent]);

  const segmentData: readonly SegmentMetrics[] = useMemo(() => {
    const totalUsers = config.mau;
    return SEGMENTS.map((segment) => {
      const pct = percentages[segment] / 100;
      const userCount = Math.round(totalUsers * pct);
      const avgSpend = AVG_SPEND[segment];
      const totalRevenue = userCount * avgSpend;
      return {
        segment,
        userCount,
        percentage: pct,
        avgSpend,
        totalRevenue,
        purchaseFrequency: segment === 'non_payer' ? 0 : segment === 'minnow' ? 1.2 : segment === 'dolphin' ? 3.5 : segment === 'whale' ? 8 : 15,
      };
    });
  }, [config.mau, percentages]);

  const chartData = useMemo(
    () =>
      segmentData.map((s) => ({
        name: USER_SEGMENT_LABELS.get(s.segment) ?? s.segment,
        value: s.userCount,
        color: SEGMENT_COLORS[s.segment],
      })),
    [segmentData],
  );

  const totalRevenue = useMemo(
    () => segmentData.reduce((sum, s) => sum + s.totalRevenue, 0),
    [segmentData],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <Card title="유저 세그먼트 분포" subtitle={`MAU 기준: ${formatNumber(config.mau)}명`}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  `${name ?? ''} ${((percent ?? 0) * 100).toFixed(1)}%`
                }
                labelLine={false}
              >
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatNumber(Number(value)), '유저 수']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-2">
          {chartData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </div>
          ))}
        </div>
      </Card>

      {/* Segment Controls & Stats */}
      <Card
        title="세그먼트 비율 설정"
        subtitle={
          isValid
            ? '합계가 100%입니다'
            : `합계: ${totalPercent.toFixed(1)}% (100%가 되어야 합니다)`
        }
      >
        <div className="flex flex-col gap-4">
          {SEGMENTS.map((segment) => {
            const metrics = segmentData.find((s) => s.segment === segment);
            const label = USER_SEGMENT_LABELS.get(segment) ?? segment;
            return (
              <div key={segment} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: SEGMENT_COLORS[segment] }}
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={percentages[segment]}
                      onChange={(e) => handlePercentageChange(segment, Number(e.target.value))}
                      className="w-20 px-2 py-1 text-sm text-right rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-brand-500"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-4">%</span>
                  </div>
                </div>
                {metrics && (
                  <div className="flex gap-4 ml-4.5 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {formatNumber(metrics.userCount)}명
                    </span>
                    <span>평균 지출: {formatUSD(metrics.avgSpend)}</span>
                    <span>수익 기여: {formatUSD(metrics.totalRevenue)}</span>
                  </div>
                )}
              </div>
            );
          })}

          {!isValid && (
            <p className="text-sm text-red-500 dark:text-red-400 font-medium">
              세그먼트 비율의 합이 100%가 되어야 합니다 (현재: {totalPercent.toFixed(1)}%)
            </p>
          )}
        </div>

        {/* Revenue Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              총 예상 월 수익
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatUSD(totalRevenue)}
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-1">
            {segmentData
              .filter((s) => s.totalRevenue > 0)
              .map((s) => {
                const revenuePercent = totalRevenue > 0 ? (s.totalRevenue / totalRevenue) * 100 : 0;
                return (
                  <div key={s.segment} className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${revenuePercent}%`,
                          backgroundColor: SEGMENT_COLORS[s.segment],
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                      {formatPercent(revenuePercent / 100)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </Card>
    </div>
  );
}
