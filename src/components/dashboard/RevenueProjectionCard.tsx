import { useMemo } from 'react';
import { TrendingUp, DollarSign, Calendar, Zap } from 'lucide-react';
import { useMetricsStore } from '../../stores/metrics-store';
import { simulateRevenue } from '../../utils/revenue-calculator';
import { formatUSD, formatCompactNumber } from '../../utils/formatters';
import Card from '../ui/Card';

export default function RevenueProjectionCard() {
  const config = useMetricsStore((s) => s.config);

  const simulation = useMemo(() => simulateRevenue(config, 12), [config]);

  const metrics = [
    {
      icon: <DollarSign className="w-4 h-4 text-green-500" />,
      label: '12개월 예상 수익',
      value: formatUSD(simulation.totalRevenue),
    },
    {
      icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
      label: 'LTV',
      value: formatUSD(simulation.ltv),
    },
    {
      icon: <Calendar className="w-4 h-4 text-purple-500" />,
      label: '페이백 시점',
      value: simulation.paybackMonth ? `${simulation.paybackMonth}개월` : '미달성',
    },
    {
      icon: <Zap className="w-4 h-4 text-orange-500" />,
      label: '피크 월 수익',
      value: formatCompactNumber(simulation.peakRevenue),
    },
  ];

  return (
    <Card title="수익 프로젝션" subtitle="현재 지표 설정 기반 12개월 예측">
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="flex flex-col gap-1 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
          >
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              {m.icon}
              <span className="text-xs font-medium">{m.label}</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {m.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
