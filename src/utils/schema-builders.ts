import type { DataSchema } from '../models';
import { createField } from './schema-generator';

function now(): string {
  return new Date().toISOString();
}

export function buildGachaPoolsSchema(): DataSchema {
  const ts = now();
  return {
    id: 'schema_gacha_pools',
    tableName: 'gacha_pools',
    description: '가챠 풀 구성 및 확률 정보',
    fields: [
      createField('id', 'uuid', { isPrimaryKey: true, description: '가챠 풀 고유 ID' }),
      createField('product_id', 'uuid', {
        isForeignKey: true, foreignTable: 'products', foreignField: 'id',
        description: '연결된 상품 ID (FK)',
      }),
      createField('name', 'string', { description: '가챠 풀 이름' }),
      createField('rarity', 'enum', {
        enumValues: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        description: '등급',
      }),
      createField('drop_rate', 'number', { description: '드롭 확률 (%)' }),
      createField('pity_threshold', 'number', { description: '천장 횟수', nullable: true }),
      createField('is_active', 'boolean', { description: '활성 여부', defaultValue: 'true' }),
      createField('created_at', 'datetime', { description: '생성일시' }),
      createField('updated_at', 'datetime', { description: '수정일시' }),
    ],
    relations: [
      { fromTable: 'gacha_pools', fromField: 'product_id', toTable: 'products', toField: 'id', type: 'one-to-many' },
    ],
    createdAt: ts,
    updatedAt: ts,
  };
}

export function buildBattlePassSeasonsSchema(): DataSchema {
  const ts = now();
  return {
    id: 'schema_battle_pass_seasons',
    tableName: 'battle_pass_seasons',
    description: '배틀패스 시즌 정보',
    fields: [
      createField('id', 'uuid', { isPrimaryKey: true, description: '시즌 고유 ID' }),
      createField('name', 'string', { description: '시즌 이름' }),
      createField('start_date', 'datetime', { description: '시작일' }),
      createField('end_date', 'datetime', { description: '종료일' }),
      createField('max_tier', 'number', { description: '최대 티어' }),
      createField('premium_price_krw', 'number', { description: '프리미엄 가격 (KRW)' }),
      createField('is_active', 'boolean', { description: '활성 여부', defaultValue: 'false' }),
      createField('created_at', 'datetime', { description: '생성일시' }),
      createField('updated_at', 'datetime', { description: '수정일시' }),
    ],
    relations: [],
    createdAt: ts,
    updatedAt: ts,
  };
}

export function buildBattlePassTiersSchema(): DataSchema {
  const ts = now();
  return {
    id: 'schema_battle_pass_tiers',
    tableName: 'battle_pass_tiers',
    description: '배틀패스 티어별 보상 정보',
    fields: [
      createField('id', 'uuid', { isPrimaryKey: true, description: '티어 고유 ID' }),
      createField('season_id', 'uuid', {
        isForeignKey: true, foreignTable: 'battle_pass_seasons', foreignField: 'id',
        description: '시즌 ID (FK)',
      }),
      createField('tier_number', 'number', { description: '티어 번호' }),
      createField('free_reward', 'string', { description: '무료 보상', nullable: true }),
      createField('premium_reward', 'string', { description: '프리미엄 보상', nullable: true }),
      createField('xp_required', 'number', { description: '필요 경험치' }),
      createField('created_at', 'datetime', { description: '생성일시' }),
    ],
    relations: [
      { fromTable: 'battle_pass_tiers', fromField: 'season_id', toTable: 'battle_pass_seasons', toField: 'id', type: 'one-to-many' },
    ],
    createdAt: ts,
    updatedAt: ts,
  };
}

export function buildSubscriptionsSchema(): DataSchema {
  const ts = now();
  return {
    id: 'schema_subscriptions',
    tableName: 'subscriptions',
    description: '구독 관리 및 결제 주기',
    fields: [
      createField('id', 'uuid', { isPrimaryKey: true, description: '구독 고유 ID' }),
      createField('user_id', 'uuid', {
        isForeignKey: true, foreignTable: 'users', foreignField: 'id',
        description: '사용자 ID (FK)',
      }),
      createField('product_id', 'uuid', {
        isForeignKey: true, foreignTable: 'products', foreignField: 'id',
        description: '상품 ID (FK)',
      }),
      createField('status', 'enum', {
        enumValues: ['active', 'paused', 'cancelled', 'expired'],
        description: '구독 상태',
      }),
      createField('billing_cycle', 'enum', {
        enumValues: ['weekly', 'monthly', 'quarterly', 'yearly'],
        description: '결제 주기',
      }),
      createField('started_at', 'datetime', { description: '구독 시작일' }),
      createField('expires_at', 'datetime', { description: '만료일', nullable: true }),
      createField('created_at', 'datetime', { description: '생성일시' }),
      createField('updated_at', 'datetime', { description: '수정일시' }),
    ],
    relations: [
      { fromTable: 'subscriptions', fromField: 'user_id', toTable: 'users', toField: 'id', type: 'one-to-many' },
      { fromTable: 'subscriptions', fromField: 'product_id', toTable: 'products', toField: 'id', type: 'one-to-many' },
    ],
    createdAt: ts,
    updatedAt: ts,
  };
}

export function buildVipTiersSchema(): DataSchema {
  const ts = now();
  return {
    id: 'schema_vip_tiers',
    tableName: 'vip_tiers',
    description: 'VIP 등급별 혜택 정보',
    fields: [
      createField('id', 'uuid', { isPrimaryKey: true, description: 'VIP 티어 고유 ID' }),
      createField('tier_name', 'string', { description: '등급 이름' }),
      createField('tier_level', 'number', { description: '등급 레벨' }),
      createField('min_spent', 'number', { description: '최소 누적 지출액' }),
      createField('benefits', 'json', { description: '혜택 목록 (JSON)' }),
      createField('daily_reward', 'string', { description: '일일 보상', nullable: true }),
      createField('created_at', 'datetime', { description: '생성일시' }),
      createField('updated_at', 'datetime', { description: '수정일시' }),
    ],
    relations: [],
    createdAt: ts,
    updatedAt: ts,
  };
}

export function buildCosmeticsSchema(): DataSchema {
  const ts = now();
  return {
    id: 'schema_cosmetics',
    tableName: 'cosmetics',
    description: '코스메틱 아이템 카탈로그',
    fields: [
      createField('id', 'uuid', { isPrimaryKey: true, description: '코스메틱 고유 ID' }),
      createField('name', 'string', { description: '아이템 이름' }),
      createField('category', 'enum', {
        enumValues: ['skin', 'avatar', 'frame', 'effect', 'emote'],
        description: '코스메틱 유형',
      }),
      createField('rarity', 'enum', {
        enumValues: ['common', 'rare', 'epic', 'legendary'],
        description: '등급',
      }),
      createField('preview_url', 'string', { description: '미리보기 URL', nullable: true }),
      createField('is_limited', 'boolean', { description: '한정판 여부', defaultValue: 'false' }),
      createField('created_at', 'datetime', { description: '생성일시' }),
    ],
    relations: [],
    createdAt: ts,
    updatedAt: ts,
  };
}

export function buildEnergySystemSchema(): DataSchema {
  const ts = now();
  return {
    id: 'schema_energy_system',
    tableName: 'energy_system',
    description: '에너지 시스템 설정',
    fields: [
      createField('id', 'uuid', { isPrimaryKey: true, description: '에너지 설정 고유 ID' }),
      createField('energy_type', 'string', { description: '에너지 유형 이름' }),
      createField('max_capacity', 'number', { description: '최대 보유량' }),
      createField('regen_rate', 'number', { description: '분당 충전량' }),
      createField('regen_interval_sec', 'number', { description: '충전 간격 (초)' }),
      createField('refill_cost', 'number', { description: '즉시 충전 비용 (하드 재화)' }),
      createField('created_at', 'datetime', { description: '생성일시' }),
      createField('updated_at', 'datetime', { description: '수정일시' }),
    ],
    relations: [],
    createdAt: ts,
    updatedAt: ts,
  };
}

export function buildBoostsSchema(): DataSchema {
  const ts = now();
  return {
    id: 'schema_boosts',
    tableName: 'boosts',
    description: '부스트 아이템 유형 및 효과',
    fields: [
      createField('id', 'uuid', { isPrimaryKey: true, description: '부스트 고유 ID' }),
      createField('name', 'string', { description: '부스트 이름' }),
      createField('boost_type', 'enum', {
        enumValues: ['xp', 'gold', 'drop_rate', 'speed', 'damage'],
        description: '부스트 유형',
      }),
      createField('multiplier', 'number', { description: '배율' }),
      createField('duration_minutes', 'number', { description: '지속 시간 (분)' }),
      createField('is_stackable', 'boolean', { description: '중첩 가능 여부', defaultValue: 'false' }),
      createField('created_at', 'datetime', { description: '생성일시' }),
    ],
    relations: [],
    createdAt: ts,
    updatedAt: ts,
  };
}

export function buildBundleContentsSchema(): DataSchema {
  const ts = now();
  return {
    id: 'schema_bundle_contents',
    tableName: 'bundle_contents',
    description: '번들 구성 상세 아이템',
    fields: [
      createField('id', 'uuid', { isPrimaryKey: true, description: '번들 구성 고유 ID' }),
      createField('product_id', 'uuid', {
        isForeignKey: true, foreignTable: 'products', foreignField: 'id',
        description: '번들 상품 ID (FK)',
      }),
      createField('item_type', 'enum', {
        enumValues: ['currency', 'item', 'cosmetic', 'boost', 'energy'],
        description: '아이템 유형',
      }),
      createField('item_name', 'string', { description: '아이템 이름' }),
      createField('quantity', 'number', { description: '수량' }),
      createField('sort_order', 'number', { description: '정렬 순서', defaultValue: '0' }),
    ],
    relations: [
      { fromTable: 'bundle_contents', fromField: 'product_id', toTable: 'products', toField: 'id', type: 'one-to-many' },
    ],
    createdAt: ts,
    updatedAt: ts,
  };
}

export function buildAdPlacementsSchema(): DataSchema {
  const ts = now();
  return {
    id: 'schema_ad_placements',
    tableName: 'ad_placements',
    description: '광고 지면 및 보상 설정',
    fields: [
      createField('id', 'uuid', { isPrimaryKey: true, description: '광고 지면 고유 ID' }),
      createField('placement_name', 'string', { description: '광고 지면 이름' }),
      createField('ad_type', 'enum', {
        enumValues: ['rewarded_video', 'interstitial', 'banner', 'offerwall'],
        description: '광고 유형',
      }),
      createField('reward_type', 'string', { description: '보상 유형' }),
      createField('reward_amount', 'number', { description: '보상 수량' }),
      createField('daily_cap', 'number', { description: '일일 최대 노출 횟수' }),
      createField('is_active', 'boolean', { description: '활성 여부', defaultValue: 'true' }),
      createField('created_at', 'datetime', { description: '생성일시' }),
    ],
    relations: [],
    createdAt: ts,
    updatedAt: ts,
  };
}

export function buildEnhancementHistorySchema(): DataSchema {
  const ts = now();
  return {
    id: 'schema_enhancement_history',
    tableName: 'enhancement_history',
    description: '장비 강화 이력',
    fields: [
      createField('id', 'uuid', { isPrimaryKey: true, description: '강화 이력 고유 ID' }),
      createField('user_id', 'uuid', {
        isForeignKey: true, foreignTable: 'users', foreignField: 'id',
        description: '사용자 ID (FK)',
      }),
      createField('item_id', 'string', { description: '강화 대상 아이템 ID' }),
      createField('from_level', 'number', { description: '강화 전 레벨' }),
      createField('to_level', 'number', { description: '강화 후 레벨' }),
      createField('result', 'enum', {
        enumValues: ['success', 'fail', 'destroy'],
        description: '강화 결과',
      }),
      createField('cost_currency', 'string', { description: '소모 재화 유형' }),
      createField('cost_amount', 'number', { description: '소모 재화 수량' }),
      createField('enhanced_at', 'datetime', { description: '강화 일시' }),
    ],
    relations: [
      { fromTable: 'enhancement_history', fromField: 'user_id', toTable: 'users', toField: 'id', type: 'one-to-many' },
    ],
    createdAt: ts,
    updatedAt: ts,
  };
}

export function buildGuildsSchema(): DataSchema {
  const ts = now();
  return {
    id: 'schema_guilds',
    tableName: 'guilds',
    description: '길드 / 동맹 정보',
    fields: [
      createField('id', 'uuid', { isPrimaryKey: true, description: '길드 고유 ID' }),
      createField('name', 'string', { description: '길드 이름' }),
      createField('leader_id', 'uuid', {
        isForeignKey: true, foreignTable: 'users', foreignField: 'id',
        description: '길드장 사용자 ID (FK)',
      }),
      createField('level', 'number', { description: '길드 레벨', defaultValue: '1' }),
      createField('max_members', 'number', { description: '최대 인원', defaultValue: '30' }),
      createField('description', 'string', { description: '길드 소개', nullable: true }),
      createField('created_at', 'datetime', { description: '생성일시' }),
      createField('updated_at', 'datetime', { description: '수정일시' }),
    ],
    relations: [
      { fromTable: 'guilds', fromField: 'leader_id', toTable: 'users', toField: 'id', type: 'one-to-one' },
    ],
    createdAt: ts,
    updatedAt: ts,
  };
}

export function buildGuildMembersSchema(): DataSchema {
  const ts = now();
  return {
    id: 'schema_guild_members',
    tableName: 'guild_members',
    description: '길드 멤버 목록',
    fields: [
      createField('id', 'uuid', { isPrimaryKey: true, description: '멤버십 고유 ID' }),
      createField('guild_id', 'uuid', {
        isForeignKey: true, foreignTable: 'guilds', foreignField: 'id',
        description: '길드 ID (FK)',
      }),
      createField('user_id', 'uuid', {
        isForeignKey: true, foreignTable: 'users', foreignField: 'id',
        description: '사용자 ID (FK)',
      }),
      createField('role', 'enum', {
        enumValues: ['leader', 'officer', 'member'],
        description: '길드 내 역할',
      }),
      createField('joined_at', 'datetime', { description: '가입일시' }),
    ],
    relations: [
      { fromTable: 'guild_members', fromField: 'guild_id', toTable: 'guilds', toField: 'id', type: 'one-to-many' },
      { fromTable: 'guild_members', fromField: 'user_id', toTable: 'users', toField: 'id', type: 'one-to-many' },
    ],
    createdAt: ts,
    updatedAt: ts,
  };
}

export function buildRankingsSchema(): DataSchema {
  const ts = now();
  return {
    id: 'schema_rankings',
    tableName: 'rankings',
    description: '랭킹 / 리더보드',
    fields: [
      createField('id', 'uuid', { isPrimaryKey: true, description: '랭킹 기록 고유 ID' }),
      createField('user_id', 'uuid', {
        isForeignKey: true, foreignTable: 'users', foreignField: 'id',
        description: '사용자 ID (FK)',
      }),
      createField('ranking_type', 'enum', {
        enumValues: ['pvp', 'pve', 'guild', 'event'],
        description: '랭킹 유형',
      }),
      createField('score', 'number', { description: '점수' }),
      createField('rank_position', 'number', { description: '순위' }),
      createField('season', 'string', { description: '시즌 식별자' }),
      createField('recorded_at', 'datetime', { description: '기록 일시' }),
    ],
    relations: [
      { fromTable: 'rankings', fromField: 'user_id', toTable: 'users', toField: 'id', type: 'one-to-many' },
    ],
    createdAt: ts,
    updatedAt: ts,
  };
}

export function buildGameServersSchema(): DataSchema {
  const ts = now();
  return {
    id: 'schema_game_servers',
    tableName: 'game_servers',
    description: '게임 서버 목록',
    fields: [
      createField('id', 'uuid', { isPrimaryKey: true, description: '서버 고유 ID' }),
      createField('name', 'string', { description: '서버 이름' }),
      createField('region', 'enum', {
        enumValues: ['kr', 'jp', 'cn', 'sea', 'na', 'eu', 'global'],
        description: '서버 지역',
      }),
      createField('status', 'enum', {
        enumValues: ['online', 'maintenance', 'offline'],
        description: '서버 상태',
      }),
      createField('max_players', 'number', { description: '최대 수용 인원' }),
      createField('current_players', 'number', { description: '현재 접속자 수', defaultValue: '0' }),
      createField('created_at', 'datetime', { description: '생성일시' }),
    ],
    relations: [],
    createdAt: ts,
    updatedAt: ts,
  };
}

export function buildAchievementsSchema(): DataSchema {
  const ts = now();
  return {
    id: 'schema_achievements',
    tableName: 'achievements',
    description: '업적 / 도전과제',
    fields: [
      createField('id', 'uuid', { isPrimaryKey: true, description: '업적 고유 ID' }),
      createField('name', 'string', { description: '업적 이름' }),
      createField('description', 'string', { description: '업적 설명' }),
      createField('category', 'enum', {
        enumValues: ['combat', 'collection', 'social', 'progression', 'special'],
        description: '업적 카테고리',
      }),
      createField('reward_type', 'string', { description: '보상 유형' }),
      createField('reward_amount', 'number', { description: '보상 수량' }),
      createField('condition', 'json', { description: '달성 조건 (JSON)' }),
      createField('created_at', 'datetime', { description: '생성일시' }),
    ],
    relations: [],
    createdAt: ts,
    updatedAt: ts,
  };
}
