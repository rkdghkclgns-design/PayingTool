import type { KnowledgeEntry } from '../models';

export const KNOWLEDGE_BASE: readonly KnowledgeEntry[] = [
  // ─────────────────────────────────────────────
  // 1. Revenue Metrics (매출 지표)
  // ─────────────────────────────────────────────
  {
    id: 'km-rev-001',
    term: 'ARPU',
    termKo: '유저당 평균 매출',
    category: 'revenue_metrics',
    definition:
      'Average Revenue Per User의 약자로, 전체 유저(비과금 유저 포함) 대비 평균 매출을 나타내는 핵심 수익성 지표이다. 게임의 전반적인 수익화 효율을 평가할 때 가장 기본이 되는 지표이며, 과금 전환율과 ARPPU의 곱으로 분해하여 분석할 수 있다.',
    formula: 'ARPU = 총 매출 / 총 유저 수 (= 과금 전환율 x ARPPU)',
    benchmark: {
      low: 0.02,
      median: 0.08,
      high: 0.25,
      topDecile: 0.5,
      unit: 'USD/일',
      source: 'Sensor Tower 2024 Mobile Gaming Report',
    },
    example:
      '월 매출 1억 원, MAU 50만 명인 RPG 게임의 ARPU는 200원/월이다. 이를 과금 전환율 3%와 ARPPU 6,667원으로 분해하여, 전환율을 높일지 객단가를 높일지 전략적 의사결정을 내릴 수 있다.',
    relatedTerms: ['ARPPU', 'ARPDAU', 'LTV', 'Conversion Rate'],
    tags: ['매출', '수익성', 'KPI', '기본지표'],
  },
  {
    id: 'km-rev-002',
    term: 'ARPPU',
    termKo: '과금 유저당 평균 매출',
    category: 'revenue_metrics',
    definition:
      'Average Revenue Per Paying User의 약자로, 실제 결제를 한 유저(PU)만을 대상으로 계산한 평균 매출이다. 과금 유저의 지출 깊이(spending depth)를 측정하는 지표이며, 상품 가격 전략과 번들 구성의 효과를 직접적으로 반영한다.',
    formula: 'ARPPU = 총 매출 / 과금 유저 수',
    benchmark: {
      low: 5,
      median: 15,
      high: 45,
      topDecile: 100,
      unit: 'USD/월',
      source: 'App Annie 2024 State of Mobile',
    },
    example:
      '월 매출 5억 원, PU 1만 명인 게임의 ARPPU는 50,000원/월이다. 배틀패스($9.99) 도입 후 ARPPU가 35,000원에서 50,000원으로 상승했다면, 중과금 구간의 지출이 증가한 것으로 해석할 수 있다.',
    relatedTerms: ['ARPU', 'PU', 'Whale', 'Dolphin'],
    tags: ['매출', '과금유저', '객단가', 'KPI'],
  },
  {
    id: 'km-rev-003',
    term: 'ARPDAU',
    termKo: 'DAU당 평균 매출',
    category: 'revenue_metrics',
    definition:
      'Average Revenue Per Daily Active User의 약자로, 일일 활성 유저(DAU) 기준으로 계산한 평균 매출이다. 일별 수익화 효율을 실시간으로 모니터링하는 데 가장 적합한 지표이며, 이벤트나 업데이트의 즉각적인 매출 영향을 파악할 수 있다.',
    formula: 'ARPDAU = 일일 매출 / DAU',
    benchmark: {
      low: 0.03,
      median: 0.1,
      high: 0.35,
      topDecile: 0.8,
      unit: 'USD',
      source: 'GameAnalytics 2024 Benchmark Report',
    },
    example:
      'DAU 10만 명인 퍼즐 게임의 일일 매출이 $5,000이면 ARPDAU는 $0.05이다. 한정 판매 이벤트 기간에 ARPDAU가 $0.15로 상승했다면 이벤트 효과가 3배 수준이라고 평가할 수 있다.',
    relatedTerms: ['ARPU', 'DAU', 'Revenue', 'Conversion Rate'],
    tags: ['매출', '일일지표', '실시간', '모니터링'],
  },
  {
    id: 'km-rev-004',
    term: 'LTV',
    termKo: '생애 가치',
    category: 'revenue_metrics',
    definition:
      'Lifetime Value의 약자로, 한 유저가 게임 생애주기 동안 발생시킬 것으로 예상되는 총 매출이다. CPI(유저 획득 비용) 대비 LTV를 비교하여 마케팅 투자의 수익성을 판단하는 데 핵심적인 지표이다. 일반적으로 D7 LTV, D30 LTV, D180 LTV 등 기간별로 추정한다.',
    formula: 'LTV = ARPDAU x 평균 생애일수 (또는 Σ(D_n 리텐션 x ARPDAU_n))',
    benchmark: {
      low: 0.5,
      median: 2.5,
      high: 10,
      topDecile: 30,
      unit: 'USD',
      source: 'Adjust & Liftoff 2024 Mobile Ad Report',
    },
    example:
      'ARPDAU $0.10, 평균 생애일수 90일인 캐주얼 게임의 LTV는 $9.0이다. CPI가 $2.0이면 LTV/CPI = 4.5로 수익성이 좋다고 판단한다. 일반적으로 LTV/CPI > 1.5를 손익분기 기준으로 본다.',
    relatedTerms: ['ARPDAU', 'CPI', 'Retention', 'Payback Period'],
    tags: ['매출', '유저가치', '마케팅', 'UA'],
  },
  {
    id: 'km-rev-005',
    term: 'Conversion Rate',
    termKo: '과금 전환율',
    category: 'revenue_metrics',
    definition:
      '전체 활성 유저 중 실제로 결제를 한 유저의 비율이다. 무과금 유저를 과금 유저로 전환하는 퍼널 효율을 측정하며, 게임의 수익화 모델 건강도를 판단하는 핵심 지표이다. 장르별로 적정 범위가 크게 다르며, 과도하게 높은 전환율은 오히려 과금 압박이 심하다는 신호일 수 있다.',
    formula: 'Conversion Rate = 과금 유저 수 / 전체 활성 유저 수 x 100%',
    benchmark: {
      low: 1.0,
      median: 3.5,
      high: 8.0,
      topDecile: 15.0,
      unit: '%',
      source: 'AppsFlyer 2024 Gaming Report',
    },
    example:
      'MAU 100만 명 중 과금 유저가 3만 명이면 전환율은 3%이다. 스타터 팩($0.99) 도입 후 전환율이 2%에서 4%로 올랐다면, NPU 전환 전략이 효과적이었다고 평가할 수 있다.',
    relatedTerms: ['NPU', 'First Purchase', 'Starter Pack', 'ARPU'],
    tags: ['전환', '과금', '퍼널', 'KPI'],
  },
  {
    id: 'km-rev-006',
    term: 'RPI',
    termKo: '설치당 매출',
    category: 'revenue_metrics',
    definition:
      'Revenue Per Install의 약자로, 설치 건당 발생하는 평균 매출이다. UA(유저 획득) 캠페인의 효율을 판단할 때 CPI와 직접 비교하여 사용한다. 설치 후 일정 기간(보통 D7, D30) 동안의 누적 매출로 계산한다.',
    formula: 'RPI = 기간 내 총 매출 / 해당 기간 설치 수',
    benchmark: {
      low: 0.05,
      median: 0.2,
      high: 1.0,
      topDecile: 3.0,
      unit: 'USD',
      source: 'ironSource 2024 LevelUp Report',
    },
    example:
      'D7 기준 설치 10,000건에서 $2,000의 매출이 발생했다면 D7 RPI는 $0.20이다. CPI가 $0.50이라면, D7 기준으로는 아직 손익분기에 도달하지 못했으나 D30까지 추가 매출이 예상되므로 지속 운영이 가능하다.',
    relatedTerms: ['CPI', 'LTV', 'ROAS', 'Install'],
    tags: ['매출', 'UA', '설치', '효율'],
  },
  {
    id: 'km-rev-007',
    term: 'Revenue',
    termKo: '매출',
    category: 'revenue_metrics',
    definition:
      '게임에서 발생하는 총 수익으로, IAP(인앱 결제), 구독, 광고 수익 등을 모두 포함한다. Gross Revenue(총 매출)에서 스토어 수수료(Apple 30%, Google 30% 또는 15%)를 제외한 것이 Net Revenue(순매출)이며, 실제 사업 수익성은 Net Revenue 기준으로 판단한다.',
    formula: 'Net Revenue = Gross Revenue x (1 - 스토어 수수료율)',
    benchmark: null,
    example:
      '월 Gross Revenue 10억 원인 게임의 Net Revenue는 Apple 기준 7억 원(30% 수수료), 소규모 개발사 프로그램 적용 시 8.5억 원(15% 수수료)이다. 구독 모델의 경우 2년 차부터 수수료가 15%로 줄어든다.',
    relatedTerms: ['IAP', 'ARPU', 'Net Revenue', 'Gross Revenue'],
    tags: ['매출', '수익', '기본지표'],
  },

  // ─────────────────────────────────────────────
  // 2. User Segmentation (유저 세분화)
  // ─────────────────────────────────────────────
  {
    id: 'km-seg-001',
    term: 'NPU (Non-Paying User)',
    termKo: '무과금 유저',
    category: 'user_segmentation',
    definition:
      'Non-Paying User의 약자로, 게임을 플레이하지만 한 번도 결제를 하지 않은 유저이다. 전체 유저의 90~97%를 차지하며, 이들의 플레이가 과금 유저의 게임 경험(매칭, 소셜 기능, 랭킹 등)에 기여하므로 무과금 유저도 게임 생태계의 핵심 구성원이다. NPU를 과금 유저로 전환하는 것이 수익화의 첫 번째 과제이다.',
    formula: null,
    benchmark: {
      low: 90,
      median: 95,
      high: 97,
      topDecile: 98,
      unit: '%',
      source: 'DeltaDNA 2024 Player Insights',
    },
    example:
      'MAU 100만 명, 과금 전환율 3%인 게임에서 NPU는 97만 명이다. $0.99 스타터 팩을 도입하여 NPU 중 2%를 추가 전환시키면 PU가 3만 명에서 약 5만 명으로 증가하여 매출이 67% 이상 상승할 수 있다.',
    relatedTerms: ['PU', 'Conversion Rate', 'Starter Pack', 'First-Time Buyer'],
    tags: ['세분화', '무과금', '전환', '유저'],
  },
  {
    id: 'km-seg-002',
    term: 'PU (Paying User)',
    termKo: '과금 유저',
    category: 'user_segmentation',
    definition:
      'Paying User의 약자로, 1회 이상 결제를 한 유저이다. 과금 유저는 지출 수준에 따라 Minnow, Dolphin, Whale, Super Whale로 세분화된다. PU 비율(과금 전환율)은 장르별로 크게 다르며, PU의 리텐션은 NPU보다 평균 2~3배 높다.',
    formula: null,
    benchmark: {
      low: 2,
      median: 4,
      high: 8,
      topDecile: 15,
      unit: '%',
      source: 'AppsFlyer 2024 Gaming Benchmark',
    },
    example:
      'RPG 게임에서 전체 유저의 5%가 PU이고, 이 중 60%가 Minnow, 25%가 Dolphin, 12%가 Whale, 3%가 Super Whale이다. PU의 D30 리텐션은 45%로 NPU(12%)의 약 3.75배에 달한다.',
    relatedTerms: ['NPU', 'ARPPU', 'Whale', 'Minnow'],
    tags: ['세분화', '과금유저', 'KPI'],
  },
  {
    id: 'km-seg-003',
    term: 'Minnow',
    termKo: '소과금 유저 (미노우)',
    category: 'user_segmentation',
    definition:
      '과금 유저 중 소액을 지출하는 유저 세그먼트이다. 일반적으로 월 지출이 $1~$10 범위이며, 전체 PU의 50~70%를 차지한다. 스타터 팩, 일일 보석 패스 등 저가 상품의 주요 타겟이며, 이들을 Dolphin으로 육성하는 것이 매출 성장의 핵심 전략이다.',
    formula: null,
    benchmark: {
      low: 1,
      median: 5,
      high: 10,
      topDecile: 10,
      unit: 'USD/월',
      source: 'Newzoo 2024 Mobile Games Report',
    },
    example:
      '퍼즐 게임에서 Minnow 유저가 매월 $4.99의 일일 보석 패스만 구매한다. 전체 PU 1만 명 중 Minnow가 6,000명이라면 Minnow 세그먼트 매출은 월 약 $30,000이다.',
    relatedTerms: ['Dolphin', 'NPU', 'Starter Pack', 'Daily Gem Pass'],
    tags: ['세분화', '소과금', '유저군'],
  },
  {
    id: 'km-seg-004',
    term: 'Dolphin',
    termKo: '중과금 유저 (돌핀)',
    category: 'user_segmentation',
    definition:
      '과금 유저 중 중간 수준의 지출을 하는 유저 세그먼트이다. 일반적으로 월 $10~$100 범위를 지출하며, 전체 PU의 20~35%를 차지한다. 배틀패스, VIP 구독, 프리미엄 번들 등의 주요 타겟이다. 매출 구성에서 가장 안정적인 기반을 제공하는 세그먼트이다.',
    formula: null,
    benchmark: {
      low: 10,
      median: 30,
      high: 100,
      topDecile: 100,
      unit: 'USD/월',
      source: 'Newzoo 2024 Mobile Games Report',
    },
    example:
      'RPG 게임에서 Dolphin 유저 2,500명이 평균 월 $35를 지출한다면 Dolphin 세그먼트 매출은 월 $87,500이다. 배틀패스($9.99)와 월정액 VIP($14.99)를 함께 구매하는 패턴이 가장 흔하다.',
    relatedTerms: ['Minnow', 'Whale', 'Battle Pass', 'VIP'],
    tags: ['세분화', '중과금', '유저군'],
  },
  {
    id: 'km-seg-005',
    term: 'Whale',
    termKo: '고과금 유저 (고래)',
    category: 'user_segmentation',
    definition:
      '과금 유저 중 대규모 지출을 하는 유저 세그먼트이다. 일반적으로 월 $100~$1,000 범위를 지출하며, 전체 PU의 5~15%를 차지하지만 전체 매출의 40~60%를 생성한다. 프리미엄 재화 팩, 한정 상품, VIP 전용 상품이 주요 타겟이다.',
    formula: null,
    benchmark: {
      low: 100,
      median: 300,
      high: 1000,
      topDecile: 1000,
      unit: 'USD/월',
      source: 'Swrve 2024 Monetization Report',
    },
    example:
      'MMORPG에서 Whale 유저 800명이 평균 월 $400를 지출하면 Whale 세그먼트 매출은 월 $320,000이다. 이는 전체 매출 $600,000의 약 53%에 해당한다. 강화 시스템, 가챠 등 깊은 소비 루프가 핵심 구동력이다.',
    relatedTerms: ['Super Whale', 'Dolphin', 'VIP', 'Gacha'],
    tags: ['세분화', '고과금', '유저군', 'VIP'],
  },
  {
    id: 'km-seg-006',
    term: 'Super Whale',
    termKo: '초고과금 유저 (슈퍼 고래)',
    category: 'user_segmentation',
    definition:
      '과금 유저 중 극단적으로 높은 지출을 하는 최상위 세그먼트이다. 월 $1,000 이상을 지출하며, 전체 PU의 1~3%에 불과하지만 전체 매출의 15~30%를 차지할 수 있다. 전용 VIP 서비스, 1:1 CS, 한정 컨텐츠 등 특별한 대우가 필요하며, 이탈 시 매출에 큰 타격을 준다.',
    formula: null,
    benchmark: {
      low: 1000,
      median: 3000,
      high: 10000,
      topDecile: 10000,
      unit: 'USD/월',
      source: 'Swrve 2024 Monetization Report',
    },
    example:
      'SLG 게임에서 Super Whale 100명이 평균 월 $5,000를 지출하면 월 $500,000의 매출이 발생한다. 이 중 1명이 이탈하면 월 매출의 약 1%가 즉시 감소하므로, 전담 VIP 매니저를 배치하여 리텐션을 관리하는 것이 일반적이다.',
    relatedTerms: ['Whale', 'VIP System', 'LTV', 'Churn Rate'],
    tags: ['세분화', '초고과금', 'VIP', '리스크관리'],
  },
  {
    id: 'km-seg-007',
    term: 'Lapsed Payer',
    termKo: '이탈 과금 유저',
    category: 'user_segmentation',
    definition:
      '과거에 결제 이력이 있지만 최근 일정 기간(보통 30~60일) 동안 결제를 하지 않은 유저이다. 완전 이탈(Churned)과 달리 게임에 접속은 하고 있어 재과금 가능성이 있다. 타겟 프로모션, 컴백 보상, 특별 할인 등으로 재전환을 유도하는 전략이 필요하다.',
    formula: null,
    benchmark: null,
    example:
      'RPG 게임에서 PU 중 30%가 최근 30일간 결제하지 않은 Lapsed Payer이다. 이들에게 50% 할인 "컴백 번들"을 타겟 푸시하여 15%를 재전환시키면, PU 규모를 4.5% 포인트 회복시킬 수 있다.',
    relatedTerms: ['Churn Rate', 'PU', 'Re-engagement', 'Winback'],
    tags: ['세분화', '이탈', '재전환', 'CRM'],
  },
  {
    id: 'km-seg-008',
    term: 'First-Time Buyer',
    termKo: '첫 구매 유저',
    category: 'user_segmentation',
    definition:
      '게임에서 처음으로 결제를 완료한 유저이다. NPU에서 PU로 전환되는 순간은 유저 라이프사이클에서 가장 중요한 전환점이며, 첫 구매 경험이 이후 과금 패턴을 크게 좌우한다. 첫 구매 후 48시간 이내에 두 번째 구매를 유도하는 것이 반복 과금률을 높이는 핵심 전략이다.',
    formula: null,
    benchmark: null,
    example:
      '퍼즐 게임에서 $0.99 스타터 팩을 구매한 첫 구매 유저에게 24시간 이내에 $2.99 "성장 번들"을 한정 시간 오퍼로 제안한다. 첫 구매 유저의 25%가 두 번째 구매를 완료하면, 장기 과금 유저가 될 확률이 4배 증가한다.',
    relatedTerms: ['NPU', 'Starter Pack', 'Conversion Rate', 'Second Purchase'],
    tags: ['세분화', '첫구매', '전환', '퍼널'],
  },
  {
    id: 'km-seg-009',
    term: 'VIP',
    termKo: 'VIP 유저',
    category: 'user_segmentation',
    definition:
      '누적 과금액 또는 VIP 포인트 기준으로 등급이 부여된 최상위 과금 유저이다. VIP 시스템은 과금 유저에게 배타적 혜택(경험치 부스트, 전용 컨텐츠, 우선 CS 등)을 제공하여 과금 지속성과 충성도를 높이는 수익화 프레임워크이다. 중국 시장에서 특히 발달한 시스템이다.',
    formula: null,
    benchmark: null,
    example:
      'MMORPG에서 VIP 1~15 등급을 운영하며, VIP 8 이상은 전용 던전과 1:1 CS를 제공한다. VIP 유저의 D90 리텐션은 일반 PU 대비 2.5배 높으며, 월 ARPPU는 3배에 달한다.',
    relatedTerms: ['Whale', 'Super Whale', 'VIP System (CN)', 'Loyalty'],
    tags: ['세분화', 'VIP', '충성도', '등급'],
  },

  // ─────────────────────────────────────────────
  // 3. Retention (리텐션)
  // ─────────────────────────────────────────────
  {
    id: 'km-ret-001',
    term: 'D1 Retention',
    termKo: 'D1 리텐션 (1일차 잔존율)',
    category: 'retention',
    definition:
      '설치 후 다음 날(1일차)에 게임에 복귀하는 유저의 비율이다. 게임의 첫인상과 튜토리얼 품질을 직접적으로 반영하며, 장기 리텐션과 LTV를 예측하는 가장 중요한 초기 지표이다. D1 리텐션이 장르 평균 미만이면 온보딩 개선이 최우선 과제이다.',
    formula: 'D1 Retention = 설치 다음날 접속 유저 수 / 설치일 신규 유저 수 x 100%',
    benchmark: {
      low: 25,
      median: 35,
      high: 45,
      topDecile: 55,
      unit: '%',
      source: 'GameAnalytics 2024 Mobile Benchmark',
    },
    example:
      '하이퍼캐주얼 게임에서 신규 유저 10,000명 중 3,200명이 다음 날 복귀했다면 D1 리텐션은 32%이다. 튜토리얼을 3단계에서 5단계로 확장하고 첫 클리어 보상을 강화한 후 D1이 38%로 개선되었다.',
    relatedTerms: ['D7 Retention', 'D30 Retention', 'Tutorial', 'Onboarding'],
    tags: ['리텐션', 'D1', '초기지표', '온보딩'],
  },
  {
    id: 'km-ret-002',
    term: 'D7 Retention',
    termKo: 'D7 리텐션 (7일차 잔존율)',
    category: 'retention',
    definition:
      '설치 후 7일차에 게임에 복귀하는 유저의 비율이다. 게임의 코어 루프(Core Loop)와 초기 진행 시스템의 매력도를 반영한다. D7 리텐션이 높다는 것은 유저가 게임의 핵심 재미를 발견하고 습관적으로 플레이하기 시작했다는 신호이다.',
    formula: 'D7 Retention = 설치 후 7일차 접속 유저 수 / 설치일 신규 유저 수 x 100%',
    benchmark: {
      low: 8,
      median: 15,
      high: 22,
      topDecile: 30,
      unit: '%',
      source: 'GameAnalytics 2024 Mobile Benchmark',
    },
    example:
      'RPG 게임에서 D7 리텐션이 18%이다. 7일 출석 보상 시스템과 길드 가입 유도를 강화한 후 D7이 23%로 상승했다. 이는 장기 LTV 기대치가 약 28% 증가한 것과 같다.',
    relatedTerms: ['D1 Retention', 'D30 Retention', 'Core Loop', 'Session Frequency'],
    tags: ['리텐션', 'D7', '코어루프', '중기지표'],
  },
  {
    id: 'km-ret-003',
    term: 'D30 Retention',
    termKo: 'D30 리텐션 (30일차 잔존율)',
    category: 'retention',
    definition:
      '설치 후 30일차에 게임에 복귀하는 유저의 비율이다. 게임의 메타 시스템(길드, PvP, 이벤트 등)과 장기 진행 목표의 견인력을 반영한다. D30 리텐션이 높은 게임은 안정적인 DAU 기반 위에서 꾸준한 수익화가 가능하다.',
    formula: 'D30 Retention = 설치 후 30일차 접속 유저 수 / 설치일 신규 유저 수 x 100%',
    benchmark: {
      low: 3,
      median: 6,
      high: 12,
      topDecile: 18,
      unit: '%',
      source: 'GameAnalytics 2024 Mobile Benchmark',
    },
    example:
      'SLG 게임에서 D30 리텐션이 10%이다. 동맹 전쟁 컨텐츠와 시즌 시스템을 추가한 후 D30이 14%로 개선되었다. 이 수준이면 상위 25% 게임에 해당하며, 안정적인 라이브 운영이 가능하다.',
    relatedTerms: ['D7 Retention', 'Stickiness', 'Churn Rate', 'Meta System'],
    tags: ['리텐션', 'D30', '장기지표', '메타시스템'],
  },
  {
    id: 'km-ret-004',
    term: 'Churn Rate',
    termKo: '이탈률',
    category: 'retention',
    definition:
      '특정 기간 동안 게임을 떠난 유저의 비율이다. 리텐션의 역수 개념으로, 1 - Retention Rate로 계산할 수 있다. 일별, 주별, 월별로 측정하며, 이탈 원인(콘텐츠 부족, 밸런스 문제, 과금 압박 등)을 분석하여 개선하는 것이 리텐션 전략의 핵심이다.',
    formula: 'Churn Rate = 이탈 유저 수 / 기간 시작 유저 수 x 100% (= 1 - Retention Rate)',
    benchmark: {
      low: 55,
      median: 65,
      high: 75,
      topDecile: 45,
      unit: '% (D1)',
      source: 'Adjust 2024 Global App Trends',
    },
    example:
      'D1 리텐션 35%인 게임의 D1 이탈률은 65%이다. 이탈 유저 설문 결과 "튜토리얼이 너무 길다"(40%), "게임이 재미없다"(30%), "로딩이 느리다"(20%) 순으로 나타났다. 튜토리얼 간소화로 D1 이탈률을 60%로 줄였다.',
    relatedTerms: ['D1 Retention', 'Lapsed Payer', 'Re-engagement', 'DAU'],
    tags: ['리텐션', '이탈', 'KPI', '분석'],
  },
  {
    id: 'km-ret-005',
    term: 'Stickiness (DAU/MAU)',
    termKo: '고착도 (DAU/MAU 비율)',
    category: 'retention',
    definition:
      'DAU를 MAU로 나눈 비율로, 유저가 얼마나 자주 게임에 접속하는지를 나타내는 지표이다. 100%에 가까울수록 매일 접속하는 충성 유저 비율이 높다는 의미이다. 리텐션과 함께 게임의 "습관 형성" 수준을 측정하는 핵심 지표이다.',
    formula: 'Stickiness = DAU / MAU x 100%',
    benchmark: {
      low: 10,
      median: 18,
      high: 30,
      topDecile: 45,
      unit: '%',
      source: 'Flurry 2024 State of Mobile',
    },
    example:
      'DAU 5만, MAU 25만인 게임의 Stickiness는 20%이다. 이는 MAU 유저가 한 달에 평균 6일 접속한다는 의미이다. 일일 퀘스트와 출석 보상을 강화한 후 Stickiness가 25%로 상승했다.',
    relatedTerms: ['DAU', 'MAU', 'Session Frequency', 'Engagement'],
    tags: ['리텐션', '고착도', '접속빈도', '습관'],
  },
  {
    id: 'km-ret-006',
    term: 'Session Length',
    termKo: '세션 길이',
    category: 'retention',
    definition:
      '유저가 한 번 게임에 접속했을 때 플레이하는 평균 시간이다. 세션 길이가 길수록 게임에 대한 몰입도가 높다는 의미이며, 광고 수익이나 인앱 결제 기회도 비례하여 증가한다. 단, 과도하게 긴 세션은 번아웃과 이탈로 이어질 수 있으므로 적절한 밸런스가 필요하다.',
    formula: null,
    benchmark: {
      low: 3,
      median: 8,
      high: 20,
      topDecile: 35,
      unit: '분',
      source: 'GameAnalytics 2024 Mobile Benchmark',
    },
    example:
      '하이퍼캐주얼 게임의 평균 세션 길이가 4분이고 RPG는 15분이다. RPG에서 자동 전투 기능을 추가한 후 세션 길이가 15분에서 22분으로 증가했지만, 능동적 플레이 비율은 감소했다.',
    relatedTerms: ['Session Frequency', 'Stickiness', 'Engagement', 'Energy System'],
    tags: ['리텐션', '세션', '몰입도', '시간'],
  },
  {
    id: 'km-ret-007',
    term: 'Session Frequency',
    termKo: '세션 빈도 (일일 접속 횟수)',
    category: 'retention',
    definition:
      '유저가 하루에 게임에 접속하는 평균 횟수이다. 세션 빈도가 높을수록 게임이 일상에 깊이 통합되어 있다는 의미이며, 각 세션이 수익화 기회가 된다. 에너지 시스템, 푸시 알림, 시간 제한 이벤트 등이 세션 빈도를 높이는 주요 메커니즘이다.',
    formula: null,
    benchmark: {
      low: 1.5,
      median: 3,
      high: 5,
      topDecile: 8,
      unit: '회/일',
      source: 'GameAnalytics 2024 Mobile Benchmark',
    },
    example:
      '에너지 시스템이 있는 퍼즐 게임에서 세션 빈도가 평균 4.2회/일이다. 에너지 충전 시간을 6시간에서 4시간으로 줄이고 충전 완료 푸시를 추가한 후 세션 빈도가 5.1회/일로 상승했다.',
    relatedTerms: ['Session Length', 'Energy System', 'Push Notification', 'DAU'],
    tags: ['리텐션', '세션', '접속빈도', '습관'],
  },

  // ─────────────────────────────────────────────
  // 4. Monetization Models (수익화 모델)
  // ─────────────────────────────────────────────
  {
    id: 'km-mon-001',
    term: 'IAP (In-App Purchase)',
    termKo: '인앱 결제',
    category: 'monetization_models',
    definition:
      'In-App Purchase의 약자로, 앱 내에서 직접 결제하여 가상 아이템이나 서비스를 구매하는 수익화 모델이다. 모바일 게임 매출의 핵심 원천으로, 재화 팩, 아이템, 구독, 배틀패스 등 다양한 형태로 구현된다. Apple App Store와 Google Play Store에서 각각 30%(또는 15%)의 수수료를 부과한다.',
    formula: null,
    benchmark: {
      low: 60,
      median: 75,
      high: 90,
      topDecile: 95,
      unit: '% (매출 비중)',
      source: 'Sensor Tower 2024 Market Report',
    },
    example:
      'RPG 게임에서 IAP가 전체 매출의 85%를 차지한다. 재화 팩(40%), 가챠(25%), 배틀패스(12%), 기타 번들(8%)로 구성되며, 나머지 15%는 광고 수익이다.',
    relatedTerms: ['Revenue', 'Hard Currency', 'Gacha', 'Subscription'],
    tags: ['수익화', 'IAP', '결제', '기본'],
  },
  {
    id: 'km-mon-002',
    term: 'Battle Pass',
    termKo: '배틀패스',
    category: 'monetization_models',
    definition:
      '시즌 기반의 진행형 보상 시스템으로, 무료 트랙과 유료(프리미엄) 트랙으로 구성된다. 유저는 플레이를 통해 경험치를 쌓아 단계별 보상을 해금하며, 유료 트랙은 추가적인 프리미엄 보상을 제공한다. 중과금 유저(Dolphin)의 과금 동기를 자극하는 가장 효과적인 수익화 모델 중 하나이다.',
    formula: null,
    benchmark: {
      low: 5,
      median: 10,
      high: 15,
      topDecile: 20,
      unit: 'USD/시즌',
      source: 'Newzoo 2024 Battle Pass Report',
    },
    example:
      '배틀패스를 $9.99에 판매하고, 시즌(30일) 동안 50단계 보상을 제공한다. 무료 트랙에는 일반 재화를, 유료 트랙에는 한정 코스메틱과 프리미엄 재화를 배치한다. PU의 40%가 배틀패스를 구매하면 전체 매출의 12~18%를 안정적으로 확보할 수 있다.',
    relatedTerms: ['Subscription', 'Season', 'Dolphin', 'FOMO'],
    tags: ['수익화', '배틀패스', '시즌', '진행형'],
  },
  {
    id: 'km-mon-003',
    term: 'Gacha',
    termKo: '가챠 (뽑기)',
    category: 'monetization_models',
    definition:
      '프리미엄 재화를 소비하여 확률적으로 아이템을 획득하는 수익화 시스템이다. 일본에서 유래했으며, 희귀 아이템에 대한 수집 욕구와 도박적 흥분을 활용한다. 규제가 강화되는 추세이며, 확률 공개 의무화(한국, 일본, 중국), 미성년자 보호 등을 고려해야 한다.',
    formula: null,
    benchmark: {
      low: 20,
      median: 35,
      high: 55,
      topDecile: 70,
      unit: '% (매출 비중, RPG 기준)',
      source: 'data.ai 2024 Japan Gaming Report',
    },
    example:
      '가챠에서 SSR 확률이 3%이고, 10연차에 SR 이상 1개를 보장한다. Whale 유저는 목표 캐릭터를 얻기 위해 평균 $200~$500를 지출한다. 천장(Pity) 시스템을 도입하면 평균 지출은 줄지만 과금 참여율이 증가하여 전체 매출은 오히려 상승하는 경우가 많다.',
    relatedTerms: ['Pity System', 'Hard Currency', 'Whale', 'JP Market'],
    tags: ['수익화', '가챠', '확률', '일본'],
  },
  {
    id: 'km-mon-004',
    term: 'Pity System',
    termKo: '천장 시스템 (피티 시스템)',
    category: 'monetization_models',
    definition:
      '가챠에서 일정 횟수를 뽑았을 때 반드시 최고 등급 아이템을 보장하는 안전장치 시스템이다. 유저의 과금 불안감을 줄이고 최대 지출 상한을 예측 가능하게 만들어, 역설적으로 더 많은 유저가 가챠에 참여하게 만드는 효과가 있다. 한국과 중국에서는 규제 요건으로도 권장된다.',
    formula: null,
    benchmark: null,
    example:
      '가챠의 SSR 기본 확률이 1.6%이고, 74회차부터 확률이 급격히 증가하여 90회에서 확정된다. 이 "소프트 피티"와 "하드 피티" 이중 구조를 통해 평균 62회에서 SSR을 획득하게 된다. 1회 비용이 $2이면 최대 $180으로 확정 획득이 가능하여 과금 심리적 허들이 낮아진다.',
    relatedTerms: ['Gacha', 'Hard Currency', 'Whale', 'Regulation'],
    tags: ['수익화', '천장', '가챠', '안전장치'],
  },
  {
    id: 'km-mon-005',
    term: 'Subscription',
    termKo: '구독 모델',
    category: 'monetization_models',
    definition:
      '정기적으로 요금을 지불하고 지속적인 혜택을 받는 수익화 모델이다. 일일 재화 지급, VIP 혜택, 광고 제거 등 다양한 형태가 있다. 예측 가능한 반복 매출(Recurring Revenue)을 제공하며, 구독 유저의 리텐션은 비구독 유저보다 2~4배 높다.',
    formula: null,
    benchmark: {
      low: 3,
      median: 7,
      high: 15,
      topDecile: 30,
      unit: 'USD/월',
      source: 'RevenueCat 2024 State of Subscriptions',
    },
    example:
      '월 $4.99 "일일 보석 패스"는 30일간 매일 100 보석을 지급한다. 총 3,000 보석의 가치가 일반 구매 시 $14.99에 해당하여 3배 이상의 가치를 제공한다. 이 구독 상품은 Minnow 유저의 핵심 과금 상품이 된다.',
    relatedTerms: ['Daily Gem Pass', 'VIP', 'Recurring Revenue', 'Minnow'],
    tags: ['수익화', '구독', '반복매출', '안정'],
  },
  {
    id: 'km-mon-006',
    term: 'Rewarded Ad',
    termKo: '보상형 광고',
    category: 'monetization_models',
    definition:
      '유저가 자발적으로 광고를 시청하고 게임 내 보상(재화, 추가 라이프, 부활 등)을 받는 광고 수익화 모델이다. 유저 경험을 크게 해치지 않으면서 무과금 유저로부터도 수익을 창출할 수 있어, 하이퍼캐주얼과 캐주얼 장르에서 핵심 수익원이다.',
    formula: null,
    benchmark: {
      low: 0.01,
      median: 0.03,
      high: 0.06,
      topDecile: 0.1,
      unit: 'USD eCPM/노출',
      source: 'ironSource 2024 Ad Revenue Report',
    },
    example:
      '캐주얼 퍼즐 게임에서 스테이지 실패 시 30초 광고를 보면 추가 기회를 제공한다. DAU 10만 명 중 60%가 하루 평균 3회 시청하면, eCPM $30 기준 일일 광고 매출은 $540이다.',
    relatedTerms: ['Interstitial Ad', 'eCPM', 'NPU', 'Hybrid Monetization'],
    tags: ['수익화', '광고', '보상형', '캐주얼'],
  },
  {
    id: 'km-mon-007',
    term: 'Interstitial Ad',
    termKo: '전면 광고',
    category: 'monetization_models',
    definition:
      '게임 화면 전체를 차지하는 광고로, 스테이지 전환이나 특정 행동 사이에 자동으로 노출된다. 보상형 광고와 달리 유저의 선택 없이 표시되므로 eCPM은 높지만 유저 경험에 부정적 영향을 줄 수 있다. 노출 빈도(빈도 캡)를 적절히 조절하는 것이 중요하다.',
    formula: null,
    benchmark: {
      low: 0.005,
      median: 0.015,
      high: 0.04,
      topDecile: 0.07,
      unit: 'USD eCPM/노출',
      source: 'AppLovin 2024 MAX Report',
    },
    example:
      '하이퍼캐주얼 게임에서 매 3스테이지마다 전면 광고를 노출한다. DAU 50만 명, 평균 세션당 10스테이지일 때 일일 약 170만 노출이 발생하며, eCPM $20 기준 일일 광고 매출은 약 $340이다.',
    relatedTerms: ['Rewarded Ad', 'eCPM', 'Frequency Cap', 'Ad Mediation'],
    tags: ['수익화', '광고', '전면', '하이퍼캐주얼'],
  },
  {
    id: 'km-mon-008',
    term: 'Energy System',
    termKo: '에너지 시스템 (행동력)',
    category: 'monetization_models',
    definition:
      '유저의 플레이 횟수를 시간 기반으로 제한하는 게임 메커니즘이다. 에너지가 소진되면 시간이 지나 자연 회복되거나, 프리미엄 재화로 즉시 충전할 수 있다. 세션 빈도를 높이고(충전 시 복귀), 과금 동기를 부여하며(즉시 충전), 콘텐츠 소비 속도를 조절하는 3중 역할을 한다.',
    formula: null,
    benchmark: null,
    example:
      '퍼즐 게임에서 에너지 최대 30, 스테이지당 소비 5, 자연 회복 1/8분이다. 에너지 부족 시 $0.99에 에너지 30을 충전할 수 있다. 에너지 시스템이 있는 게임의 세션 빈도는 평균 4~5회/일로, 없는 게임(2~3회/일)보다 높다.',
    relatedTerms: ['Session Frequency', 'Hard Currency', 'Monetization', 'Time Gate'],
    tags: ['수익화', '에너지', '제한', '세션관리'],
  },

  // ─────────────────────────────────────────────
  // 5. Funnel (퍼널)
  // ─────────────────────────────────────────────
  {
    id: 'km-fun-001',
    term: 'Awareness',
    termKo: '인지 단계',
    category: 'funnel',
    definition:
      '유저 획득 퍼널의 최상단으로, 잠재 유저가 게임의 존재를 처음 인지하는 단계이다. UA 광고, 앱스토어 추천, 소셜 미디어, 인플루언서 마케팅 등을 통해 도달한다. 노출수(Impressions), 도달수(Reach), CPM(1,000회 노출당 비용) 등이 핵심 지표이다.',
    formula: null,
    benchmark: null,
    example:
      '신규 RPG 게임 런칭 시 $50,000의 UA 예산으로 Facebook/Google 광고를 집행하여 500만 노출(CPM $10)을 달성했다. 이 중 CTR 2%로 10만 클릭이 발생하고, 클릭 대비 설치율 30%로 3만 설치를 확보했다.',
    relatedTerms: ['Install', 'CPI', 'UA', 'CTR'],
    tags: ['퍼널', '인지', 'UA', '마케팅'],
  },
  {
    id: 'km-fun-002',
    term: 'Install',
    termKo: '설치 단계',
    category: 'funnel',
    definition:
      '유저가 앱스토어에서 게임을 다운로드하여 설치하는 단계이다. 앱스토어 페이지 최적화(ASO), 아이콘, 스크린샷, 앱 설명, 평점 등이 설치 전환율에 직접 영향을 미친다. CPI(Cost Per Install)로 유저 획득 비용을 측정한다.',
    formula: 'Install Rate = 설치 수 / 스토어 페이지 방문 수 x 100%',
    benchmark: {
      low: 0.3,
      median: 1.5,
      high: 4.0,
      topDecile: 8.0,
      unit: 'USD (CPI)',
      source: 'Liftoff 2024 Mobile Ad Report',
    },
    example:
      '앱스토어 페이지 방문 5만 건 중 1.5만 건의 설치가 발생하여 설치 전환율 30%를 기록했다. ASO 최적화(아이콘 변경, 스크린샷 리디자인)를 통해 전환율을 35%로 개선하면, 동일 트래픽에서 2,500건의 추가 설치를 얻을 수 있다.',
    relatedTerms: ['Awareness', 'ASO', 'CPI', 'Tutorial'],
    tags: ['퍼널', '설치', 'ASO', '전환'],
  },
  {
    id: 'km-fun-003',
    term: 'Tutorial Completion',
    termKo: '튜토리얼 완료 단계',
    category: 'funnel',
    definition:
      '설치 후 유저가 게임의 초기 튜토리얼을 완료하는 단계이다. 튜토리얼은 게임의 핵심 메커니즘을 학습시키고 첫 성공 경험(First Win)을 제공해야 한다. 튜토리얼 완료율이 낮으면 온보딩 UX를 개선해야 하며, 일반적으로 70~85%를 목표로 한다.',
    formula: 'Tutorial Completion Rate = 튜토리얼 완료 유저 / 첫 세션 시작 유저 x 100%',
    benchmark: {
      low: 50,
      median: 70,
      high: 85,
      topDecile: 92,
      unit: '%',
      source: 'Unity 2024 Gaming Report',
    },
    example:
      '신규 유저 10,000명 중 7,500명이 튜토리얼을 완료하여 완료율 75%를 기록했다. 튜토리얼 길이를 5분에서 3분으로 줄이고, 단계별 보상을 추가한 후 완료율이 83%로 개선되었다.',
    relatedTerms: ['First Session', 'Onboarding', 'D1 Retention', 'Core Loop'],
    tags: ['퍼널', '튜토리얼', '온보딩', '초기경험'],
  },
  {
    id: 'km-fun-004',
    term: 'First Session',
    termKo: '첫 세션 단계',
    category: 'funnel',
    definition:
      '유저가 게임을 설치 후 처음으로 플레이하는 세션이다. 첫 세션에서의 경험이 D1 리텐션을 크게 좌우하며, 첫 5분이 가장 중요하다. 빠른 재미 전달, 적절한 난이도, 보상감, 그리고 다음 세션에 대한 기대감 조성이 핵심이다.',
    formula: null,
    benchmark: {
      low: 3,
      median: 7,
      high: 15,
      topDecile: 25,
      unit: '분 (세션 길이)',
      source: 'Unity 2024 Gaming Report',
    },
    example:
      '캐주얼 게임에서 첫 세션 평균 길이가 5분이고, 이 중 80%가 튜토리얼 시간이다. 첫 세션에서 3스테이지 이상 클리어한 유저의 D1 리텐션이 45%로, 2스테이지 이하(25%)보다 크게 높았다.',
    relatedTerms: ['Tutorial', 'D1 Retention', 'Onboarding', 'First Win'],
    tags: ['퍼널', '첫세션', '초기경험', '온보딩'],
  },
  {
    id: 'km-fun-005',
    term: 'Retention Stage',
    termKo: '리텐션 정착 단계',
    category: 'funnel',
    definition:
      '유저가 게임을 반복 방문하며 습관적 플레이를 시작하는 단계이다. 보통 D3~D7 사이에 형성되며, 코어 루프에 대한 이해와 사회적 연결(길드, 친구 등)이 정착의 핵심 동력이다. 이 단계를 통과한 유저는 장기 리텐션이 크게 높아진다.',
    formula: null,
    benchmark: null,
    example:
      'RPG 게임에서 D3에 길드 가입을 유도하면 D7 리텐션이 28%로, 미가입 유저(15%)보다 거의 2배 높다. 리텐션 정착 단계에서의 소셜 기능 참여가 장기 리텐션의 강력한 예측 변수이다.',
    relatedTerms: ['D7 Retention', 'Core Loop', 'Social Features', 'Habit Formation'],
    tags: ['퍼널', '리텐션', '정착', '습관'],
  },
  {
    id: 'km-fun-006',
    term: 'First Purchase',
    termKo: '첫 구매 단계',
    category: 'funnel',
    definition:
      '유저가 처음으로 인앱 결제를 완료하는 퍼널 단계이다. NPU에서 PU로 전환되는 이 순간은 유저 라이프사이클에서 가장 높은 가치를 가진 전환 이벤트이다. 스타터 팩, 한정 시간 오퍼, 가치 극대화 번들 등이 첫 구매를 유도하는 주요 전략이다.',
    formula: null,
    benchmark: {
      low: 1,
      median: 3,
      high: 7,
      topDecile: 12,
      unit: '% (전환율)',
      source: 'AppsFlyer 2024 Gaming Report',
    },
    example:
      '설치 후 D3에 "성장 지원 패키지"($0.99, 가치 10배)를 팝업으로 제안한다. 이 시점은 유저가 게임에 익숙해지면서 진행 속도가 느려지기 시작하는 때로, 구매 동기가 자연스럽게 형성된다. 해당 오퍼의 전환율은 5%이다.',
    relatedTerms: ['First-Time Buyer', 'Starter Pack', 'NPU', 'Conversion Rate'],
    tags: ['퍼널', '첫구매', '전환', '수익화'],
  },
  {
    id: 'km-fun-007',
    term: 'Repeat Purchase',
    termKo: '반복 구매 단계',
    category: 'funnel',
    definition:
      '유저가 두 번째 이상의 결제를 하는 퍼널 단계이다. 첫 구매 후 48시간 이내에 두 번째 구매를 완료하면 장기 과금 유저가 될 확률이 크게 높아진다. 일일 재화 패스, 배틀패스, 정기 구독 등이 반복 구매를 유도하는 핵심 상품이다.',
    formula: 'Repeat Purchase Rate = 2회 이상 구매 유저 / 1회 이상 구매 유저 x 100%',
    benchmark: {
      low: 20,
      median: 35,
      high: 50,
      topDecile: 65,
      unit: '%',
      source: 'Liftoff 2024 Mobile Ad Report',
    },
    example:
      '첫 구매 유저 1,000명 중 350명(35%)이 30일 이내에 두 번째 구매를 완료했다. 첫 구매 직후 24시간 한정 "레벨업 번들"($2.99)을 제안한 그룹의 반복 구매율은 48%로, 미제안 그룹(28%)보다 크게 높았다.',
    relatedTerms: ['First Purchase', 'Daily Gem Pass', 'Battle Pass', 'LTV'],
    tags: ['퍼널', '반복구매', '과금유지', '리텐션'],
  },
  {
    id: 'km-fun-008',
    term: 'Whale Stage',
    termKo: '고래 단계 (고과금 전환)',
    category: 'funnel',
    definition:
      '유저가 중과금(Dolphin)에서 고과금(Whale) 이상으로 전환되는 퍼널의 최종 단계이다. 경쟁 콘텐츠(PvP 랭킹, 길드전), 수집 시스템(도감, 코스메틱), 한정 상품(시즌 한정, VIP 전용) 등이 지출 심화의 핵심 동력이다. 이 단계의 유저 관리가 매출의 핵심을 좌우한다.',
    formula: null,
    benchmark: null,
    example:
      'SLG 게임에서 Dolphin 유저 중 12%가 3개월 내에 Whale로 전환된다. 길드전 시즌에 한정 장비 가챠를 출시하면 Whale 전환율이 18%로 상승한다. Whale 유저의 평균 LTV는 Dolphin의 8~10배에 달한다.',
    relatedTerms: ['Whale', 'Super Whale', 'VIP', 'Gacha', 'Competitive Content'],
    tags: ['퍼널', '고과금', '전환', 'Whale'],
  },

  // ─────────────────────────────────────────────
  // 6. Pricing Strategy (가격 전략)
  // ─────────────────────────────────────────────
  {
    id: 'km-pri-001',
    term: 'Price Anchoring',
    termKo: '가격 앵커링',
    category: 'pricing_strategy',
    definition:
      '유저에게 먼저 높은 가격의 기준점(앵커)을 제시한 후, 상대적으로 저렴해 보이는 실제 판매 가격을 제시하여 구매를 유도하는 가격 심리 전략이다. 캐시샵에서 일반 재화 팩 옆에 할인된 번들을 배치하거나, "원래 가격 대비 OO% 할인" 표시를 활용한다.',
    formula: null,
    benchmark: null,
    example:
      '보석 100개가 $9.99인데, "보석 100개 + 전설 아이템" 번들이 $14.99(원래 $24.99)로 표시된다. 유저는 $24.99를 앵커로 인식하여 $14.99가 합리적이라고 판단하고 번들을 구매할 확률이 높아진다. 이 전략으로 번들 전환율이 일반 재화 팩 대비 2.3배 높았다.',
    relatedTerms: ['Bundle Strategy', 'Dynamic Pricing', 'Value Perception'],
    tags: ['가격', '앵커링', '심리', '전략'],
  },
  {
    id: 'km-pri-002',
    term: 'Bundle Strategy',
    termKo: '번들 전략',
    category: 'pricing_strategy',
    definition:
      '여러 아이템을 묶어서 개별 구매보다 높은 가치를 제공하는 패키지 판매 전략이다. 번들은 "가성비" 인식을 높여 구매 동기를 자극하며, 유저가 단독으로는 구매하지 않았을 아이템도 함께 소비하게 만든다. 가치 배율(Value Multiplier)은 보통 2x~5x를 제공한다.',
    formula: 'Value Multiplier = 번들 내 아이템 개별 가치 합계 / 번들 가격',
    benchmark: null,
    example:
      '"전사 성장 번들"($19.99)에 보석 1,000개($10 가치) + 전설 무기 1개($8 가치) + 경험치 부스트 3일($5 가치) + 골드 50만($4 가치)을 포함한다. 총 개별 가치 $27이 $19.99에 판매되어 1.35x 가치를 제공하지만, 보석의 "특별 할인가"를 적용하면 유저는 3x 이상의 가치로 인식한다.',
    relatedTerms: ['Price Anchoring', 'Value Multiplier', 'Starter Pack', 'Content Gating'],
    tags: ['가격', '번들', '패키지', '전략'],
  },
  {
    id: 'km-pri-003',
    term: 'Dynamic Pricing',
    termKo: '동적 가격 책정',
    category: 'pricing_strategy',
    definition:
      '유저의 행동 데이터(과금 이력, 진행도, 플레이 패턴 등)를 기반으로 개인화된 가격이나 상품을 제시하는 가격 전략이다. A/B 테스트를 통해 세그먼트별 최적 가격대를 발견하고, 실시간으로 적용한다. 윤리적 우려와 규제 이슈에 주의해야 한다.',
    formula: null,
    benchmark: null,
    example:
      'D7에 첫 구매를 하지 않은 유저에게는 $0.99 스타터 팩을 제안하고, D3에 이미 $4.99를 구매한 유저에게는 $9.99 "성장 번들"을 제안한다. 동적 가격 적용 그룹의 ARPU가 대조군 대비 23% 높았다.',
    relatedTerms: ['A/B Testing', 'Personalization', 'Segmentation', 'Price Anchoring'],
    tags: ['가격', '동적', '개인화', '데이터'],
  },
  {
    id: 'km-pri-004',
    term: 'Flash Sale',
    termKo: '한정 시간 세일 (플래시 세일)',
    category: 'pricing_strategy',
    definition:
      '제한된 시간(보통 2~24시간) 동안만 특별 가격이나 특별 상품을 제공하는 판촉 전략이다. FOMO(Fear of Missing Out, 놓칠 수 있다는 두려움)를 활용하여 즉각적인 구매를 유도한다. 타이머 UI와 함께 사용하면 효과가 극대화된다.',
    formula: null,
    benchmark: null,
    example:
      '매주 금요일 저녁 8시에 4시간 한정 "주말 특별 패키지"($4.99, 평소 $9.99 가치)를 판매한다. 타이머 카운트다운과 푸시 알림을 함께 사용하면 일반 상품 대비 전환율이 3.5배 높아진다. 중국 시장의 "깜짝 캐시샵"이 대표적인 플래시 세일 사례이다.',
    relatedTerms: ['FOMO', 'Limited Offer', 'Push Notification', 'Bundle Strategy'],
    tags: ['가격', '한정세일', 'FOMO', '프로모션'],
  },
  {
    id: 'km-pri-005',
    term: 'Content Gating',
    termKo: '콘텐츠 게이팅 (잠금)',
    category: 'pricing_strategy',
    definition:
      '특정 게임 콘텐츠에 접근하기 위해 결제 또는 특정 조건 달성을 요구하는 수익화 전략이다. 프리미엄 캐릭터, 챕터, 게임 모드, 코스메틱 등이 대상이 된다. 무과금 유저에게도 "미리보기"를 제공하여 구매 욕구를 자극하는 것이 효과적이다.',
    formula: null,
    benchmark: null,
    example:
      'RPG 게임에서 스토리 Chapter 5 이후는 "프리미엄 패스"($4.99) 구매 시에만 진행 가능하다. 무과금 유저에게 Chapter 5 오프닝 컷씬만 무료로 공개하여 구매 욕구를 자극한다. 미리보기를 본 유저의 전환율은 8%로, 미공개 시(3%)의 2.7배이다.',
    relatedTerms: ['Premium Content', 'Paywall', 'Free-to-Play', 'Value Perception'],
    tags: ['가격', '콘텐츠잠금', '수익화', '전환'],
  },

  // ─────────────────────────────────────────────
  // 7. Cash Shop (캐시샵)
  // ─────────────────────────────────────────────
  {
    id: 'km-shop-001',
    term: 'Hard Currency',
    termKo: '유료 재화 (하드 커런시)',
    category: 'cash_shop',
    definition:
      '실제 현금으로 구매하는 프리미엄 게임 내 재화이다. 보석, 다이아몬드, 크리스탈 등의 이름으로 불리며, 게임 내 모든 프리미엄 거래의 중간 화폐 역할을 한다. 소량의 무료 획득 경로를 제공하여 유저가 가치를 체험하도록 하되, 핵심 소비처는 유료 구매를 유도하도록 설계한다.',
    formula: null,
    benchmark: null,
    example:
      'RPG 게임의 "보석"이 하드 커런시이다. $0.99에 60보석, $4.99에 330보석(10% 추가), $49.99에 3,600보석(20% 추가)로 단계별 보너스를 제공한다. 일일 미션으로 10보석/일 무료 획득이 가능하지만, 10연 가챠(300보석) 1회에 약 30일이 필요하여 구매를 유도한다.',
    relatedTerms: ['Soft Currency', 'IAP', 'Gacha', 'Currency Pack'],
    tags: ['캐시샵', '하드커런시', '재화', '프리미엄'],
  },
  {
    id: 'km-shop-002',
    term: 'Soft Currency',
    termKo: '무료 재화 (소프트 커런시)',
    category: 'cash_shop',
    definition:
      '게임 플레이를 통해 주로 획득하는 기본 게임 내 재화이다. 골드, 코인, 실버 등의 이름으로 불리며, 기본 장비 구매, 강화, 레벨업 등에 사용된다. 하드 커런시로 소프트 커런시를 구매할 수 있는 환전 시스템을 통해 간접적으로 수익화에 기여한다.',
    formula: null,
    benchmark: null,
    example:
      'RPG 게임의 "골드"가 소프트 커런시이다. 스테이지 클리어 시 500~2,000골드를 획득하고, 장비 강화에 10,000~100,000골드가 필요하다. 후반 콘텐츠로 갈수록 골드 소비가 급증하여 자연 골드 부족(Gold Sink) 상태가 되면, 보석으로 골드를 구매하는 유저가 증가한다.',
    relatedTerms: ['Hard Currency', 'Gold Sink', 'Economy Balance', 'Progression'],
    tags: ['캐시샵', '소프트커런시', '재화', '경제'],
  },
  {
    id: 'km-shop-003',
    term: 'Consumable',
    termKo: '소모성 아이템',
    category: 'cash_shop',
    definition:
      '사용하면 사라지는 일회성 아이템이다. 포션, 부활 토큰, 에너지 충전, 경험치 부스트 등이 대표적이다. 반복 구매를 유도하여 지속적인 매출을 창출하며, 게임 내 재화 소비의 핵심 루프를 형성한다. 소모품 가격과 획득 빈도의 밸런스가 수익화의 핵심이다.',
    formula: null,
    benchmark: null,
    example:
      'MMORPG에서 "부활의 깃털"(보석 30개)은 사망 시 즉시 부활하게 해주는 소모품이다. 레이드 보스전에서 평균 3회 사용되며, 핵심 과금 유저의 주 소비 아이템이다. 주간 레이드 리셋으로 인해 매주 일정량의 소비가 반복된다.',
    relatedTerms: ['Durable', 'Hard Currency', 'Energy System', 'IAP'],
    tags: ['캐시샵', '소모품', '반복구매', '아이템'],
  },
  {
    id: 'km-shop-004',
    term: 'Durable',
    termKo: '영구 아이템',
    category: 'cash_shop',
    definition:
      '한 번 구매하면 영구적으로 소유하는 아이템이다. 캐릭터 스킨, 영구 장비, 영구 VIP 등급, 광고 제거 등이 대표적이다. 일회성 매출이지만 유저 만족도와 충성도를 높이는 효과가 있다. 지속적인 신규 영구 아이템 출시로 매출을 유지해야 한다.',
    formula: null,
    benchmark: null,
    example:
      '격투 게임에서 "전설 스킨"($9.99)은 영구 소장 아이템이다. 분기별 2~3개의 신규 전설 스킨을 출시하여 수집 욕구를 자극한다. 코스메틱 전용 영구 아이템은 게임 밸런스에 영향을 주지 않아 유저 반발이 적다.',
    relatedTerms: ['Consumable', 'Cosmetic', 'Collection', 'Skin'],
    tags: ['캐시샵', '영구', '아이템', '수집'],
  },
  {
    id: 'km-shop-005',
    term: 'Cosmetic',
    termKo: '코스메틱 (외형 아이템)',
    category: 'cash_shop',
    definition:
      '게임 플레이 능력에 영향을 주지 않고 시각적 외형만 변경하는 아이템이다. 캐릭터 스킨, 무기 외형, 이펙트, 이모티콘 등이 포함된다. "Play to Win" 논란 없이 수익화할 수 있는 가장 건전한 모델로 평가받으며, 자기 표현 욕구와 사회적 지위 과시 심리를 활용한다.',
    formula: null,
    benchmark: null,
    example:
      '배틀로얄 게임에서 코스메틱이 전체 매출의 90%를 차지한다. "레전더리 스킨"($20)과 "에픽 스킨"($10)의 매출 비중이 70%이며, 시즌별 한정 스킨의 FOMO 효과로 출시 첫 주에 월 매출의 40%가 집중된다.',
    relatedTerms: ['Durable', 'Skin', 'Battle Pass', 'FOMO'],
    tags: ['캐시샵', '코스메틱', '외형', '건전수익화'],
  },
  {
    id: 'km-shop-006',
    term: 'Functional Item',
    termKo: '기능성 아이템',
    category: 'cash_shop',
    definition:
      '게임 플레이 능력이나 진행 속도에 직접적으로 영향을 주는 아이템이다. 장비, 강화 재료, 경험치 부스트, 스킬 책 등이 포함된다. "Pay to Win" 논란의 대상이 될 수 있으므로, 유료 전용이 아닌 시간 단축형으로 설계하는 것이 권장된다.',
    formula: null,
    benchmark: null,
    example:
      'MMORPG에서 "경험치 2배 부스트"(7일, $4.99)는 기능성 아이템이다. 무과금 유저도 1일 부스트를 이벤트로 체험할 수 있고, 유료 구매는 시간 단축의 편의성을 제공한다. PvP에서 직접적인 전투력 차이를 만드는 아이템은 유저 반발이 크므로 주의가 필요하다.',
    relatedTerms: ['Cosmetic', 'Pay to Win', 'Boost', 'Balance'],
    tags: ['캐시샵', '기능성', 'P2W', '밸런스'],
  },
  {
    id: 'km-shop-007',
    term: 'Shop Rotation',
    termKo: '상점 로테이션',
    category: 'cash_shop',
    definition:
      '캐시샵의 상품 라인업을 주기적으로 교체하는 운영 전략이다. 일일/주간/시즌별로 판매 상품을 변경하여 신선함을 유지하고, 한정 판매로 FOMO를 자극한다. 로테이션 상품의 "다시 돌아올지 모른다"는 불확실성이 구매 결정을 촉진한다.',
    formula: null,
    benchmark: null,
    example:
      '캐시샵에서 "오늘의 특가"(일일 로테이션 3종)와 "주간 추천"(주간 로테이션 5종)을 운영한다. 일일 로테이션 상품의 평균 전환율은 고정 상품 대비 2.1배 높으며, "마지막 1시간" 알림 시 전환율이 추가로 40% 상승한다.',
    relatedTerms: ['Flash Sale', 'FOMO', 'Limited Offer', 'Daily Deal'],
    tags: ['캐시샵', '로테이션', '운영', 'FOMO'],
  },

  // ─────────────────────────────────────────────
  // 8. Market Specific (시장별 특성)
  // ─────────────────────────────────────────────
  {
    id: 'km-mkt-001',
    term: 'Korean Market',
    termKo: '한국 시장',
    category: 'market_specific',
    definition:
      '세계 4위 규모의 모바일 게임 시장으로, MMORPG와 RPG 장르가 매출 상위를 차지한다. 강화 시스템(장비 강화, 초월 등)과 PvP 경쟁 콘텐츠가 핵심 수익 동력이며, 확률형 아이템 규제(확률 공개 의무, 환불 정책 등)가 엄격하다. 원스토어, 갤럭시 스토어 등 로컬 앱스토어의 비중도 상당하다.',
    formula: null,
    benchmark: {
      low: 2.5,
      median: 4.0,
      high: 7.0,
      topDecile: 12.0,
      unit: 'USD (CPI)',
      source: 'Adjust 2024 Korea Market Report',
    },
    example:
      '한국 MMORPG에서 강화 시스템이 전체 매출의 35~50%를 차지한다. "+15 강화" 달성을 위해 평균 $300~$500가 소요되며, 강화 실패 시 보호 아이템(강화 보호권)이 추가 과금을 유발한다. 확률형 아이템 확률 공개가 법적으로 의무화되어 있다.',
    relatedTerms: ['Enhancement System (KR)', 'MMORPG', 'PvP', 'Regulation'],
    tags: ['시장', '한국', 'MMORPG', '강화'],
  },
  {
    id: 'km-mkt-002',
    term: 'Chinese Market',
    termKo: '중국 시장',
    category: 'market_specific',
    definition:
      '세계 최대 모바일 게임 시장으로, 정부 규제(판호 제도, 미성년자 플레이 시간 제한, 확률 공개 의무 등)가 매우 엄격하다. VIP 시스템이 극도로 발달해 있으며, "서프라이즈 캐시샵"(한정 시간 깜짝 상점)과 같은 프로모션 전략이 활발하다. WeChat/Alipay 결제가 필수적이며, 안드로이드 서드파티 스토어(Taptap, 화웨이, 샤오미 등)가 Google Play를 대체한다.',
    formula: null,
    benchmark: {
      low: 1.5,
      median: 3.5,
      high: 6.0,
      topDecile: 10.0,
      unit: 'USD (CPI)',
      source: 'Niko Partners 2024 China Gaming Report',
    },
    example:
      '중국 SLG 게임에서 VIP 15등급 시스템을 운영한다. VIP 1($2)부터 VIP 15($10,000+)까지 누적 과금에 따라 등급이 상승하며, 각 등급별 전용 혜택(자동 수집, 추가 행군 큐, 전용 장비 등)이 제공된다. Super Whale 유저의 VIP 등급 경쟁이 핵심 매출 동력이다.',
    relatedTerms: ['VIP System (CN)', 'Flash Sale', 'Regulation', '판호'],
    tags: ['시장', '중국', 'VIP', '규제'],
  },
  {
    id: 'km-mkt-003',
    term: 'Japanese Market',
    termKo: '일본 시장',
    category: 'market_specific',
    definition:
      '세계 3위 규모의 모바일 게임 시장으로, 가챠(Gacha) 시스템이 가장 발달한 시장이다. IP(지적재산권) 기반 게임이 강세이며, 캐릭터 수집과 일러스트 품질이 매출에 큰 영향을 미친다. ARPPU가 세계 최고 수준이며, 유저 충성도와 장기 리텐션이 높다.',
    formula: null,
    benchmark: {
      low: 3.0,
      median: 5.0,
      high: 9.0,
      topDecile: 15.0,
      unit: 'USD (CPI)',
      source: 'data.ai 2024 Japan Market Report',
    },
    example:
      '일본 가챠 RPG에서 한정 캐릭터 배너가 전체 매출의 60%를 차지한다. 인기 IP 콜라보 배너의 경우 통상 배너 대비 매출이 3~5배 증가한다. 피티 시스템(200연차 확정) 도입 후 가챠 참여율이 40% 증가했다.',
    relatedTerms: ['Gacha (JP)', 'IP', 'Character Collection', 'Pity System'],
    tags: ['시장', '일본', '가챠', 'IP'],
  },
  {
    id: 'km-mkt-004',
    term: 'VIP System (CN)',
    termKo: 'VIP 시스템 (중국형)',
    category: 'market_specific',
    definition:
      '중국 모바일 게임에서 특히 발달한 누적 과금 기반 등급 시스템이다. 과금액에 따라 VIP 등급이 상승하며, 등급별로 게임 플레이에 실질적인 편의와 우위를 제공한다. 단순한 보상 지급을 넘어, 게임 시스템 자체에 깊이 통합되어 고과금 동기를 지속적으로 부여하는 것이 특징이다.',
    formula: null,
    benchmark: null,
    example:
      'VIP 0~15 등급 시스템에서 VIP 6 이상은 "자동 전투", VIP 10 이상은 "자동 퀘스트", VIP 13 이상은 "전용 던전"이 해금된다. 각 VIP 등급의 "다음 등급 혜택 미리보기"를 통해 추가 과금을 유도한다. VIP 혜택의 핵심은 "시간 절약"과 "편의성"이다.',
    relatedTerms: ['Chinese Market', 'Whale', 'Super Whale', 'Loyalty'],
    tags: ['시장', '중국', 'VIP', '등급시스템'],
  },
  {
    id: 'km-mkt-005',
    term: 'Enhancement System (KR)',
    termKo: '강화 시스템 (한국형)',
    category: 'market_specific',
    definition:
      '한국 모바일 게임, 특히 MMORPG에서 핵심적인 수익화 메커니즘이다. 장비를 단계별로 강화하여 능력치를 높이는 시스템으로, 높은 단계에서 실패 확률이 급격히 상승하고 실패 시 패널티(파괴, 등급 하락)가 존재한다. 강화 보호권, 축복 아이템, 확률 증가 아이템 등 부가 소모품이 핵심 과금 포인트이다.',
    formula: null,
    benchmark: null,
    example:
      '무기 강화 +10까지는 성공률 100%이지만, +11부터 50%, +12에서 30%, +15에서 5%로 급감한다. +12 이상에서 실패 시 +10으로 하락하며, "강화 보호권"(보석 100개)을 사용하면 하락을 방지한다. 유저의 강화 시도당 평균 비용은 약 $50이며, Whale 유저는 월 수십만 원을 강화에 투자한다.',
    relatedTerms: ['Korean Market', 'MMORPG', 'Consumable', 'Hard Currency'],
    tags: ['시장', '한국', '강화', 'MMORPG'],
  },
  {
    id: 'km-mkt-006',
    term: 'Gacha (JP)',
    termKo: '가챠 (일본형)',
    category: 'market_specific',
    definition:
      '일본 모바일 게임의 핵심 수익화 메커니즘으로, 전 세계 가챠 시스템의 원형이다. 캐릭터/무기/카드를 확률적으로 획득하며, "단차"(1회 뽑기)와 "10연차"(10회 묶음 뽑기, 보너스 포함)가 기본 단위이다. 기간 한정 픽업(Rate Up) 배너, 피티 시스템(천장), 무료 가챠 이벤트 등이 표준 운영 패턴이다.',
    formula: null,
    benchmark: null,
    example:
      '일본 RPG의 가챠에서 SSR 기본 확률 3%, 픽업 SSR 확률 0.7%이며, 300연차에서 확정 획득(천장)이 가능하다. 10연차 비용이 3,000보석(약 $30)이므로 천장까지 $900이 필요하다. 신규 캐릭터 출시 시 평균 ARPPU가 통상의 2.5배로 상승한다.',
    relatedTerms: ['Japanese Market', 'Pity System', 'Rate Up', 'Character Collection'],
    tags: ['시장', '일본', '가챠', '수집'],
  },

  // ─────────────────────────────────────────────
  // 추가 엔트리: 50개 이상 채우기 위한 보충
  // ─────────────────────────────────────────────
  {
    id: 'km-rev-008',
    term: 'CPI',
    termKo: '설치당 비용',
    category: 'revenue_metrics',
    definition:
      'Cost Per Install의 약자로, 한 명의 유저를 설치까지 획득하는 데 소요되는 광고 비용이다. UA(유저 획득) 마케팅 효율의 핵심 지표이며, LTV와 비교하여 투자 수익성을 판단한다. 장르, 지역, 플랫폼에 따라 크게 다르다.',
    formula: 'CPI = 광고 비용 / 설치 수',
    benchmark: {
      low: 0.2,
      median: 1.5,
      high: 5.0,
      topDecile: 10.0,
      unit: 'USD',
      source: 'Liftoff 2024 Mobile Ad Creative Report',
    },
    example:
      '한국 시장에서 RPG 게임의 CPI는 평균 $4.0이며, 일본은 $5.0, 글로벌은 $1.5이다. CPI $4.0이고 D180 LTV가 $12.0이면 LTV/CPI = 3.0으로 수익성이 우수하다.',
    relatedTerms: ['LTV', 'RPI', 'ROAS', 'UA'],
    tags: ['매출', 'UA', '비용', '마케팅'],
  },
  {
    id: 'km-mon-009',
    term: 'Piggy Bank',
    termKo: '돼지 저금통',
    category: 'monetization_models',
    definition:
      '유저가 게임을 플레이할 때마다 가상의 저금통에 재화가 쌓이고, 일정량이 모이면 소액 결제($0.99~$2.99)로 한꺼번에 수령하는 수익화 모델이다. "이미 모은 것을 놓치기 아까운" 손실 회피(Loss Aversion) 심리를 활용하며, 첫 과금 전환에 매우 효과적이다.',
    formula: null,
    benchmark: null,
    example:
      '퍼즐 게임에서 스테이지를 클리어할 때마다 보석이 저금통에 쌓인다. 보석 500개가 모이면 $0.99에 수령 가능하다(일반 구매 시 $4.99 가치). NPU의 첫 구매 유도 상품으로 활용하면 전환율이 일반 스타터 팩 대비 1.8배 높다.',
    relatedTerms: ['Starter Pack', 'NPU', 'Loss Aversion', 'First Purchase'],
    tags: ['수익화', '저금통', '첫구매', '심리'],
  },
  {
    id: 'km-shop-008',
    term: 'Currency Pack',
    termKo: '재화 팩',
    category: 'cash_shop',
    definition:
      '프리미엄 재화(하드 커런시)를 직접 구매하는 가장 기본적인 캐시샵 상품이다. $0.99부터 $99.99까지 다양한 가격대로 구성되며, 고가 팩일수록 보너스 재화를 더 많이 제공하여 대량 구매를 유도한다. 보너스율 단계 설계가 매출에 직접적인 영향을 미친다.',
    formula: null,
    benchmark: null,
    example:
      '보석 팩 구성: $0.99(60개), $4.99(330개, +10%), $9.99(700개, +17%), $24.99(1,850개, +23%), $49.99(3,900개, +30%), $99.99(8,200개, +37%). 고가 팩의 보너스율을 높여 Whale 유저의 대량 구매를 유도한다.',
    relatedTerms: ['Hard Currency', 'Bonus Rate', 'Price Tier', 'IAP'],
    tags: ['캐시샵', '재화팩', '기본상품', '가격대'],
  },
  {
    id: 'km-pri-006',
    term: 'First Purchase Discount',
    termKo: '첫 구매 할인',
    category: 'pricing_strategy',
    definition:
      '유저의 첫 인앱 결제에 대해 특별 할인이나 추가 보너스를 제공하는 가격 전략이다. "첫 구매 2배 보석" 또는 "첫 구매 50% 할인"이 대표적이며, NPU의 과금 심리적 장벽을 낮추는 가장 보편적인 전환 전략이다.',
    formula: null,
    benchmark: null,
    example:
      '모든 재화 팩의 첫 구매에 대해 보석을 2배로 지급한다. $4.99 팩 첫 구매 시 330개 대신 660개를 지급하면, 유저는 "한 번만 이 혜택을 받을 수 있다"는 한정성과 높은 가치에 의해 구매 확률이 크게 상승한다.',
    relatedTerms: ['Starter Pack', 'NPU', 'Conversion Rate', 'Price Anchoring'],
    tags: ['가격', '첫구매', '할인', '전환'],
  },
  {
    id: 'km-ret-008',
    term: 'DAU',
    termKo: '일일 활성 유저',
    category: 'retention',
    definition:
      'Daily Active Users의 약자로, 하루 동안 게임에 접속한 고유 유저 수이다. 게임의 현재 활성도를 나타내는 가장 기본적인 지표이며, ARPDAU 계산의 기준이 된다. DAU의 추세(상승/정체/하락)로 게임의 전반적인 건강도를 판단한다.',
    formula: null,
    benchmark: null,
    example:
      '런칭 후 6개월 된 RPG 게임의 DAU가 10만 명이다. 대형 업데이트 후 DAU가 15만 명으로 급증했다가 2주 후 11만 명으로 안정화되었다면, 업데이트가 1만 명의 순 DAU 증가를 가져온 것으로 평가한다.',
    relatedTerms: ['MAU', 'Stickiness', 'ARPDAU', 'Session'],
    tags: ['리텐션', 'DAU', '활성유저', '기본지표'],
  },
  {
    id: 'km-ret-009',
    term: 'MAU',
    termKo: '월간 활성 유저',
    category: 'retention',
    definition:
      'Monthly Active Users의 약자로, 한 달 동안 게임에 1회 이상 접속한 고유 유저 수이다. DAU와 함께 게임 규모를 나타내는 기본 지표이며, DAU/MAU 비율(Stickiness)로 접속 빈도를 측정한다.',
    formula: null,
    benchmark: null,
    example:
      'MAU 100만 명, DAU 20만 명인 게임의 Stickiness는 20%이다. 이는 MAU 유저가 한 달에 평균 6일 접속한다는 의미이다. 대형 이벤트 기간에 MAU가 120만으로 증가하면 잠재적인 과금 유저 풀이 확대된다.',
    relatedTerms: ['DAU', 'Stickiness', 'ARPU', 'Retention'],
    tags: ['리텐션', 'MAU', '활성유저', '규모'],
  },
  {
    id: 'km-mon-010',
    term: 'Growth Fund',
    termKo: '성장 펀드',
    category: 'monetization_models',
    definition:
      '초기에 일정 금액을 결제하면, 게임 진행(레벨업, 스테이지 클리어 등)에 따라 분할로 보상을 지급하는 수익화 모델이다. 유저의 게임 진행 동기를 강화하고 장기 리텐션을 높이는 효과가 있다. 최종 보상까지의 총 가치가 구매 가격의 5~10배에 달하여 높은 가성비를 제공한다.',
    formula: null,
    benchmark: null,
    example:
      '"레벨 성장 펀드"($9.99): 레벨 10 달성 시 보석 100개, 레벨 20 시 200개, 레벨 30 시 300개, 레벨 40 시 500개, 레벨 50 시 1,000개 지급. 총 보석 2,100개(약 $35 가치)를 $9.99에 구매하여 3.5배 가치를 제공한다.',
    relatedTerms: ['Battle Pass', 'Subscription', 'Dolphin', 'Progression'],
    tags: ['수익화', '성장펀드', '진행형', '리텐션'],
  },
  {
    id: 'km-fun-009',
    term: 'FTUE',
    termKo: '최초 유저 경험',
    category: 'funnel',
    definition:
      'First Time User Experience의 약자로, 유저가 게임을 처음 실행한 후 경험하는 일련의 과정이다. 로딩 화면, 캐릭터 생성, 튜토리얼, 첫 보상까지의 전 과정을 포함하며, FTUE의 품질이 D1 리텐션과 장기 잔존율을 결정짓는 가장 중요한 요소이다.',
    formula: null,
    benchmark: null,
    example:
      'FTUE 최적화 전: 로딩 2분 → 캐릭터 생성 3분 → 튜토리얼 8분 → 첫 보상 = 총 13분. 최적화 후: 로딩 30초 → 기본 캐릭터 → 인터랙티브 튜토리얼 4분 → 첫 보상 = 총 5분. D1 리텐션이 32%에서 41%로 개선되었다.',
    relatedTerms: ['Tutorial', 'First Session', 'D1 Retention', 'Onboarding'],
    tags: ['퍼널', 'FTUE', '온보딩', '초기경험'],
  },
  {
    id: 'km-shop-009',
    term: 'Limited Offer',
    termKo: '한정 오퍼',
    category: 'cash_shop',
    definition:
      '수량 또는 시간이 제한된 특별 판매 상품이다. "오늘만!", "남은 수량 100개", "최초 1회만" 등의 제한 조건이 FOMO와 희소성(Scarcity) 심리를 자극하여 구매를 촉진한다. 일반 상시 상품보다 전환율이 2~4배 높은 것이 일반적이다.',
    formula: null,
    benchmark: null,
    example:
      '"신년 한정 럭키백"($29.99, 48시간 한정)에 보석 3,000개 + 한정 코스메틱 + SSR 선택권을 포함한다. 한정 오퍼의 전환율은 8%로 상시 동급 번들(3%)의 2.7배이다. 구매 가능 횟수를 "1회"로 제한하면 구매율이 추가로 15% 상승한다.',
    relatedTerms: ['Flash Sale', 'FOMO', 'Scarcity', 'Bundle Strategy'],
    tags: ['캐시샵', '한정', 'FOMO', '프로모션'],
  },
  {
    id: 'km-rev-009',
    term: 'ROAS',
    termKo: '광고 지출 대비 수익률',
    category: 'revenue_metrics',
    definition:
      'Return on Ad Spend의 약자로, 광고 비용 대비 발생한 매출의 비율이다. UA 캠페인의 수익성을 직접적으로 측정하는 지표이며, D7 ROAS, D30 ROAS 등 기간별로 추적한다. ROAS 100%가 손익분기이며, 일반적으로 D30 ROAS 150% 이상을 목표로 한다.',
    formula: 'ROAS = (광고를 통해 획득한 유저의 매출 / 광고 비용) x 100%',
    benchmark: {
      low: 30,
      median: 80,
      high: 150,
      topDecile: 300,
      unit: '% (D30)',
      source: 'Singular 2024 ROI Index',
    },
    example:
      'Facebook 광고에 $10,000를 지출하여 획득한 유저의 D30 매출이 $8,000이면 D30 ROAS는 80%이다. 아직 손익분기에 도달하지 못했지만, D90 ROAS 예측이 160%이면 장기적으로 수익성이 있다고 판단한다.',
    relatedTerms: ['CPI', 'LTV', 'RPI', 'UA'],
    tags: ['매출', 'ROAS', '마케팅', '수익성'],
  },
  {
    id: 'km-mon-011',
    term: 'Hybrid Monetization',
    termKo: '하이브리드 수익화',
    category: 'monetization_models',
    definition:
      'IAP(인앱 결제)와 광고 수익을 동시에 활용하는 수익화 모델이다. 무과금 유저로부터는 광고 수익을, 과금 유저로부터는 IAP 수익을 창출한다. 광고 제거 상품을 IAP로 판매하여 두 모델을 연결하기도 한다. 캐주얼/미드코어 장르에서 최적의 수익을 내는 모델로 자리잡고 있다.',
    formula: null,
    benchmark: null,
    example:
      '캐주얼 퍼즐 게임에서 전체 매출의 60%가 IAP, 40%가 광고 수익이다. 무과금 유저에게는 보상형 광고(추가 라이프)와 전면 광고를 노출하고, 과금 유저에게는 $2.99 "광고 제거" 상품을 판매한다. 하이브리드 모델 적용 후 ARPDAU가 IAP 전용 대비 35% 증가했다.',
    relatedTerms: ['IAP', 'Rewarded Ad', 'Interstitial Ad', 'Ad Removal'],
    tags: ['수익화', '하이브리드', '광고', 'IAP'],
  },
  {
    id: 'km-shop-010',
    term: 'Season Pass',
    termKo: '시즌 패스',
    category: 'cash_shop',
    definition:
      '특정 시즌(보통 1~3개월) 동안 유효한 프리미엄 접근권으로, 배틀패스보다 넓은 범위의 시즌 콘텐츠에 대한 접근을 제공한다. 시즌 전용 스토리, 챌린지, 코스메틱, 보상 등이 포함되며, 시즌이 끝나면 더 이상 획득할 수 없는 한정성이 구매 동기를 부여한다.',
    formula: null,
    benchmark: null,
    example:
      '"시즌 3 프리미엄 패스"($14.99)를 구매하면 시즌 전용 스토리 챕터 5개, 한정 레전더리 스킨 2종, 시즌 전용 미션 및 추가 보상을 받을 수 있다. 시즌이 끝나면 이 콘텐츠는 영구히 잠기므로, 시즌 중반에 구매율이 급증하는 패턴을 보인다.',
    relatedTerms: ['Battle Pass', 'FOMO', 'Limited Offer', 'Cosmetic'],
    tags: ['캐시샵', '시즌', '한정', '프리미엄'],
  },
] as const;
