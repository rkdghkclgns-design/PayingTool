import { useState, useMemo, type ReactNode } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { DollarSign, TrendingUp, Calendar, RotateCcw } from 'lucide-react';
import type { MetricsConfig } from '../../models';
import { useMetricsStore } from '../../stores/metrics-store';
import { simulateRevenue } from '../../utils/revenue-calculator';
import { formatCompactNumber, formatUSD, formatNumber, formatPrice } from '../../utils/formatters';
import { KRW_USD_RATE } from '../../utils/constants';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import KpiTargetSettings from './KpiTargetSettings';
import KpiTargetSummary from './KpiTargetSummary';

// ─────────────────────────────────────────────
// Target key mapping for slider badges
// ─────────────────────────────────────────────
const TARGET_KEY_MAP: Readonly<Partial<Record<keyof MetricsConfig, keyof MetricsConfig>>> = {
  conversionRate: 'targetConversion',
  d1Retention: 'targetD1Retention',
  d7Retention: 'targetD7Retention',
  d30Retention: 'targetD30Retention',
};

// ─────────────────────────────────────────────
// MetricSlider with optional target badge
// ─────────────────────────────────────────────
interface MetricSliderProps {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly suffix?: string;
  readonly prefix?: string;
  readonly unit?: string;
  readonly target?: number;
  readonly onChange: (value: number) => void;
}

function MetricSlider({ label, value, min, max, step, suffix = '', prefix = '', unit = '', target, onChange }: MetricSliderProps) {
  const achieved = target !== undefined ? value >= target : undefined;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  // 표시용 값 계산
  const displayValue = (() => {
    if (suffix === '%' && value < 1) {
      return `${(value * 100).toFixed(1)}%`;
    }
    return `${prefix}${formatNumber(value)}${suffix}`;
  })();

  const handleEditStart = () => {
    if (suffix === '%' && value < 1) {
      setEditValue((value * 100).toFixed(1));
    } else {
      setEditValue(String(value));
    }
    setIsEditing(true);
  };

  const handleEditEnd = () => {
    setIsEditing(false);
    let parsed = parseFloat(editValue);
    if (isNaN(parsed)) return;

    // % 값은 /100으로 변환
    if (suffix === '%' && parsed > 1) {
      parsed = parsed / 100;
    }

    // 범위 제한
    const clamped = Math.min(max, Math.max(min, parsed));
    onChange(clamped);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
          {unit && <span className="text-[10px] text-gray-400 dark:text-gray-500">({unit})</span>}
          {achieved !== undefined && (
            <Badge variant={achieved ? 'success' : 'danger'} size="sm">
              {achieved ? '달성' : '미달성'}
            </Badge>
          )}
        </div>
        {isEditing ? (
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleEditEnd}
            onKeyDown={(e) => e.key === 'Enter' && handleEditEnd()}
            autoFocus
            className="w-24 text-right text-xs font-semibold px-1.5 py-0.5 rounded border border-brand-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-1 focus:ring-brand-500"
            step={suffix === '%' ? 0.1 : step}
          />
        ) : (
          <button
            onClick={handleEditStart}
            className="text-xs font-semibold text-gray-900 dark:text-gray-100 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer transition-colors px-1 py-0.5 rounded hover:bg-brand-50 dark:hover:bg-brand-950"
            title="클릭하여 직접 입력"
          >
            {displayValue}
          </button>
        )}
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

// ─────────────────────────────────────────────
// Slider config
// ─────────────────────────────────────────────
const SLIDER_CONFIGS: readonly {
  readonly key: keyof MetricsConfig;
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly suffix: string;
  readonly prefix?: string;
  readonly unit?: string;
}[] = [
  { key: 'dau', label: 'DAU', min: 100, max: 999999999, step: 100, suffix: '', unit: '명' },
  { key: 'mau', label: 'MAU', min: 1000, max: 999999999, step: 1000, suffix: '', unit: '명' },
  { key: 'conversionRate', label: '과금 전환율', min: 0.001, max: 0.5, step: 0.001, suffix: '%' },
  { key: 'arpdau', label: 'ARPDAU', min: 0.01, max: 100.0, step: 0.01, suffix: '', prefix: '$', unit: 'USD' },
  { key: 'arppu', label: 'ARPPU', min: 1, max: 10000, step: 0.5, suffix: '', prefix: '$', unit: 'USD' },
  { key: 'cpi', label: 'CPI', min: 0.1, max: 200, step: 0.1, suffix: '', prefix: '$', unit: 'USD' },
  { key: 'd1Retention', label: 'D1 리텐션', min: 0.05, max: 0.95, step: 0.01, suffix: '%' },
  { key: 'd7Retention', label: 'D7 리텐션', min: 0.01, max: 0.8, step: 0.01, suffix: '%' },
  { key: 'd30Retention', label: 'D30 리텐션', min: 0.005, max: 0.5, step: 0.005, suffix: '%' },
];

// ─────────────────────────────────────────────
// SummaryCard
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// RevenueSimulator (main)
// ─────────────────────────────────────────────
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="flex flex-col gap-6">
          <Card
            title="지표 설정"
            headerAction={
              <Button variant="ghost" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={resetConfig}>
                초기화
              </Button>
            }
          >
            <div className="flex flex-col gap-4">
              {SLIDER_CONFIGS.map((sc) => {
                const targetKey = TARGET_KEY_MAP[sc.key];
                const targetValue = targetKey ? (config[targetKey] as number) : undefined;

                return (
                  <MetricSlider
                    key={sc.key}
                    label={sc.label}
                    value={config[sc.key]}
                    min={sc.min}
                    max={sc.max}
                    step={sc.step}
                    suffix={sc.suffix}
                    prefix={sc.prefix}
                    unit={sc.unit}
                    target={targetValue}
                    onChange={(v) => updateMetric(sc.key, v)}
                  />
                );
              })}
            </div>
          </Card>

          {/* KPI Target Settings (collapsible) */}
          <KpiTargetSettings config={config} onUpdateTarget={updateMetric} />
        </div>

        {/* Chart + Summary */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard icon={<DollarSign className="w-4 h-4" />} label="12개월 총 수익" value={formatPrice(Math.round(simulation.totalRevenue * KRW_USD_RATE), simulation.totalRevenue)} />
            <SummaryCard icon={<TrendingUp className="w-4 h-4" />} label="LTV" value={formatPrice(Math.round(simulation.ltv * KRW_USD_RATE), simulation.ltv)} />
            <SummaryCard icon={<Calendar className="w-4 h-4" />} label="페이백 시점" value={simulation.paybackMonth ? `M${simulation.paybackMonth}` : '미달성'} />
            <SummaryCard icon={<DollarSign className="w-4 h-4" />} label="피크 수익" value={`${formatCompactNumber(simulation.peakRevenue)} (M${simulation.peakMonth})`} />
          </div>

          {/* Revenue Chart with Target LTV line */}
          <Card title="12개월 수익 프로젝션">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tickFormatter={(v) => formatCompactNumber(Number(v))} tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => formatCompactNumber(Number(v))} tick={{ fontSize: 12 }} />
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
                  <ReferenceLine
                    yAxisId="left"
                    y={config.targetLtv * config.dau}
                    stroke="#ef4444"
                    strokeDasharray="6 4"
                    label={{ value: `Target LTV ($${config.targetLtv})`, position: 'right', fontSize: 10, fill: '#ef4444' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line yAxisId="left" type="monotone" dataKey="cumulativeRevenue" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="dau" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* KPI Target Achievement Summary */}
      <KpiTargetSummary config={config} currentLtv={simulation.ltv} />

      {/* 손익분기점 + KPI N배 달성 기준 */}
      <BreakevenAndKpiGoals config={config} simulation={simulation} />
    </div>
  );
}

// ─────────────────────────────────────────────
// 손익분기점 분석 + KPI N배 달성 기준
// ─────────────────────────────────────────────
interface BreakevenProps {
  readonly config: MetricsConfig;
  readonly simulation: ReturnType<typeof simulateRevenue>;
}

function BreakevenAndKpiGoals({ config, simulation }: BreakevenProps) {
  const [kpiMultiplier, setKpiMultiplier] = useState(2);

  // 손익분기 계산
  const totalAcquisitionCost = config.dau * config.cpi;
  const dailyRevenue = config.dau * config.arpdau;
  const monthlyRevenue = dailyRevenue * 30;
  const breakEvenDays = dailyRevenue > 0 ? Math.ceil(totalAcquisitionCost / dailyRevenue) : Infinity;
  const breakEvenMonths = breakEvenDays > 0 ? (breakEvenDays / 30).toFixed(1) : '∞';
  const isBreakEvenAchieved = simulation.paybackMonth !== null;

  // 손익분기 최소 기준
  const minArpdauForBreakeven = config.cpi > 0 ? (config.cpi / 365).toFixed(4) : '0';
  const minConversionForBreakeven = config.arppu > 0
    ? ((config.cpi / (config.arppu * 365)) * 100).toFixed(2)
    : '0';
  const minDauForBreakeven = monthlyRevenue > 0
    ? Math.ceil(totalAcquisitionCost / (config.arpdau * 30))
    : 0;

  // KPI N배 달성 기준
  const targetRevenueMultiplied = totalAcquisitionCost * kpiMultiplier;
  const requiredArpdauForMultiple = config.dau > 0
    ? (targetRevenueMultiplied / (config.dau * 365)).toFixed(4)
    : '0';
  const requiredConversionForMultiple = config.arppu > 0 && config.dau > 0
    ? ((targetRevenueMultiplied / (config.dau * config.arppu * 365)) * 100).toFixed(2)
    : '0';
  const requiredDauForMultiple = config.arpdau > 0
    ? formatNumber(Math.ceil(targetRevenueMultiplied / (config.arpdau * 365)))
    : '0';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 손익분기점 최소 달성 기준 */}
      <Card
        title="손익분기점 최소 달성 기준"
        headerAction={
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            isBreakEvenAchieved
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          }`}>
            {isBreakEvenAchieved ? `M${simulation.paybackMonth} 달성` : '미달성'}
          </span>
        }
      >
        <div className="space-y-4">
          {/* 현재 상태 요약 */}
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">총 유저 획득 비용</span>
                <p className="font-bold text-gray-900 dark:text-gray-100 mt-0.5">{formatPrice(Math.round(totalAcquisitionCost * KRW_USD_RATE), totalAcquisitionCost)}</p>
              </div>
              <div>
                <span className="text-gray-500">일 수익</span>
                <p className="font-bold text-gray-900 dark:text-gray-100 mt-0.5">{formatPrice(Math.round(dailyRevenue * KRW_USD_RATE), dailyRevenue)}</p>
              </div>
              <div>
                <span className="text-gray-500">손익분기 소요일</span>
                <p className="font-bold text-gray-900 dark:text-gray-100 mt-0.5">{breakEvenDays === Infinity ? '∞' : `${breakEvenDays}일 (${breakEvenMonths}개월)`}</p>
              </div>
              <div>
                <span className="text-gray-500">12개월 총 수익</span>
                <p className="font-bold text-gray-900 dark:text-gray-100 mt-0.5">{formatPrice(Math.round(simulation.totalRevenue * KRW_USD_RATE), simulation.totalRevenue)}</p>
              </div>
            </div>
          </div>

          {/* 최소 기준 */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">1년 내 손익분기를 넘기 위한 최소 기준</h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900">
                <span className="text-xs text-blue-700 dark:text-blue-300">최소 ARPDAU</span>
                <span className="text-sm font-bold text-blue-800 dark:text-blue-200">${minArpdauForBreakeven}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900">
                <span className="text-xs text-purple-700 dark:text-purple-300">최소 과금 전환율</span>
                <span className="text-sm font-bold text-purple-800 dark:text-purple-200">{minConversionForBreakeven}%</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900">
                <span className="text-xs text-emerald-700 dark:text-emerald-300">최소 DAU (현재 ARPDAU 기준)</span>
                <span className="text-sm font-bold text-emerald-800 dark:text-emerald-200">{formatNumber(minDauForBreakeven)}명</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI N배 달성 기준 */}
      <Card
        title="KPI N배 달성 기준"
        headerAction={
          <div className="flex items-center gap-1.5">
            {[2, 3, 5, 10].map((n) => (
              <button
                key={n}
                onClick={() => setKpiMultiplier(n)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  kpiMultiplier === n
                    ? 'bg-brand-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {n}배
              </button>
            ))}
          </div>
        }
      >
        <div className="space-y-4">
          {/* 목표 수익 */}
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-amber-700 dark:text-amber-300">기준 (획득비용)</span>
                <p className="font-bold text-amber-900 dark:text-amber-100 mt-0.5">{formatPrice(Math.round(totalAcquisitionCost * KRW_USD_RATE), totalAcquisitionCost)}</p>
              </div>
              <div>
                <span className="text-amber-700 dark:text-amber-300">목표 수익 ({kpiMultiplier}배)</span>
                <p className="font-bold text-amber-900 dark:text-amber-100 mt-0.5">{formatPrice(Math.round(targetRevenueMultiplied * KRW_USD_RATE), targetRevenueMultiplied)}</p>
              </div>
              <div>
                <span className="text-amber-700 dark:text-amber-300">현재 12개월 수익</span>
                <p className="font-bold text-amber-900 dark:text-amber-100 mt-0.5">{formatPrice(Math.round(simulation.totalRevenue * KRW_USD_RATE), simulation.totalRevenue)}</p>
              </div>
              <div>
                <span className="text-amber-700 dark:text-amber-300">달성률</span>
                <p className="font-bold text-amber-900 dark:text-amber-100 mt-0.5">
                  {targetRevenueMultiplied > 0 ? `${((simulation.totalRevenue / targetRevenueMultiplied) * 100).toFixed(1)}%` : '0%'}
                </p>
              </div>
            </div>
          </div>

          {/* N배 달성 필요 기준 */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              1년 내 {kpiMultiplier}배 수익 달성을 위한 필요 기준
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900">
                <span className="text-xs text-blue-700 dark:text-blue-300">필요 ARPDAU</span>
                <span className="text-sm font-bold text-blue-800 dark:text-blue-200">${requiredArpdauForMultiple}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900">
                <span className="text-xs text-purple-700 dark:text-purple-300">필요 과금 전환율</span>
                <span className="text-sm font-bold text-purple-800 dark:text-purple-200">{requiredConversionForMultiple}%</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900">
                <span className="text-xs text-emerald-700 dark:text-emerald-300">필요 DAU (현재 ARPDAU 기준)</span>
                <span className="text-sm font-bold text-emerald-800 dark:text-emerald-200">{requiredDauForMultiple}명</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
