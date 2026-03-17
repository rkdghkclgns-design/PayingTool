import type { FunnelStage } from '../models';

export const DEFAULT_FUNNEL_STAGES: readonly FunnelStage[] = [
  {
    id: 'funnel-awareness',
    name: 'awareness',
    label: '인지 (Awareness)',
    order: 1,
    conversionRate: 100,
    description:
      '잠재 유저가 게임의 존재를 인지하는 단계. UA 광고, 앱스토어 추천, SNS 바이럴, 인플루언서 마케팅 등을 통해 도달한다. 목표 KPI: 노출수(Impressions), CTR(클릭률), CPI(설치당 비용).',
    assignedProductIds: [],
  },
  {
    id: 'funnel-first-session',
    name: 'first_session',
    label: '첫 세션 (First Session)',
    order: 2,
    conversionRate: 75,
    description:
      '설치 후 첫 게임 실행 및 튜토리얼 진입 단계. 초기 로딩 속도, 온보딩 UX, 첫인상이 핵심이다. 목표 KPI: 앱 실행률(설치 대비), 튜토리얼 시작률, 첫 세션 길이.',
    assignedProductIds: [],
  },
  {
    id: 'funnel-tutorial-complete',
    name: 'tutorial_complete',
    label: '튜토리얼 완료 (Tutorial Complete)',
    order: 3,
    conversionRate: 82,
    description:
      '게임 튜토리얼을 끝까지 완료하고 코어 루프에 진입하는 단계. 튜토리얼 길이(3~5분 권장), 단계별 보상, 첫 성공 경험(First Win)이 완료율을 결정한다. 목표 KPI: 튜토리얼 완료율, 단계별 이탈 지점, 완료 시간.',
    assignedProductIds: [],
  },
  {
    id: 'funnel-core-loop',
    name: 'core_loop_engaged',
    label: '코어 루프 참여 (Core Loop Engaged)',
    order: 4,
    conversionRate: 55,
    description:
      '게임의 핵심 반복 루프(전투→보상→성장→전투)에 본격적으로 참여하는 단계. D1~D3 리텐션이 이 단계의 건강도를 반영한다. 목표 KPI: D1 리텐션, 일일 세션 수, 코어 루프 완료 횟수.',
    assignedProductIds: [],
  },
  {
    id: 'funnel-first-purchase-prompt',
    name: 'first_purchase_prompt',
    label: '첫 구매 유도 (First Purchase Prompt)',
    order: 5,
    conversionRate: 40,
    description:
      '유저에게 첫 구매 기회를 제시하는 단계. 진행 속도 감소, 자원 부족 등 자연스러운 과금 동기가 형성되는 시점(D3~D7)에 스타터 팩, 한정 오퍼 등을 팝업으로 제안한다. 목표 KPI: 오퍼 노출률, 오퍼 CTR, 결제 페이지 도달률.',
    assignedProductIds: [],
  },
  {
    id: 'funnel-first-purchase',
    name: 'first_purchase',
    label: '첫 구매 완료 (First Purchase)',
    order: 6,
    conversionRate: 8,
    description:
      'NPU가 PU로 전환되는 핵심 단계. 저가($0.99~$2.99) 고가치(5~10배) 스타터 팩이 가장 효과적이다. 결제 완료 후 즉각적인 만족감과 다음 구매에 대한 기대감을 동시에 제공해야 한다. 목표 KPI: 과금 전환율, 첫 구매 상품별 전환율, 첫 구매 ARPU.',
    assignedProductIds: [],
  },
  {
    id: 'funnel-repeat-purchase',
    name: 'repeat_purchase',
    label: '반복 구매 (Repeat Purchase)',
    order: 7,
    conversionRate: 35,
    description:
      '첫 구매 유저가 두 번째 이상의 결제를 하는 단계. 첫 구매 후 48시간 이내 두 번째 구매 유도가 핵심이다. 일일 보석 패스, 배틀패스, 주간 딜 등 반복 과금 상품이 이 단계의 주력 상품이다. 목표 KPI: 반복 구매율, 구매 간격, 월 구매 횟수.',
    assignedProductIds: [],
  },
  {
    id: 'funnel-subscription',
    name: 'subscription_or_vip',
    label: '구독/VIP 전환 (Subscription or VIP)',
    order: 8,
    conversionRate: 20,
    description:
      '정기 과금 또는 VIP 시스템에 참여하는 최종 전환 단계. 월정액 VIP, 배틀패스 정기 구매, 고액 번들 반복 구매 등이 포함된다. 이 단계에 도달한 유저는 게임의 핵심 수익원이며, 이탈 방지가 최우선 과제이다. 목표 KPI: 구독 전환율, 구독 유지율, VIP 등급 분포, Whale/Super Whale 비율.',
    assignedProductIds: [],
  },
] as const;
