import type { DataSchema } from '../models';
import { CORE_SCHEMAS_A } from './schema-templates-core-a';
import { CORE_SCHEMAS_B } from './schema-templates-core-b';

/**
 * 코어 스키마 (테이블 1~10)
 * users, products, purchases, currencies, inventory,
 * shop_config, events, promotions, vip_tiers, gacha_pools
 */
export const CORE_SCHEMAS: readonly DataSchema[] = [
  ...CORE_SCHEMAS_A,
  ...CORE_SCHEMAS_B,
];
