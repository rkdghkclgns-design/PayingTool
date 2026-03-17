import type { DataSchema } from '../models';
import { CORE_SCHEMAS } from './schema-templates-core';
import { EXTENDED_SCHEMAS } from './schema-templates-extended';

export const DEFAULT_SCHEMAS: readonly DataSchema[] = [
  ...CORE_SCHEMAS,
  ...EXTENDED_SCHEMAS,
];
