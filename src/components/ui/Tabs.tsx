interface Tab {
  readonly id: string;
  readonly label: string;
  readonly count?: number;
}

interface TabsProps {
  readonly tabs: readonly Tab[];
  readonly activeTab: string;
  readonly onChange: (tabId: string) => void;
}

export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <nav className="flex gap-0 -mb-px" role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`
                relative px-4 py-2.5 text-sm font-medium transition-colors
                border-b-2 whitespace-nowrap
                ${
                  isActive
                    ? 'text-brand-600 border-brand-500 dark:text-brand-400 dark:border-brand-400'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }
              `.trim()}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`
                    ml-2 px-2 py-0.5 text-xs font-medium rounded-full
                    ${
                      isActive
                        ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }
                  `.trim()}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
