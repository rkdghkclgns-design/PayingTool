import type { DataSchema } from '../models';
import { EXTENDED_SCHEMAS_A } from './schema-templates-extended-a';
import { EXTENDED_SCHEMAS_B } from './schema-templates-extended-b';
import { EXTENDED_SCHEMAS_C } from './schema-templates-extended-c';
import { EXTENDED_SCHEMAS_D } from './schema-templates-extended-d';

/**
 * 확장 스키마 (테이블 11~26)
 * 배틀패스, 구독, 코스메틱, 에너지, 부스트, 시즌 콘텐츠, DLC,
 * 번들 구성, 광고, 강화 이력, 길드, 길드 멤버, 랭킹, 서버, 업적
 */
export const EXTENDED_SCHEMAS: readonly DataSchema[] = [
  ...EXTENDED_SCHEMAS_A,
  ...EXTENDED_SCHEMAS_C,
  ...EXTENDED_SCHEMAS_B,
  ...EXTENDED_SCHEMAS_D,
];
