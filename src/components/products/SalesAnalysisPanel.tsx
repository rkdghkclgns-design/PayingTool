import { useMemo } from 'react';
import { Lightbulb } from 'lucide-react';
import type { Product, SalesTechnique } from '../../models';
import { SALES_TECHNIQUE_LABELS } from '../../utils/constants';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

// ─────────────────────────────────────────────
// Sales technique analysis data
// ─────────────────────────────────────────────
interface TechniqueAdvice {
  readonly when: string;
  readonly how: string;
  readonly tip: string;
}

const TECHNIQUE_ADVICE: Readonly<Record<string, TechniqueAdvice>> = {
  standard: {
    when: '상시 노출 — 상점 메인 화면에 항상 배치',
    how: '카테고리별 정렬로 쉽게 찾을 수 있도록 배치. 가격 대비 가치를 명확히 표시.',
    tip: '상시 판매 상품은 "가성비" 프레이밍이 핵심. 일반 획득 대비 몇 배 가치인지 표기하세요.',
  },
  relay: {
    when: '유저가 이전 단계 구매를 완료했을 때 자동 노출',
    how: '1단계→2단계→3단계로 점진적 가격 상승. 각 단계마다 가치 배수도 증가시켜 "더 좋은 거래"를 인지하게 합니다.',
    tip: '릴레이 첫 단계는 $0.99~$1.99로 심리적 장벽을 낮추세요. 3단계 총합이 원래 가격의 50% 이하가 되게 설계.',
  },
  popup: {
    when: '특정 게임 이벤트 달성 시 (스테이지 클리어, 보스 처치 실패, 재화 부족 등)',
    how: '5~10초 카운트다운 타이머와 함께 "지금만 할인" 프레이밍. 거절 시 상점에서 원가로 구매 가능.',
    tip: '팝업 빈도를 세션당 2~3회로 제한하세요. 너무 잦으면 이탈률이 급증합니다.',
  },
  custom: {
    when: '유저 데이터 분석 기반 — 레벨, 전투력, 과금 이력, 플레이 패턴에 따라 개인화',
    how: 'A/B 테스트로 세그먼트별 최적 가격/구성 도출. 돌고래→고래 전환 유저에게는 프리미엄 오퍼를.',
    tip: '맞춤 오퍼는 과금 이력이 있는 유저에게 가장 효과적. NPU에게는 first_purchase가 더 적합합니다.',
  },
  limited_time: {
    when: '시즌 이벤트, 주말, 공휴일, 기념일 등 특정 기간에만 판매',
    how: '남은 시간을 카운트다운으로 표시. "오늘만" "주말 한정" 등 희소성 프레이밍.',
    tip: '한정 상품은 일반 상품 대비 30~50% 더 높은 가치를 제공하되, 가격은 10~20%만 높이세요.',
  },
  first_purchase: {
    when: '과금 이력이 없는 NPU(비과금 유저)에게만 노출',
    how: '일반가 대비 3~5배 가치의 초특가 패키지. "첫 구매 한정 90% OFF" 스타일.',
    tip: '$0.99~$2.99 가격대가 최적. 첫 결제 장벽만 넘기면 2회 이후 결제 전환율은 3~5배 높아집니다.',
  },
  level_up: {
    when: '특정 레벨(10, 20, 30...)이나 챕터 클리어 달성 시 자동 팝업',
    how: '달성 축하 UI와 함께 해당 레벨에 맞는 성장 지원 패키지 제안.',
    tip: '레벨업 오퍼는 성장 병목이 시작되는 레벨에 배치하면 전환율이 2~3배 높습니다.',
  },
  comeback: {
    when: '7일 이상 미접속 후 복귀한 유저에게 로그인 시 자동 노출',
    how: '무료 보상 + 초특가 패키지 조합. "환영합니다! 돌아오셨네요" 감성적 메시지.',
    tip: '복귀 오퍼 유효기간을 48시간으로 설정하면 긴급성과 관대함의 균형을 맞출 수 있습니다.',
  },
  bundle_step: {
    when: '상점에 상시 배치 — 1단계, 2단계, 3단계 구매 가능',
    how: '단계가 올라갈수록 가격은 증가하지만 개당 가치도 더 크게 증가. "더 많이 살수록 더 큰 혜택".',
    tip: '1단계 $4.99(2배), 2단계 $9.99(3배), 3단계 $19.99(5배) 식으로 가치 배수를 가속시키세요.',
  },
  flash_sale: {
    when: '1~2시간 한정 — 특정 시간대(저녁 8~10시 등 피크 시간)에 서버 전체 또는 개인별 노출',
    how: '대폭 할인(50~70%) + 실시간 카운트다운. "남은 수량 표시"로 추가 긴급성 부여.',
    tip: '플래시 세일은 주 1~2회로 제한. 매일 하면 "항상 할인" 인식이 생겨 정상가 구매 의욕이 떨어집니다.',
  },
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
interface SalesAnalysisPanelProps {
  readonly products: readonly Product[];
  readonly tabType: 'paid' | 'free';
}

export default function SalesAnalysisPanel({ products, tabType }: SalesAnalysisPanelProps) {
  // 현재 탭의 상품에서 사용된 판매 기법들 추출
  const usedTechniques = useMemo(() => {
    const techniqueMap = new Map<string, readonly Product[]>();
    for (const product of products) {
      const tech = product.salesTechnique ?? 'standard';
      const existing = techniqueMap.get(tech) ?? [];
      techniqueMap.set(tech, [...existing, product]);
    }
    return techniqueMap;
  }, [products]);

  if (products.length === 0) return null;

  return (
    <Card className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {tabType === 'paid' ? '유료 상품' : '비유료 상품'} 판매 전략 가이드
        </h3>
        <Badge variant="warning" size="sm">{usedTechniques.size}개 기법</Badge>
      </div>

      <div className="space-y-4">
        {Array.from(usedTechniques.entries()).map(([tech, techProducts]) => {
          const advice = TECHNIQUE_ADVICE[tech];
          const label = SALES_TECHNIQUE_LABELS.get(tech as SalesTechnique) ?? tech;
          if (!advice) return null;

          return (
            <div
              key={tech}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary" size="sm">{label}</Badge>
                <span className="text-xs text-gray-400">
                  {techProducts.length}개 상품
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">📅 언제: </span>
                  <span className="text-gray-600 dark:text-gray-400">{advice.when}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">🎯 어떻게: </span>
                  <span className="text-gray-600 dark:text-gray-400">{advice.how}</span>
                </div>
                <div className="mt-2 p-2 rounded bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                  <span className="font-medium text-amber-700 dark:text-amber-300">💡 팁: </span>
                  <span className="text-amber-600 dark:text-amber-400 text-xs">{advice.tip}</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {techProducts.map((p) => (
                  <span key={p.id} className="text-xs px-2 py-0.5 rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
