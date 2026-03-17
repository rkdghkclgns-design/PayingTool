import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Package,
  GitBranch,
  BarChart3,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Card from '../ui/Card';

interface QuickAction {
  readonly label: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly path: string;
  readonly color: string;
}

const ACTIONS: readonly QuickAction[] = [
  {
    label: '마인드맵 분석',
    description: '게임 구조 시각화 및 분석',
    icon: Brain,
    path: '/mindmap',
    color: 'text-purple-500 bg-purple-50 dark:bg-purple-950',
  },
  {
    label: '상품 추가',
    description: '인앱 상품 설계 및 관리',
    icon: Package,
    path: '/products',
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-950',
  },
  {
    label: '퍼널 편집',
    description: '과금 퍼널 단계 설정',
    icon: GitBranch,
    path: '/funnel',
    color: 'text-green-500 bg-green-50 dark:bg-green-950',
  },
  {
    label: '수익 시뮬레이션',
    description: '매출 예측 및 지표 분석',
    icon: BarChart3,
    path: '/metrics',
    color: 'text-orange-500 bg-orange-50 dark:bg-orange-950',
  },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card title="빠른 이동" subtitle="주요 기능에 바로 접근합니다">
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => {
          const IconComp = action.icon;
          return (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors text-left"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${action.color}`}>
                <IconComp className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {action.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {action.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
