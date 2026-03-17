import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Brain,
  Package,
  Filter,
  BarChart3,
  Database,
  BookOpen,
  X,
} from 'lucide-react';
import { useUiStore } from '../../stores/ui-store';

interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly icon: typeof LayoutDashboard;
}

const navItems: readonly NavItem[] = [
  { path: '/', label: '대시보드', icon: LayoutDashboard },
  { path: '/mindmap', label: '마인드맵 분석', icon: Brain },
  { path: '/products', label: '상품 설계', icon: Package },
  { path: '/funnel', label: '퍼널 디자인', icon: Filter },
  { path: '/metrics', label: '지표 전략', icon: BarChart3 },
  { path: '/schema', label: '데이터 스키마', icon: Database },
  { path: '/knowledge', label: '지식베이스', icon: BookOpen },
];

export default function Sidebar() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64
          bg-white border-r border-gray-200
          dark:bg-gray-950 dark:border-gray-800
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `.trim()}
      >
        {/* Logo / Title */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800">
          <NavLink to="/" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">PT</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              PayingTool
            </span>
          </NavLink>
          <button
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 lg:hidden transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="사이드바 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-thin">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-colors duration-150
                      ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-200'
                      }
                    `.trim()
                    }
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            PayingTool v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
}
