import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { GenreBenchmark } from '../../data/benchmarks';

interface BenchmarkTableProps {
  readonly benchmarks: readonly GenreBenchmark[];
}

type SortField =
  | 'genreKo'
  | 'd1Retention'
  | 'd7Retention'
  | 'd30Retention'
  | 'conversionRate'
  | 'arpdau'
  | 'arppu';

type SortDirection = 'asc' | 'desc';

const COLUMNS: readonly { readonly field: SortField; readonly label: string }[] = [
  { field: 'genreKo', label: '장르' },
  { field: 'd1Retention', label: 'D1 리텐션(%)' },
  { field: 'd7Retention', label: 'D7 리텐션(%)' },
  { field: 'd30Retention', label: 'D30 리텐션(%)' },
  { field: 'conversionRate', label: '전환율(%)' },
  { field: 'arpdau', label: 'ARPDAU($)' },
  { field: 'arppu', label: 'ARPPU($)' },
];

function getSortValue(benchmark: GenreBenchmark, field: SortField): number | string {
  if (field === 'genreKo') return benchmark.genreKo;
  return benchmark[field].median;
}

function RangeCell({ low, median, high }: { readonly low: number; readonly median: number; readonly high: number }) {
  return (
    <td className="px-3 py-3 text-sm whitespace-nowrap">
      <span className="text-gray-400 dark:text-gray-500">{low}</span>
      <span className="mx-1 font-semibold text-gray-900 dark:text-gray-100">{median}</span>
      <span className="text-gray-400 dark:text-gray-500">{high}</span>
    </td>
  );
}

function SortIcon({ field, sortField, sortDir }: {
  readonly field: SortField;
  readonly sortField: SortField;
  readonly sortDir: SortDirection;
}) {
  if (field !== sortField) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
  return sortDir === 'asc'
    ? <ArrowUp className="w-3 h-3 text-brand-500" />
    : <ArrowDown className="w-3 h-3 text-brand-500" />;
}

export default function BenchmarkTable({ benchmarks }: BenchmarkTableProps) {
  const [sortField, setSortField] = useState<SortField>('genreKo');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    const items = [...benchmarks];
    items.sort((a, b) => {
      const aVal = getSortValue(a, sortField);
      const bVal = getSortValue(b, sortField);
      const cmp = typeof aVal === 'string'
        ? aVal.localeCompare(bVal as string)
        : (aVal as number) - (bVal as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [benchmarks, sortField, sortDir]);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="w-full text-left">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.field}
                onClick={() => handleSort(col.field)}
                className="px-3 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors select-none"
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  <SortIcon field={col.field} sortField={sortField} sortDir={sortDir} />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {sorted.map((bm) => (
            <tr
              key={bm.genre}
              className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td className="px-3 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                {bm.genreKo}
              </td>
              <RangeCell {...bm.d1Retention} />
              <RangeCell {...bm.d7Retention} />
              <RangeCell {...bm.d30Retention} />
              <RangeCell {...bm.conversionRate} />
              <RangeCell {...bm.arpdau} />
              <RangeCell {...bm.arppu} />
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-400 dark:text-gray-500 text-right">
        수치: 하위 / 중간값 / 상위
      </div>
    </div>
  );
}
