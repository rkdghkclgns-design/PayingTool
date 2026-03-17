import { useState, useMemo, useCallback } from 'react';
import { BookOpen, BarChart3, Globe, Search as SearchIcon } from 'lucide-react';
import type { KnowledgeCategory } from '../../models';
import { KNOWLEDGE_BASE } from '../../data/knowledge-base';
import { GENRE_BENCHMARKS } from '../../data/benchmarks';
import PageContainer from '../layout/PageContainer';
import EmptyState from '../ui/EmptyState';
import TermSearch from './TermSearch';
import CategoryNav from './CategoryNav';
import TermCard from './TermCard';
import BenchmarkTable from './BenchmarkTable';
import MarketComparisonPanel from './MarketComparisonPanel';

type ViewTab = 'terms' | 'benchmarks' | 'markets';

const CATEGORY_LABELS: Record<KnowledgeCategory, string> = {
  revenue_metrics: '매출 지표',
  user_segmentation: '유저 세분화',
  retention: '리텐션',
  monetization_models: '수익화 모델',
  funnel: '퍼널',
  pricing_strategy: '가격 전략',
  cash_shop: '캐시샵',
  market_specific: '시장별 특성',
};

const TAB_ITEMS: readonly { readonly key: ViewTab; readonly label: string; readonly icon: typeof BookOpen }[] = [
  { key: 'terms', label: '용어 사전', icon: BookOpen },
  { key: 'benchmarks', label: '벤치마크', icon: BarChart3 },
  { key: 'markets', label: '시장 비교', icon: Globe },
];

export default function KnowledgeBasePage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<KnowledgeCategory | 'all'>('all');
  const [activeTab, setActiveTab] = useState<ViewTab>('terms');

  const categories = useMemo(() => {
    const counts = new Map<KnowledgeCategory, number>();
    for (const entry of KNOWLEDGE_BASE) {
      counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1);
    }
    const items = [
      { category: 'all' as const, label: '전체', count: KNOWLEDGE_BASE.length },
      ...Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
        category: key as KnowledgeCategory,
        label,
        count: counts.get(key as KnowledgeCategory) ?? 0,
      })),
    ];
    return items.filter((item) => item.category === 'all' || item.count > 0);
  }, []);

  const matchesSearch = useCallback(
    (text: string) => text.toLowerCase().includes(query.toLowerCase()),
    [query]
  );

  const filteredEntries = useMemo(() => {
    return KNOWLEDGE_BASE.filter((entry) => {
      const categoryMatch = activeCategory === 'all' || entry.category === activeCategory;
      if (!categoryMatch) return false;
      if (!query) return true;
      return (
        matchesSearch(entry.term) ||
        matchesSearch(entry.termKo) ||
        matchesSearch(entry.definition) ||
        entry.tags.some((tag) => matchesSearch(tag))
      );
    });
  }, [query, activeCategory, matchesSearch]);

  return (
    <PageContainer
      title="지식베이스"
      description="게임 유료화 전략의 핵심 개념, 벤치마크 데이터, 시장별 특성을 한눈에 확인하세요"
    >
      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-800">
        {TAB_ITEMS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                border-b-2 transition-colors cursor-pointer -mb-px
                ${
                  isActive
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }
              `.trim()}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Terms Tab: Two-column layout */}
      {activeTab === 'terms' && (
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              <CategoryNav
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-4">
            <TermSearch
              query={query}
              onQueryChange={setQuery}
              resultCount={filteredEntries.length}
              totalCount={KNOWLEDGE_BASE.length}
            />

            {/* Mobile category select */}
            <div className="lg:hidden">
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value as KnowledgeCategory | 'all')}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                {categories.map((cat) => (
                  <option key={cat.category} value={cat.category}>
                    {cat.label} ({cat.count})
                  </option>
                ))}
              </select>
            </div>

            {filteredEntries.length > 0 ? (
              <div className="space-y-3">
                {filteredEntries.map((entry) => (
                  <TermCard key={entry.id} entry={entry} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={SearchIcon}
                title="검색 결과 없음"
                description="다른 검색어나 카테고리를 시도해보세요."
              />
            )}
          </div>
        </div>
      )}

      {/* Benchmarks Tab */}
      {activeTab === 'benchmarks' && (
        <BenchmarkTable benchmarks={GENRE_BENCHMARKS} />
      )}

      {/* Markets Tab */}
      {activeTab === 'markets' && (
        <MarketComparisonPanel entries={[...KNOWLEDGE_BASE]} />
      )}
    </PageContainer>
  );
}
