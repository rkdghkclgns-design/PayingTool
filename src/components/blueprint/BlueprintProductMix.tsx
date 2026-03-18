import { useMemo } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import type { ProductMixItem } from '../../models/genre-blueprint';
import Card from '../ui/Card';

interface BlueprintProductMixProps {
  readonly productMix: readonly ProductMixItem[];
}

const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#a855f7',
] as const;

export default function BlueprintProductMix({ productMix }: BlueprintProductMixProps) {
  const chartData = useMemo(
    () =>
      productMix.map((item) => ({
        name: item.labelKo,
        value: item.recommendedPct,
      })),
    [productMix],
  );

  return (
    <Card title="상품 구성 비율" subtitle="추천 매출 비중 (%)">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={90}
              dataKey="value"
              label={({ name, value }) => `${name} ${value}%`}
              labelLine={{ strokeWidth: 1 }}
            >
              {chartData.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value}%`, '비중']}
            />
            <Legend
              formatter={(value: string) => (
                <span className="text-xs text-gray-700 dark:text-gray-300">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
