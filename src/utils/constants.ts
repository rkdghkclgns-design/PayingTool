import type {
  FunnelStageName,
  UserSegment,
  RetentionStage,
  ProductCategory,
  GameGenre,
  TargetMarket,
} from '../models';

export const FUNNEL_STAGE_LABELS: Map<FunnelStageName, string> = new Map([
  ['awareness', '인지'],
  ['first_session', '첫 세션'],
  ['tutorial_complete', '튜토리얼 완료'],
  ['core_loop_engaged', '코어 루프 진입'],
  ['first_purchase_prompt', '첫 구매 유도'],
  ['first_purchase', '첫 결제'],
  ['repeat_purchase', '반복 결제'],
  ['subscription_or_vip', '구독/VIP'],
]);

export const USER_SEGMENT_LABELS: Map<UserSegment, string> = new Map([
  ['non_payer', 'NPU유도'],
  ['minnow', '소과금 (Minnow)'],
  ['dolphin', '중과금 (Dolphin)'],
  ['whale', '고과금 (Whale)'],
  ['super_whale', '초고과금 (Super Whale)'],
]);

export const RETENTION_STAGE_LABELS: Map<RetentionStage, string> = new Map([
  ['d1', 'D1'],
  ['d3', 'D3'],
  ['d7', 'D7'],
  ['d14', 'D14'],
  ['d30', 'D30'],
  ['d60', 'D60'],
  ['d90', 'D90'],
  ['d180', 'D180'],
  ['d365', 'D365'],
]);

export const PRODUCT_CATEGORY_LABELS: Map<ProductCategory, string> = new Map([
  ['currency_pack', '재화 패키지'],
  ['subscription', '구독'],
  ['battle_pass', '배틀패스'],
  ['starter_pack', '스타터 팩'],
  ['piggy_bank', '저금통'],
  ['limited_offer', '한정 오퍼'],
  ['cosmetic', '코스메틱'],
  ['gacha', '가챠/뽑기'],
  ['energy', '에너지/행동력'],
  ['boost', '부스트/버프'],
  ['bundle', '번들'],
  ['vip', 'VIP'],
  ['probability_package', '확률 패키지'],
  ['pass', '패스권'],
  ['remove_ads', '광고 제거'],
  ['other', '기타'],
]);

export const GAME_GENRE_LABELS: Map<GameGenre, string> = new Map([
  ['rpg', 'RPG'],
  ['puzzle', '퍼즐'],
  ['strategy', '전략'],
  ['casual', '캐주얼'],
  ['simulation', '시뮬레이션'],
  ['action', '액션'],
  ['sports', '스포츠'],
  ['idle', '방치형'],
  ['mmorpg', 'MMORPG'],
  ['other', '기타'],
]);

export const TARGET_MARKET_LABELS: Map<TargetMarket, string> = new Map([
  ['kr', '한국'],
  ['cn', '중국'],
  ['jp', '일본'],
  ['global', '글로벌'],
]);

export const DEFAULT_CONVERSION_RATES: Record<FunnelStageName, number> = {
  awareness: 1.0,
  first_session: 0.55,
  tutorial_complete: 0.7,
  core_loop_engaged: 0.5,
  first_purchase_prompt: 0.3,
  first_purchase: 0.05,
  repeat_purchase: 0.4,
  subscription_or_vip: 0.15,
} as const;

export const KRW_USD_RATE = 1350;
