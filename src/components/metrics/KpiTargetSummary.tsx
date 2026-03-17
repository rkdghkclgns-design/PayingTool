import { CheckCircle2, XCircle } from 'lucide-react';
import type { MetricsConfig } from '../../models';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface KpiTargetSummaryProps {
  readonly config: MetricsConfig;
  readonly currentLtv: number;
}

interface KpiCheck {
  readonly label: string;
  readonly current: number;
  readonly target: number;
  readonly isPercentage: boolean;
}

function formatValue(value: number, isPercentage: boolean): string {
  if (isPercentage) return `${(value * 100).toFixed(1)}%`;
  return `$${value.toFixed(2)}`;
}

export default function KpiTargetSummary({ config, currentLtv }: KpiTargetSummaryProps) {
  const checks: readonly KpiCheck[] = [
    { label: 'LTV', current: currentLtv, target: config.targetLtv, isPercentage: false },
    { label: 'ARPU (ARPDAU)', current: config.arpdau, target: config.targetArpu, isPercentage: false },
    { label: '과금 전환율', current: config.conversionRate, target: config.targetConversion, isPercentage: true },
    { label: 'D1 리텐션', current: config.d1Retention, target: config.targetD1Retention, isPercentage: true },
    { label: 'D7 리텐션', current: config.d7Retention, target: config.targetD7Retention, isPercentage: true },
    { label: 'D30 리텐션', current: config.d30Retention, target: config.targetD30Retention, isPercentage: true },
  ];

  const achievedCount = checks.filter((c) => c.current >= c.target).length;
  const totalCount = checks.length;

  return (
    <Card
      title="KPI 목표 달성 현황"
      subtitle={`${achievedCount}/${totalCount} 달성`}
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
