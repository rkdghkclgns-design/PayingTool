import { useState } from 'react';
import { ChevronDown, ChevronUp, Tag, LinkIcon } from 'lucide-react';
import type { KnowledgeEntry, KnowledgeBenchmark } from '../../models';
import Badge from '../ui/Badge';

interface TermCardProps {
  readonly entry: KnowledgeEntry;
}

const CATEGORY_LABELS: Record<string, string> = {
  revenue_metrics: '매출 지표',
  user_segmentation: '유저 세분화',
  retention: '리텐션',
  monetization_models: '수익화 모델',
  funnel: '퍼널',
  pricing_strategy: '가격 전략',
  cash_shop: '캐시샵',
  market_specific: '시장별 특성',
};

function BenchmarkDisplay({ benchmark }: { readonly benchmark: KnowledgeBenchmark }) {
  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      <div className="bg-red-50 dark:bg-red-950 rounded-lg p-2">
        <p className="text-xs text-red-600 dark:text-red-400 font-medium">하위</p>
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">
          {benchmark.low}
        </p>
      </div>
      <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-2">
        <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">중간값</p>
        <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
          {benchmark.median}
        </p>
      </div>
      <div className="bg-green-50 dark:bg-green-950 rounded-lg p-2">
        <p className="text-xs text-green-600 dark:text-green-400 font-medium">상위</p>
        <p className="text-sm font-semibold text-green-700 dark:text-green-300">
          {benchmark.high}
        </p>
      </div>
      <div className="bg-brand-50 dark:bg-brand-950 rounded-lg p-2">
        <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">상위 10%</p>
        <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
          {benchmark.topDecile}
        </p>
      </div>
      <p className="col-span-4 text-xs text-gray-400 dark:text-gray-500 text-right">
        단위: {benchmark.unit} | 출처: {benchmark.source}
      </p>
    </div>
  );
}

export default function TermCard({ entry }: TermCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`
        border rounded-xl transition-all
        ${expanded ? 'border-brand-300 dark:border-brand-700 shadow-md' : 'border-gray-200 dark:border-gray-800'}
        bg-white dark:bg-gray-900
      `.trim()}
    >
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {entry.termKo}
            </h4>
            <span className="text-sm text-gray-400 dark:text-gray-500">
              {entry.term}
            </span>
            <Badge variant="primary" size="sm">
              {CATEGORY_LABELS[entry.category] ?? entry.category}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {entry.definition}
          </p>
        </div>
        <div className="flex-shrink-0 ml-4 text-gray-400 dark:text-gray-500">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
          {entry.formula && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                산출 공식
              </p>
              <code className="block text-sm bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-gray-800 dark:text-gray-200 font-mono">
                {entry.formula}
              </code>
            </div>
          )}

          {entry.benchmark && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                벤치마크
              </p>
              <BenchmarkDisplay benchmark={entry.benchmark} />
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
              활용 예시
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {entry.example}
            </p>
          </div>

          {entry.relatedTerms.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 flex items-center gap-1">
                <LinkIcon className="w-3 h-3" />
                관련 용어
              </p>
              <div className="flex flex-wrap gap-1.5">
                {entry.relatedTerms.map((rt) => (
                  <Badge key={rt} variant="default" size="sm">
                    {rt}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {entry.tags.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                태그
              </p>
              <div className="flex flex-wrap gap-1.5">
                {entry.tags.map((tag) => (
                  <Badge key={tag} variant="success" size="sm">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
