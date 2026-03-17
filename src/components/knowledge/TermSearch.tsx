import { Search } from 'lucide-react';

interface TermSearchProps {
  readonly query: string;
  readonly onQueryChange: (query: string) => void;
  readonly resultCount: number;
  readonly totalCount: number;
}

export default function TermSearch({
  query,
  onQueryChange,
  resultCount,
  totalCount,
}: TermSearchProps) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="용어, 정의, 태그로 검색..."
          className={`
            w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border
            bg-white text-gray-900 placeholder-gray-400
            dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500
            border-gray-300 dark:border-gray-700
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
            transition-colors
          `.trim()}
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {query
          ? `${totalCount}개 중 ${resultCount}개 결과`
          : `총 ${totalCount}개 용어`}
      </p>
    </div>
  );
}
