import {
  Anchor,
  Package,
  Clock,
  Target,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Card from '../ui/Card';

interface Strategy {
  readonly id: string;
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description: string;
  readonly actions: readonly string[];
  readonly example: string;
}

const STRATEGIES: readonly Strategy[] = [
  {
    id: 'anchoring',
    icon: Anchor,
    title: '가격 앵커링',
    description: '고가 상품을 먼저 노출하여 중간 가격대 상품의 가성비를 부각시키는 전략입니다.',
    actions: [
      '상점 최상단에 프리미엄 패키지 배치',
      '가격 대비 가치를 시각적으로 비교 표시',
      '"인기" 또는 "추천" 태그로 중간 가격대 유도',
    ],
    example: '예: ₩110,000 (프리미엄) > ₩55,000 (인기!) > ₩12,000',
  },
  {
    id: 'bundle',
    icon: Package,
    title: '번들 전략',
    description: '여러 아이템을 묶어 거래 단가를 높이고, 개별 구매 대비 할인 효과를 제공합니다.',
    actions: [
      '핵심 재화 + 보조 아이템 조합 번들 구성',
      '개별 구매 대비 20~40% 할인율 표시',
      '단계별 번들 (스타터/어드밴스드/프로) 제공',
    ],
    example: '예: 다이아 1,000 + 골드 50,000 + 스킨 1종 = ₩33,000 (40% 할인)',
  },
  {
    id: 'dynamic-pricing',
    icon: Clock,
    title: '다이나믹 프라이싱',
    description: '시간 제한 오퍼를 통해 긴급성을 부여하고 즉각적인 구매 결정을 유도합니다.',
    actions: [
      '로그인 후 24시간 한정 웰컴 오퍼',
      '주말/이벤트 기간 한정 플래시 세일',
      '구매 직후 업셀링 팝업 (2배 가치 오퍼)',
    ],
    example: '예: "오늘만! 다이아 2배 지급" - 남은 시간: 23:59:59',
  },
  {
    id: 'segment-targeting',
    icon: Target,
    title: '세그먼트 타겟팅',
    description: '유저 과금 세그먼트별로 최적화된 오퍼를 제공하여 전환율과 ARPPU를 극대화합니다.',
    actions: [
      'Minnow: 저가 일일 패키지로 습관 형성',
      'Dolphin: 중가 주간/월간 구독 제안',
      'Whale: 고가 VIP 전용 패키지 및 독점 콘텐츠',
    ],
    example: '예: 무과금 유저에게 ₩1,200 스타터팩 / 고과금에게 ₩110,000 VIP',
  },
  {
    id: 'churn-prevention',
    icon: ShieldAlert,
    title: '이탈 방지',
    description: '이탈 징후가 있는 유저에게 리텐션 오퍼를 제공하여 복귀를 유도합니다.',
    actions: [
      'D3 미접속 유저에게 푸시 + 무료 보상',
      'D7 미접속 시 복귀 한정 50% 할인 오퍼',
      '과금 유저 이탈 시 개인화 VIP 복귀 패키지',
    ],
    example: '예: "돌아오세요! 복귀 기념 다이아 500 + 7일 VIP 무료"',
  },
  {
    id: 'content-gating',
    icon: Lock,
    title: '콘텐츠 게이팅',
    description: '특정 콘텐츠에 과금 장벽을 설정하여 프리미엄 가치를 창출합니다.',
    actions: [
      '추가 스테이지/챕터 유료 잠금 해제',
      '배틀패스 프리미엄 트랙 분리',
      '독점 코스메틱/캐릭터 유료 해제',
    ],
    example: '예: 무료 10스테이지 / 유료 해금 시 50스테이지 추가',
  },
];

const ICON_COLORS: readonly string[] = [
  'text-blue-500 bg-blue-50 dark:bg-blue-950',
  'text-purple-500 bg-purple-50 dark:bg-purple-950',
  'text-orange-500 bg-orange-50 dark:bg-orange-950',
  'text-green-500 bg-green-50 dark:bg-green-950',
  'text-red-500 bg-red-50 dark:bg-red-950',
  'text-indigo-500 bg-indigo-50 dark:bg-indigo-950',
];

export default function ArpuDefensePanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {STRATEGIES.map((strategy, idx) => {
        const IconComp = strategy.icon;
        const colorClass = ICON_COLORS[idx % ICON_COLORS.length];

        return (
          <Card key={strategy.id}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {strategy.title}
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {strategy.description}
              </p>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  권장 액션
                </span>
                <ul className="flex flex-col gap-1">
                  {strategy.actions.map((action) => (
                    <li key={action} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 text-xs text-gray-600 dark:text-gray-400 italic">
                {strategy.example}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
