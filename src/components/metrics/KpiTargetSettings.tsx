import { useState } from 'react';
import { ChevronDown, ChevronUp, Target } from 'lucide-react';
import type { MetricsConfig } from '../../models';
import Card from '../ui/Card';

interface KpiTargetSettingsProps {
  readonly config: MetricsConfig;
  readonly onUpdateTarget: <K extends keyof MetricsConfig>(
    key: K,
    value: MetricsConfig[K],
  ) => void;
}

interface TargetInputProps {
  readonly label: string;
  readonly value: number;
  readonly suffix: string;
  readonly step: number;
  readonly min: number;
  readonly max: number;
  readonly isPercentage: boolean;
  readonly onChange: (value: number) => void;
}

function TargetInput({ label, value, suffix, step, min, max, isPercentage, onChange }: TargetInputProps) {
  const displayValue = isPercentage ? (value * 100).toFixed(1) : value.toFixed(2);

  const handleChange = (raw: string) => {
    const parsed = parseFloat(raw);
    if (Number.isNaN(parsed)) return;
    const next = isPercentage ? parsed / 100 : parsed;
    const clamped = Math.min(Math.max(next, min), max);
    onChange(clamped);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          step={isPercentage ? (step * 100) : step}
          className="w-full px-3 py-1.5 pr-10 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          {suffix}
        </span>
      </div>
    </div>
  );
}

const TARGET_CONFIGS: readonly {
  readonly key: keyof MetricsConfig;
  readonly label: string;
  readonly suffix: string;
  readonly step: number;
  readonly min: number;
  readonly max: number;
  readonly isPercentage: boolean;
}[] = [
  { key: 'targetLtv', label: 'Target LTV', suffix: 'USD', step: 0.5, min: 0, max: 100, isPercentage: false },
  { key: 'targetArpu', label: 'Target ARPU', suffix: 'USD', step: 0.1, min: 0, max: 10, isPercentage: false },
  { key: 'targetConversion', label: 'Target 전환율', suffix: '%', step: 0.01, min: 0, max: 1, isPercentage: true },
  { key: 'targetD1Retention', label: 'Target D1 리텐션', suffix: '%', step: 0.01, min: 0, max: 1, isPercentage: true },
  { key: 'targetD7Retention', label: 'Target D7 리텐션', suffix: '%', step: 0.01, min: 0, max: 1, isPercentage: true },
  { key: 'targetD30Retention', label: 'Target D30 리텐션', suffix: '%', step: 0.005, min: 0, max: 1, isPercentage: true },
];

export default function KpiTargetSettings({ config, onUpdateTarget }: KpiTargetSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-brand-500" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            KPI 목표 설정
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TARGET_CONFIGS.map((tc) => (
            <TargetInput
              key={tc.key}
              label={tc.label}
              value={config[tc.key] as number}
              suffix={tc.suffix}
              step={tc.step}
              min={tc.min}
              max={tc.max}
              isPercentage={tc.isPercentage}
              onChange={(v) => onUpdateTarget(tc.key, v as MetricsConfig[typeof tc.key])}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
