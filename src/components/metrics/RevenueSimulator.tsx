import { useState, useMemo, type ReactNode } from 'react';
import { DollarSign, TrendingUp, Calendar, RotateCcw } from 'lucide-react';
import type { MetricsConfig } from '../../models';
import { useMetricsStore } from '../../stores/metrics-store';
import { simulateRevenue } from '../../utils/revenue-calculator';
import { formatNumber, formatPrice } from '../../utils/formatters';
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

  // 원화 표시 여부 (USD 단위인 경우 원화로 표시)
  const isUsdField = unit === 'USD';

  // 표시용 값 계산
  const displayValue = (() => {
    if (suffix === '%' && value < 1) {
      return `${(value * 100).toFixed(1)}%`;
    }
    if (isUsdField) {
      const krwValue = Math.round(value * KRW_USD_RATE);
      return `₩${formatNumber(krwValue)} ($${value.toFixed(2)})`;
    }
    return `${prefix}${formatNumber(value)}${suffix}`;
  })();

  const handleEditStart = () => {
    if (suffix === '%' && value < 1) {
      setEditValue((value * 100).toFixed(1));
    } else if (isUsdField) {
      // 원화로 입력
      setEditValue(String(Math.round(value * KRW_USD_RATE)));
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

    // 원화 입력 → USD 변환
    if (isUsdField) {
      parsed = parsed / KRW_USD_RATE;
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
          {unit && <span className="text-[10px] text-gray-400 dark:text-gray-500">({isUsdField ? 'KRW' : unit})</span>}
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
  { key: 'cpi', label: 'CPI', min: 0.007, max: 200, step: 0.007, suffix: '', prefix: '$', unit: 'USD' },
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
  const [commissionRate, setCommissionRate] = useState(30);

  const simulation = useMemo(() => simulateRevenue(config, 12), [config]);
  const monthlyAvgRevenue = simulation.totalRevenue / 12;
  const netRevenue = simulation.totalRevenue * (1 - commissionRate / 100);

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
            <div className="group relative">
              <SummaryCard icon={<DollarSign className="w-4 h-4" />} label="12개월 총 수익" value={formatPrice(Math.round(simulation.totalRevenue * KRW_USD_RATE), simulation.totalRevenue)} />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                월평균: {formatPrice(Math.round(monthlyAvgRevenue * KRW_USD_RATE), monthlyAvgRevenue)}
              </div>
            </div>
            <SummaryCard icon={<TrendingUp className="w-4 h-4" />} label="LTV" value={formatPrice(Math.round(simulation.ltv * KRW_USD_RATE), simulation.ltv)} />
            <SummaryCard icon={<Calendar className="w-4 h-4" />} label="페이백 시점" value={simulation.paybackMonth ? `M${simulation.paybackMonth}` : '미달성'} />
            <SummaryCard icon={<DollarSign className="w-4 h-4" />} label="피크 수익" value={formatPrice(Math.round(simulation.peakRevenue * KRW_USD_RATE), simulation.peakRevenue)} />
          </div>

          {/* 수수료 & 순익 */}
          <Card>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">플랫폼 수수료</span>
                <input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-16 text-center text-sm font-semibold px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  min={0}
                  max={100}
                  step={1}
                />
                <span className="text-xs text-gray-500">%</span>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">12개월 순익</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {formatPrice(Math.round(netRevenue * KRW_USD_RATE), netRevenue)}
                </span>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">월평균 순익</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {formatPrice(Math.round((netRevenue / 12) * KRW_USD_RATE), netRevenue / 12)}
                </span>
              </div>
            </div>
          </Card>

          {/* 손익분기점 계산기 */}
          <BreakevenCalculator />
        </div>
      </div>

      {/* KPI Target Achievement Summary */}
      <KpiTargetSummary config={config} currentLtv={simulation.ltv} />
    </div>
  );
}

// ─────────────────────────────────────────────
// 손익분기점 계산기
// ─────────────────────────────────────────────
function BreakevenCalculator() {
  const [calcCpi, setCalcCpi] = useState('270');
  const [calcArpdau, setCalcArpdau] = useState('80');
  const [calcDau, setCalcDau] = useState('100000');
  const [calcCommission, setCalcCommission] = useState('30');

  const cpiKrw = parseFloat(calcCpi) || 0;
  const arpdauKrw = parseFloat(calcArpdau) || 0;
  const dau = parseInt(calcDau, 10) || 0;
  const commission = parseFloat(calcCommission) || 0;

  const cpiUsd = cpiKrw / KRW_USD_RATE;
  const arpdauUsd = arpdauKrw / KRW_USD_RATE;

  const totalAcqCost = dau * cpiUsd;
  const dailyGross = dau * arpdauUsd;
  const dailyNet = dailyGross * (1 - commission / 100);
  const breakDays = dailyNet > 0 ? Math.ceil(totalAcqCost / dailyNet) : Infinity;
  const annualGross = dailyGross * 365;
  const annualNet = annualGross * (1 - commission / 100);
  const roi = totalAcqCost > 0 ? ((annualNet - totalAcqCost) / totalAcqCost * 100).toFixed(1) : '0';

  return (
    <Card title="손익분기점 계산기" subtitle="원화 기준으로 직접 입력하여 손익분기를 시뮬레이션합니다">
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">CPI (원)</label>
            <input type="number" value={calcCpi} onChange={(e) => setCalcCpi(e.target.value)}
              className="w-full text-sm font-semibold px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" placeholder="270" />
            <span className="text-[10px] text-gray-400 mt-0.5 block">{formatPrice(cpiKrw, cpiUsd)}</span>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">ARPDAU (원)</label>
            <input type="number" value={calcArpdau} onChange={(e) => setCalcArpdau(e.target.value)}
              className="w-full text-sm font-semibold px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" placeholder="80" />
            <span className="text-[10px] text-gray-400 mt-0.5 block">{formatPrice(arpdauKrw, arpdauUsd)}</span>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">DAU (명)</label>
            <input type="number" value={calcDau} onChange={(e) => setCalcDau(e.target.value)}
              className="w-full text-sm font-semibold px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" placeholder="100000" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">수수료 (%)</label>
            <input type="number" value={calcCommission} onChange={(e) => setCalcCommission(e.target.value)}
              className="w-full text-sm font-semibold px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" placeholder="30" min={0} max={100} />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900">
            <span className="text-[10px] text-red-600 dark:text-red-400 block">총 유저 획득 비용</span>
            <span className="text-sm font-bold text-red-700 dark:text-red-300">{formatPrice(Math.round(totalAcqCost * KRW_USD_RATE), totalAcqCost)}</span>
          </div>
          <div className={`p-3 rounded-lg border ${breakDays <= 365 ? 'bg-green-50 dark:bg-green-950 border-green-100 dark:border-green-900' : 'bg-amber-50 dark:bg-amber-950 border-amber-100 dark:border-amber-900'}`}>
            <span className={`text-[10px] block ${breakDays <= 365 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>손익분기 소요일</span>
            <span className={`text-sm font-bold ${breakDays <= 365 ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
              {breakDays === Infinity ? '∞' : `${breakDays}일 (${(breakDays / 30).toFixed(1)}개월)`}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900">
            <span className="text-[10px] text-blue-600 dark:text-blue-400 block">연간 순익</span>
            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{formatPrice(Math.round(annualNet * KRW_USD_RATE), annualNet)}</span>
          </div>
          <div className={`p-3 rounded-lg border ${Number(roi) > 0 ? 'bg-green-50 dark:bg-green-950 border-green-100 dark:border-green-900' : 'bg-red-50 dark:bg-red-950 border-red-100 dark:border-red-900'}`}>
            <span className={`text-[10px] block ${Number(roi) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>ROI</span>
            <span className={`text-sm font-bold ${Number(roi) > 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{roi}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

