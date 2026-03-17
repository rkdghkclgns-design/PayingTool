import type { KnowledgeCategory } from '../../models';

interface CategoryCount {
  readonly category: KnowledgeCategory | 'all';
  readonly label: string;
  readonly count: number;
}

interface CategoryNavProps {
  readonly categories: readonly CategoryCount[];
  readonly activeCategory: KnowledgeCategory | 'all';
  readonly onCategoryChange: (category: KnowledgeCategory | 'all') => void;
}

export default function CategoryNav({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryNavProps) {
  return (
    <nav className="space-y-1">
      <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        카테고리
      </h3>
      {categories.map((cat) => {
        const isActive = cat.category === activeCategory;
        return (
          <button
            key={cat.category}
            onClick={() => onCategoryChange(cat.category)}
            className={`
              w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg
              transition-colors cursor-pointer
              ${
                isActive
                  ? 'bg-brand-50 text-brand-700 font-medium dark:bg-brand-950 dark:text-brand-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }
            `.trim()}
          >
            <span>{cat.label}</span>
            <span
              className={`
                text-xs px-2 py-0.5 rounded-full
                ${
                  isActive
                    ? 'bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }
              `.trim()}
            >
              {cat.count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
