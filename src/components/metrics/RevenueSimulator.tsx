import { useMemo, type ReactNode } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DollarSign, TrendingUp, Calendar, RotateCcw } from 'lucide-react';
import type { MetricsConfig } from '../../models';
import { useMetricsStore } from '../../stores/metrics-store';
import { simulateRevenue } from '../../utils/revenue-calculator';
import { formatCompactNumber, formatUSD, formatNumber } from '../../utils/formatters';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface MetricSliderProps {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly suffix?: string;
  readonly onChange: (value: number) => void;
}

function MetricSlider({ label, value, min, max, step, suffix = '', onChange }: MetricSliderProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
        <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
          {typeof value === 'number' && value < 1 && suffix === '%'
            ? `${(value * 100).toFixed(1)}%`
            : `${formatNumber(value)}${suffix}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-brand-500"
      />
    </div>
  );
}

const SLIDER_CONFIGS: readonly {
  readonly key: keyof MetricsConfig;
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly suffix: string;
}[] = [
  { key: 'dau', label: 'DAU', min: 100, max: 500000, step: 100, suffix: '' },
  { key: 'mau', label: 'MAU', min: 1000, max: 5000000, step: 1000, suffix: '' },
  { key: 'conversionRate', label: '과금 전환율', min: 0.001, max: 0.2, step: 0.001, suffix: '%' },
  { key: 'arpdau', label: 'ARPDAU', min: 0.01, max: 2.0, step: 0.01, suffix: '' },
  { key: 'arppu', label: 'ARPPU', min: 1, max: 200, step: 0.5, suffix: '' },
  { key: 'cpi', label: 'CPI', min: 0.1, max: 20, step: 0.1, suffix: '' },
  { key: 'd1Retention', label: 'D1 리텐션', min: 0.05, max: 0.8, step: 0.01, suffix: '%' },
  { key: 'd7Retention', label: 'D7 리텐션', min: 0.01, max: 0.5, step: 0.01, suffix: '%' },
  { key: 'd30Retention', label: 'D30 리텐션', min: 0.005, max: 0.3, step: 0.005, suffix: '%' },
];

export default function RevenueSimulator() {
  const config = useMetricsStore((s) => s.config);
  const updateMetric = useMetricsStore((s) => s.updateMetric);
  const resetConfig = useMetricsStore((s) => s.resetConfig);

  const simulation = useMemo(() => simulateRevenue(config, 12), [config]);

  const chartData = useMemo(
    () =>
      simulation.monthlyProjections.map((p) => ({
        name: p.label,
        revenue: p.revenue,
        cumulativeRevenue: p.cumulativeRevenue,
        dau: p.dau,
      })),
    [simulation],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls */}
      <Card
        title="지표 설정"
        headerAction={
          <Button variant="ghost" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={resetConfig}>
            초기화
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          {SLIDER_CONFIGS.map((sc) => (
            <MetricSlider
              key={sc.key}
              label={sc.label}
              value={config[sc.key]}
              min={sc.min}
              max={sc.max}
              step={sc.step}
              suffix={sc.suffix}
              onChange={(v) => updateMetric(sc.key, v)}
            />
          ))}
        </div>
      </Card>

      {/* Chart + Summary */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            icon={<DollarSign className="w-4 h-4" />}
            label="12개월 총 수익"
            value={formatUSD(simulation.totalRevenue)}
          />
          <SummaryCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="LTV"
            value={formatUSD(simulation.ltv)}
          />
          <SummaryCard
            icon={<Calendar className="w-4 h-4" />}
            label="페이백 시점"
            value={simulation.paybackMonth ? `M${simulation.paybackMonth}` : '미달성'}
          />
          <SummaryCard
            icon={<DollarSign className="w-4 h-4" />}
            label="피크 수익"
            value={`${formatCompactNumber(simulation.peakRevenue)} (M${simulation.peakMonth})`}
          />
        </div>

        {/* Revenue Chart */}
        <Card title="12개월 수익 프로젝션">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(v) => formatCompactNumber(Number(v))}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(v) => formatCompactNumber(Number(v))}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatUSD(Number(value)),
                    name === 'revenue' ? '월 수익' : name === 'cumulativeRevenue' ? '누적 수익' : 'DAU',
                  ]}
                />
                <Legend
                  formatter={(value: string) =>
                    value === 'revenue' ? '월 수익' : value === 'cumulativeRevenue' ? '누적 수익' : 'DAU'
                  }
                />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="cumulativeRevenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
                <Line yAxisId="right" type="monotone" dataKey="dau" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  readonly icon: ReactNode;
  readonly label: string;
  readonly value: string;
}

function SummaryCard({ icon, label, value }: SummaryCardProps) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  );
}
