import { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Target } from 'lucide-react';
import type { MetricsConfig } from '../../models';
import { useMetricsStore } from '../../stores/metrics-store';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface KpiTargetSummaryProps {
  readonly config: MetricsConfig;
  readonly currentLtv: number;
}

interface KpiCheck {
  readonly label: string;
  readonly current: number;
  readonly target: number;
  readonly isPercentage: boolean;
  readonly configKey: keyof MetricsConfig;
}

function formatValue(value: number, isPercentage: boolean): string {
  if (isPercentage) return `${(value * 100).toFixed(1)}%`;
  return `$${value.toFixed(2)}`;
}

export default function KpiTargetSummary({ config, currentLtv }: KpiTargetSummaryProps) {
  const updateMetric = useMetricsStore((s) => s.updateMetric);
  const [applied, setApplied] = useState(false);

  const checks: readonly KpiCheck[] = [
    { label: 'LTV', current: currentLtv, target: config.targetLtv, isPercentage: false, configKey: 'arpdau' },
    { label: 'ARPU (ARPDAU)', current: config.arpdau, target: config.targetArpu, isPercentage: false, configKey: 'arpdau' },
    { label: '과금 전환율', current: config.conversionRate, target: config.targetConversion, isPercentage: true, configKey: 'conversionRate' },
    { label: 'D1 리텐션', current: config.d1Retention, target: config.targetD1Retention, isPercentage: true, configKey: 'd1Retention' },
    { label: 'D7 리텐션', current: config.d7Retention, target: config.targetD7Retention, isPercentage: true, configKey: 'd7Retention' },
    { label: 'D30 리텐션', current: config.d30Retention, target: config.targetD30Retention, isPercentage: true, configKey: 'd30Retention' },
  ];

  const achievedCount = checks.filter((c) => c.current >= c.target).length;
  const totalCount = checks.length;

  const handleApplyTargets = useCallback(() => {
    // 목표값을 지표 설정에 반영
    updateMetric('arpdau', config.targetArpu);
    updateMetric('conversionRate', config.targetConversion);
    updateMetric('d1Retention', config.targetD1Retention);
    updateMetric('d7Retention', config.targetD7Retention);
    updateMetric('d30Retention', config.targetD30Retention);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  }, [config, updateMetric]);

  return (
    <Card
      title="KPI 목표 달성 현황"
      subtitle={`${achievedCount}/${totalCount} 달성`}
      headerAction={
        <Button
          variant={applied ? 'secondary' : 'primary'}
          size="sm"
          onClick={handleApplyTargets}
          icon={<Target className="w-3.5 h-3.5" />}
        >
          {applied ? '적용 완료!' : '목표 달성 적용'}
        </Button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {checks.map((check) => {
          const achieved = check.current >= check.target;
          return (
            <div
              key={check.label}
              className={`
                flex items-center justify-between p-3 rounded-lg border
                ${
                  achieved
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                }
              `.trim()}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                  {check.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatValue(check.current, check.isPercentage)} / {formatValue(check.target, check.isPercentage)}
                </p>
              </div>
              <div className="flex-shrink-0 ml-2">
                {achieved ? (
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    달성
                  </Badge>
                ) : (
                  <Badge variant="danger" size="sm">
                    <XCircle className="w-3 h-3 mr-1" />
                    미달성
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
