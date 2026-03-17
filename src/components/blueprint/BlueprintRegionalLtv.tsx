import type { RegionalLtv, RangedMetric } from '../../models/genre-blueprint';
import Card from '../ui/Card';

interface BlueprintRegionalLtvProps {
  readonly regionalLtv: readonly RegionalLtv[];
}

const REGION_LABELS: Readonly<Record<string, string>> = {
  kr: '한국',
  jp: '일본',
  cn: '중국',
  global: '글로벌',
};

function formatRange(metric: RangedMetric): string {
  return `$${metric.low.toFixed(1)} / $${metric.median.toFixed(1)} / $${metric.high.toFixed(1)}`;
}

export default function BlueprintRegionalLtv({ regionalLtv }: BlueprintRegionalLtvProps) {
  return (
    <Card title="지역별 LTV" subtitle="Low / Median / High (USD)">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                지역
              </th>
              <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                D30 LTV
              </th>
              <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                D90 LTV
              </th>
              <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                D180 LTV
              </th>
              <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                비고
              </th>
            </tr>
          </thead>
          <tbody>
            {regionalLtv.map((region) => (
              <tr
                key={region.region}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="py-2.5 px-3 font-medium text-gray-900 dark:text-gray-100">
                  {REGION_LABELS[region.region] ?? region.label}
                </td>
                <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300 font-mono text-xs">
                  {formatRange(region.d30Ltv)}
                </td>
                <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300 font-mono text-xs">
                  {formatRange(region.d90Ltv)}
                </td>
                <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300 font-mono text-xs">
                  {formatRange(region.d180Ltv)}
                </td>
                <td className="py-2.5 px-3 text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                  {region.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
