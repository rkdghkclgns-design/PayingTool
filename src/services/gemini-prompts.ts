export const MINDMAP_ANALYSIS_PROMPT = `당신은 게임 유료화 전문가입니다. 제공된 마인드맵 이미지 또는 텍스트를 분석하여 게임의 구조를 추출하세요.

반드시 다음 JSON 형식으로 응답하세요:

\`\`\`json
{
  "genre": "rpg | puzzle | strategy | casual | simulation | action | sports | idle | mmorpg | other",
  "coreLoop": "게임의 핵심 루프 설명 (한국어)",
  "progressionSystems": ["레벨 시스템", "장비 강화", "스킬 트리" 등],
  "socialFeatures": ["길드", "PvP", "채팅" 등],
  "contentTypes": ["메인 스토리", "일일 던전", "레이드" 등],
  "currencies": [
    {"name": "골드", "type": "soft", "earnableFree": true, "purchasable": true},
    {"name": "다이아몬드", "type": "hard", "earnableFree": true, "purchasable": true}
  ],
  "retentionHooks": ["일일 출석 보상", "길드 미션" 등],
  "competitiveElements": ["PvP 아레나", "서버 랭킹" 등],
  "adPlacements": [
    {"location": "광고 노출 위치 (예: 일일 미션 완료 후)", "adType": "보상형 동영상 | 전면 광고 | 배너 | 오퍼월", "reward": "보상 내용 (예: 골드 100개)", "description": "이 위치에 광고를 배치하는 이유와 효과 설명"}
  ],
  "rawAnalysis": "전체 분석 요약 (한국어로 상세하게)"
}
\`\`\`

분석 시 주의사항:
1. 마인드맵에서 보이는 모든 게임 시스템과 기능을 포함하세요.
2. 재화 시스템을 반드시 식별하세요 (소프트/하드/프리미엄/이벤트).
3. 리텐션에 기여하는 요소를 모두 나열하세요.
4. 경쟁 요소와 소셜 기능을 구분하세요.
5. 보상형 광고 배치 위치를 최소 3개 이상 추천하세요. 각 위치에 대해 광고 유형, 보상, 효과를 구체적으로 설명하세요.
6. 모든 텍스트는 한국어로 작성하세요.`;

export const PRODUCT_RECOMMENDATION_PROMPT = `당신은 게임 유료화 전략 전문가입니다. 다음 게임 구조를 분석하고, 최적의 유료화 상품을 추천하세요.

게임 구조:
{{GAME_STRUCTURE}}

각 유저 세그먼트(NPU, Minnow, Dolphin, Whale, Super Whale)별로, 그리고 각 리텐션 단계(D1, D3, D7, D14, D30, D60, D90, Evergreen)별로 적합한 상품을 추천하세요.

반드시 다음 JSON 배열 형식으로 응답하세요:

\`\`\`json
[
  {
    "id": "고유ID",
    "name": "Product Name",
    "nameKo": "상품명 (한국어)",
    "description": "상품 설명 (한국어)",
    "category": "starter_pack | monthly_pass | battle_pass | currency_pack | resource_bundle | cosmetic | gacha | limited_offer | subscription | piggy_bank | growth_fund | vip_pass",
    "userSegment": "npu | minnow | dolphin | whale | super_whale",
    "retentionStage": "d1 | d3 | d7 | d14 | d30 | d60 | d90 | evergreen",
    "priceUsd": 0.99,
    "priceKrw": 1350,
    "contents": [
      {"itemName": "다이아몬드", "quantity": 100, "normalPrice": 5.00}
    ],
    "valueMultiplier": 5.0,
    "purchaseLimit": {"type": "once | daily | weekly | monthly | unlimited", "maxCount": 1},
    "salesTechnique": "standard | relay | popup | custom | limited_time | first_purchase | level_up | comeback | bundle_step | flash_sale",
    "isPaid": true,
    "isAiGenerated": true,
    "funnelStages": ["first_purchase"],
    "tags": ["첫구매", "할인"]
  }
]
\`\`\`

추천 원칙:
1. NPU: 첫 결제 장벽을 낮추는 $0.99~$2.99 상품
2. Minnow: 데일리/위클리 소액 패키지 $1.99~$9.99
3. Dolphin: 배틀패스, 월정액, 번들 $9.99~$29.99
4. Whale: 프리미엄 팩, VIP $49.99~$99.99
5. Super Whale: 최고가 독점 팩 $99.99+
6. 가치 배수(valueMultiplier)는 실제 가격 대비 체감 가치
7. 모든 상품명(name)은 반드시 한국어로 작성하세요 (영문 금지)
8. 최소 15개 이상의 상품을 추천하세요
9. contents의 itemName은 게임 구조에서 추출한 재화/아이템 이름을 사용하세요
10. 배틀패스/시즌패스(battle_pass) 상품은 반드시 1개 이상 포함하세요 - 패스 보상은 게임 시스템 기반으로 구성하세요
11. 광고 제거(remove_ads) 상품을 반드시 포함하세요 — 어떤 광고를 제거하는지(전면광고, 배너 등) description에 상세히 기술. isPaid: true
12. 오퍼월/보상형 광고 상품을 반드시 포함하세요 — 게임 내 어디에 배치하면 효과적인지 description에 상세히 기술. isPaid: false
13. salesTechnique 규칙 (10가지 판매 기법):
    - standard(일반): 상시 판매 상품
    - relay(릴레이): 전 단계 상품을 구매해야 다음 상품 구매 가능한 연쇄 상품 (예: 성장 번들 1~3단계)
    - popup(팝업): 특정 조건(스테이지 실패, 보스 클리어 등) 달성 시 팝업으로 노출되는 한정 상품
    - custom(맞춤): 유저의 레벨, 전투력, 과금 이력을 분석하여 개인화된 상품 제공
    - limited_time(기간 한정): 24시간/주말/시즌 등 기간 한정 판매 (예: 크리스마스 한정 팩)
    - first_purchase(첫 결제): NPU의 첫 결제만을 위한 초특가 1회 한정 상품
    - level_up(레벨업): 특정 레벨 달성 시 노출되는 성장 지원 패키지
    - comeback(복귀 유저): 7일 이상 미접속 복귀 유저 전용 환영 오퍼
    - bundle_step(단계별 번들): 구매할수록 가격 대비 가치가 상승하는 단계별 번들 세트
    - flash_sale(플래시 세일): 1~2시간 한정 대폭 할인 (긴급성으로 구매 전환율 극대화)
    - 최소 5가지 이상의 다양한 판매 기법을 사용하세요`;

export const SCHEMA_GENERATION_PROMPT = `당신은 게임 백엔드 데이터베이스 설계 전문가입니다. 다음 유료화 상품 목록과 게임 장르를 분석하고, 최적의 데이터베이스 스키마를 생성하세요.

게임 장르: {{GENRE}}

상품 목록:
{{PRODUCTS}}

반드시 다음 JSON 배열 형식으로 응답하세요:

\`\`\`json
[
  {
    "id": "고유ID",
    "tableName": "테이블명",
    "description": "테이블 설명 (한국어)",
    "fields": [
      {
        "name": "필드명",
        "type": "string | number | boolean | datetime | json | uuid | enum",
        "nullable": false,
        "isPrimaryKey": false,
        "isForeignKey": false,
        "foreignTable": null,
        "foreignField": null,
        "defaultValue": null,
        "enumValues": null,
        "description": "필드 설명 (한국어)"
      }
    ],
    "relations": [
      {
        "fromTable": "현재테이블",
        "fromField": "필드명",
        "toTable": "대상테이블",
        "toField": "id",
        "type": "one-to-one | one-to-many | many-to-many"
      }
    ]
  }
]
\`\`\`

## 필수 테이블
모든 게임에 반드시 포함: users, products, product_contents, purchases

## 상품 유형별 조건부 테이블
상품 목록에 해당 유형이 포함되어 있을 때만 추가하세요:
- gacha, loot_box → gacha_pools (가챠 풀 구성, 확률 정보)
- battle_pass → battle_pass_seasons (시즌 정보), battle_pass_tiers (티어별 보상)
- subscription → subscriptions (구독 관리, 결제 주기)
- vip_membership → vip_tiers (VIP 등급별 혜택)
- cosmetics → cosmetics (코스메틱 아이템 카탈로그)
- energy_stamina → energy_system (에너지 충전 주기, 최대치)
- progression_boost → boosts (부스트 유형, 지속 시간)
- season_content → seasonal_content (시즌 컨텐츠 일정)
- expansion_dlc → dlc_expansions (확장팩 목록, 잠금 해제)
- bundles → bundle_contents (번들 구성 상세)
- rewarded_ads, offerwalls → ad_placements (광고 지면, 보상 설정)

## 장르별 추천 테이블
게임 장르에 따라 아래 테이블을 추가로 고려하세요:
- RPG / MMORPG → enhancement_history (강화 이력), guilds (길드), guild_members (길드원), rankings (랭킹), achievements (업적)
- Strategy → guilds (길드/동맹), guild_members (동맹원), rankings (랭킹), game_servers (서버 목록)
- Casual / Puzzle → energy_system (에너지 시스템), ad_placements (광고 지면)
- MMORPG → game_servers (게임 서버 목록)

## 스키마 설계 원칙
1. 모든 테이블에는 uuid 타입의 id 기본키를 포함하세요.
2. 외래키 관계를 명확히 정의하고, relations 배열에 반드시 반영하세요.
3. created_at, updated_at 타임스탬프 필드를 각 테이블에 포함하세요.
4. enum 필드에는 반드시 enumValues 배열을 지정하세요.
5. 정규화(3NF)를 준수하되, 조회 성능을 위한 비정규화는 허용합니다.
6. 테이블명과 필드명은 snake_case 영문으로 작성하세요.
7. description은 모든 항목에 대해 한국어로 작성하세요.
8. 금액 필드는 number 타입으로, KRW와 USD를 분리하세요.
9. 상품 간 관계(번들 구성, 가챠 풀 등)를 중간 테이블로 표현하세요.
10. 불필요한 테이블은 생성하지 마세요. 상품 목록에 없는 유형의 테이블은 제외합니다.`;

export const FUNNEL_STRATEGY_PROMPT = `당신은 게임 유저 퍼널 최적화 전문가입니다. 다음 게임 구조와 설계된 상품 목록을 분석하고, 8단계 퍼널의 각 단계별 전략을 제안하세요.

게임 구조:
{{GAME_STRUCTURE}}

현재 설계된 상품 목록:
{{PRODUCTS}}

반드시 다음 JSON 배열 형식으로 응답하세요. name은 반드시 아래 8가지 중 하나를 사용하세요:

\`\`\`json
[
  {
    "name": "awareness | first_session | tutorial_complete | core_loop_engaged | first_purchase_prompt | first_purchase | repeat_purchase | subscription_or_vip",
    "labelKo": "단계명 (한국어)",
    "order": 0,
    "conversionRate": 100,
    "targetKpi": "목표 KPI 설명 (한국어)",
    "strategies": ["전략1 (한국어)", "전략2", "전략3"],
    "assignedProductIds": [],
    "notes": "이 게임에 특화된 전략 노트 (한국어)"
  }
]
\`\`\`

8단계 퍼널:
1. 인지 (awareness) - 100%
2. 첫 세션 (first_session) - 80~90%
3. 튜토리얼 완료 (tutorial_complete) - 70~85%
4. 코어루프 진입 (core_loop_engaged) - 50~70%
5. 첫 구매 유도 (first_purchase_prompt) - 10~20%
6. 첫 결제 (first_purchase) - 3~8%
7. 반복 결제 (repeat_purchase) - 첫 결제의 30~50%
8. 구독/VIP (subscription_or_vip) - 반복 결제의 5~10%

전략은 해당 게임의 장르와 특성에 맞춰 구체적으로 작성하세요.
상품 목록에서 각 퍼널 단계에 적합한 상품을 description에 언급하세요.`;

export const PRODUCT_MIX_PROMPT = `당신은 게임 유료화 상품 구성 전문가입니다. 다음 게임 구조를 분석하고, 최적의 상품 믹스(유형별 매출 비율)를 추천하세요.

게임 구조:
{{GAME_STRUCTURE}}

반드시 다음 JSON 형식으로 응답하세요:

\`\`\`json
{
  "mix": [
    {
      "type": "gacha | battle_pass | subscription | currency_packs | cosmetics | starter_pack | loot_box | energy_stamina | progression_boost | remove_ads | season_content | expansion_dlc | vip_membership | bundles | rewarded_ads | offerwalls",
      "label": "상품 유형 한국어 레이블",
      "percentage": 30,
      "rationale": "이 비율을 추천하는 구체적인 이유 (한국어)"
    }
  ]
}
\`\`\`

추천 원칙:
1. 모든 percentage의 합이 정확히 100이어야 합니다.
2. 게임 장르와 핵심 루프에 맞는 상품 유형만 포함하세요.
3. 각 유형의 비율은 해당 장르의 업계 벤치마크를 참고하되, 게임 고유 특성을 반영하세요.
4. RPG/MMORPG는 가챠와 배틀패스 비중이 높고, 캐주얼은 광고와 코스메틱 비중이 높은 경향이 있습니다.
5. 최소 4개, 최대 10개 유형을 추천하세요.
6. rationale은 해당 게임의 시스템(재화, 진행, 소셜 등)과 연결하여 구체적으로 작성하세요.
7. 모든 텍스트는 한국어로 작성하세요.`;
