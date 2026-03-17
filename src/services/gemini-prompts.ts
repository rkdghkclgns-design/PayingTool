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
  "rawAnalysis": "전체 분석 요약 (한국어로 상세하게)"
}
\`\`\`

분석 시 주의사항:
1. 마인드맵에서 보이는 모든 게임 시스템과 기능을 포함하세요.
2. 재화 시스템을 반드시 식별하세요 (소프트/하드/프리미엄/이벤트).
3. 리텐션에 기여하는 요소를 모두 나열하세요.
4. 경쟁 요소와 소셜 기능을 구분하세요.
5. 모든 텍스트는 한국어로 작성하세요.`;

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
7. 모든 상품명과 설명은 한국어로
8. 최소 15개 이상의 상품을 추천하세요`;

export const SCHEMA_GENERATION_PROMPT = `당신은 게임 백엔드 데이터베이스 설계 전문가입니다. 다음 유료화 상품 목록을 분석하고, 필요한 데이터베이스 스키마를 생성하세요.

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
        "type": "string | number | boolean | datetime | json | enum",
        "required": true,
        "isPrimaryKey": false,
        "isForeignKey": false,
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

필수 테이블: users, products, purchases, currencies, inventory
상품 유형에 따라 추가: gacha_pools, subscriptions, battle_pass, vip_tiers, promotions`;

export const FUNNEL_STRATEGY_PROMPT = `당신은 게임 유저 퍼널 최적화 전문가입니다. 다음 게임 구조를 분석하고, 8단계 퍼널의 각 단계별 전략을 제안하세요.

게임 구조:
{{GAME_STRUCTURE}}

반드시 다음 JSON 배열 형식으로 응답하세요:

\`\`\`json
[
  {
    "name": "awareness | install | tutorial | first_session | retention | first_purchase | repeat_purchase | whale",
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
1. 인지 (Awareness) - 100%
2. 설치 (Install) - 30~50%
3. 튜토리얼 (Tutorial) - 70~85%
4. 첫 세션 (First Session) - 80~90%
5. 리텐션 (Retention) - D7 기준 15~25%
6. 첫 결제 (First Purchase) - 3~8%
7. 반복 결제 (Repeat Purchase) - 첫 결제의 30~50%
8. 고래화 (Whale) - 반복 결제의 5~10%

전략은 해당 게임의 장르와 특성에 맞춰 구체적으로 작성하세요.`;

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
