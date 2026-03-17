import type { Product, DataSchema, SchemaField } from '../models';
import {
  buildGachaPoolsSchema,
  buildBattlePassSeasonsSchema,
  buildBattlePassTiersSchema,
  buildSubscriptionsSchema,
  buildVipTiersSchema,
  buildCosmeticsSchema,
  buildEnergySystemSchema,
  buildBoostsSchema,
  buildBundleContentsSchema,
  buildAdPlacementsSchema,
  buildEnhancementHistorySchema,
  buildGuildsSchema,
  buildGuildMembersSchema,
  buildRankingsSchema,
  buildGameServersSchema,
  buildAchievementsSchema,
} from './schema-builders';

/**
 * Generate database schemas from a list of products.
 * Creates base tables (users, products, product_contents, purchases)
 * plus conditional tables based on product categories and game genre.
 */
export function generateSchemasFromProducts(
  products: readonly Product[],
  genre?: string,
): readonly DataSchema[] {
  const now = new Date().toISOString();
  const categoriesUsed = new Set(products.map((p) => p.category));

  const usersSchema: DataSchema = {
    id: 'schema_users',
    tableName: 'users',
    description: '게임 사용자 정보',
    fields: [
      createField('id', 'uuid', { isPrimaryKey: true, description: '사용자 고유 ID' }),
      createField('username', 'string', { description: '사용자 이름' }),
      createField('segment', 'enum', {
        enumValues: ['non_payer', 'minnow', 'dolphin', 'whale', 'super_whale'],
        description: '사용자 과금 세그먼트',
      }),
      createField('retention_stage', 'enum', {
        enumValues: ['d1', 'd3', 'd7', 'd14', 'd30', 'd60', 'd90', 'd180', 'd365'],
        description: '리텐션 단계',
      }),
      createField('total_spent', 'number', { description: '총 지출액', defaultValue: '0' }),
      createField('created_at', 'datetime', { description: '가입일시' }),
      createField('last_login_at', 'datetime', { description: '최근 로그인', nullable: true }),
    ],
    relations: [],
    createdAt: now,
    updatedAt: now,
  };

  const categoryList = [...categoriesUsed];

  const productsSchema: DataSchema = {
    id: 'schema_products',
    tableName: 'products',
    description: '인앱 상품 정보',
    fields: [
      createField('id', 'uuid', { isPrimaryKey: true, description: '상품 고유 ID' }),
      createField('name', 'string', { description: '상품명' }),
      createField('description', 'string', { description: '상품 설명', nullable: true }),
      createField('category', 'enum', {
        enumValues: categoryList.length > 0 ? categoryList : ['other'],
        description: '상품 카테고리',
      }),
      createField('price_krw', 'number', { description: '가격 (KRW)' }),
      createField('price_usd', 'number', { description: '가격 (USD)' }),
      createField('is_active', 'boolean', { description: '활성 여부', defaultValue: 'true' }),
      createField('purchase_limit_type', 'enum', {
        enumValues: ['once', 'daily', 'weekly', 'monthly', 'unlimited'],
        description: '구매 제한 유형',
      }),
      createField('purchase_limit_count', 'number', { description: '구매 제한 횟수' }),
      createField('sort_order', 'number', { description: '정렬 순서', defaultValue: '0' }),
      createField('created_at', 'datetime', { description: '생성일시' }),
      createField('updated_at', 'datetime', { description: '수정일시' }),
    ],
    relations: [],
    createdAt: now,
    updatedAt: now,
  };

  const productContentsSchema: DataSchema = {
    id: 'schema_product_contents',
    tableName: 'product_contents',
    description: '상품 구성 아이템',
    fields: [
      createField('id', 'uuid', { isPrimaryKey: true, description: '구성 아이템 ID' }),
      createField('product_id', 'uuid', {
        isForeignKey: true,
        foreignTable: 'products',
        foreignField: 'id',
        description: '상품 ID (FK)',
      }),
      createField('item_name', 'string', { description: '아이템 이름' }),
      createField('quantity', 'number', { description: '수량' }),
      createField('description', 'string', { description: '설명', nullable: true }),
    ],
    relations: [
      {
        fromTable: 'product_contents',
        fromField: 'product_id',
        toTable: 'products',
        toField: 'id',
        type: 'one-to-many',
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const purchasesSchema: DataSchema = {
    id: 'schema_purchases',
    tableName: 'purchases',
    description: '구매 내역',
    fields: [
      createField('id', 'uuid', { isPrimaryKey: true, description: '구매 ID' }),
      createField('user_id', 'uuid', {
        isForeignKey: true,
        foreignTable: 'users',
        foreignField: 'id',
        description: '사용자 ID (FK)',
      }),
      createField('product_id', 'uuid', {
        isForeignKey: true,
        foreignTable: 'products',
        foreignField: 'id',
        description: '상품 ID (FK)',
      }),
      createField('amount_krw', 'number', { description: '결제 금액 (KRW)' }),
      createField('amount_usd', 'number', { description: '결제 금액 (USD)' }),
      createField('purchased_at', 'datetime', { description: '구매 일시' }),
      createField('platform', 'enum', {
        enumValues: ['ios', 'android', 'web', 'pc'],
        description: '구매 플랫폼',
      }),
    ],
    relations: [
      {
        fromTable: 'purchases',
        fromField: 'user_id',
        toTable: 'users',
        toField: 'id',
        type: 'one-to-many',
      },
      {
        fromTable: 'purchases',
        fromField: 'product_id',
        toTable: 'products',
        toField: 'id',
        type: 'one-to-many',
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  // Base schemas (always included)
  const schemas: DataSchema[] = [usersSchema, productsSchema, productContentsSchema, purchasesSchema];

  // Conditional tables based on product categories
  if (categoriesUsed.has('gacha')) {
    schemas.push(buildGachaPoolsSchema());
  }
  if (categoriesUsed.has('battle_pass')) {
    schemas.push(buildBattlePassSeasonsSchema());
    schemas.push(buildBattlePassTiersSchema());
  }
  if (categoriesUsed.has('subscription')) {
    schemas.push(buildSubscriptionsSchema());
  }
  if (categoriesUsed.has('vip')) {
    schemas.push(buildVipTiersSchema());
  }
  if (categoriesUsed.has('cosmetic')) {
    schemas.push(buildCosmeticsSchema());
  }
  if (categoriesUsed.has('energy')) {
    schemas.push(buildEnergySystemSchema());
  }
  if (categoriesUsed.has('boost')) {
    schemas.push(buildBoostsSchema());
  }
  if (categoriesUsed.has('bundle')) {
    schemas.push(buildBundleContentsSchema());
  }

  // Genre-specific tables
  if (genre === 'rpg' || genre === 'mmorpg') {
    schemas.push(buildEnhancementHistorySchema());
    schemas.push(buildGuildsSchema());
    schemas.push(buildGuildMembersSchema());
    schemas.push(buildRankingsSchema());
    schemas.push(buildAchievementsSchema());
  }
  if (genre === 'mmorpg' || genre === 'strategy') {
    if (!schemas.some((s) => s.tableName === 'guilds')) {
      schemas.push(buildGuildsSchema());
      schemas.push(buildGuildMembersSchema());
    }
    schemas.push(buildGameServersSchema());
    if (!schemas.some((s) => s.tableName === 'rankings')) {
      schemas.push(buildRankingsSchema());
    }
  }
  if (genre === 'casual' || genre === 'puzzle' || genre === 'idle') {
    if (!schemas.some((s) => s.tableName === 'ad_placements')) {
      schemas.push(buildAdPlacementsSchema());
    }
    if (!schemas.some((s) => s.tableName === 'energy_system')) {
      schemas.push(buildEnergySystemSchema());
    }
  }

  return schemas;
}

interface FieldOptions {
  readonly nullable?: boolean;
  readonly isPrimaryKey?: boolean;
  readonly isForeignKey?: boolean;
  readonly foreignTable?: string;
  readonly foreignField?: string;
  readonly enumValues?: readonly string[];
  readonly description?: string;
  readonly defaultValue?: string;
}

export function createField(
  name: string,
  type: SchemaField['type'],
  options: FieldOptions = {},
): SchemaField {
  return {
    name,
    type,
    nullable: options.nullable ?? false,
    isPrimaryKey: options.isPrimaryKey ?? false,
    isForeignKey: options.isForeignKey ?? false,
    foreignTable: options.foreignTable ?? null,
    foreignField: options.foreignField ?? null,
    enumValues: options.enumValues ?? null,
    description: options.description ?? '',
    defaultValue: options.defaultValue ?? null,
  };
}

/**
 * Convert a DataSchema to a SQL CREATE TABLE statement.
 */
export function schemaToSql(schema: DataSchema): string {
  const lines: string[] = [];
  lines.push(`CREATE TABLE ${schema.tableName} (`);

  const fieldLines = schema.fields.map((field) => {
    const parts: string[] = [`  ${field.name}`];

    parts.push(sqlType(field));

    if (field.isPrimaryKey) {
      parts.push('PRIMARY KEY');
    }
    if (!field.nullable && !field.isPrimaryKey) {
      parts.push('NOT NULL');
    }
    if (field.defaultValue !== null) {
      parts.push(`DEFAULT ${field.defaultValue}`);
    }

    return parts.join(' ');
  });

  const foreignKeyLines = schema.fields
    .filter((f) => f.isForeignKey && f.foreignTable && f.foreignField)
    .map(
      (f) =>
        `  FOREIGN KEY (${f.name}) REFERENCES ${f.foreignTable}(${f.foreignField})`,
    );

  const allLines = [...fieldLines, ...foreignKeyLines];
  lines.push(allLines.join(',\n'));
  lines.push(');');

  return lines.join('\n');
}

function sqlType(field: SchemaField): string {
  switch (field.type) {
    case 'uuid':
      return 'UUID';
    case 'string':
      return 'VARCHAR(255)';
    case 'number':
      return 'DECIMAL(18, 2)';
    case 'boolean':
      return 'BOOLEAN';
    case 'date':
      return 'DATE';
    case 'datetime':
      return 'TIMESTAMP';
    case 'json':
      return 'JSONB';
    case 'enum':
      if (field.enumValues && field.enumValues.length > 0) {
        const values = field.enumValues.map((v) => `'${v}'`).join(', ');
        return `VARCHAR(50) CHECK (${field.name} IN (${values}))`;
      }
      return 'VARCHAR(50)';
    default:
      return 'TEXT';
  }
}

/**
 * Convert a DataSchema to a TypeScript interface definition.
 */
export function schemaToTypeScript(schema: DataSchema): string {
  const interfaceName = toPascalCase(schema.tableName);
  const lines: string[] = [];

  lines.push(`export interface ${interfaceName} {`);

  for (const field of schema.fields) {
    const tsType = typescriptType(field);
    const optional = field.nullable ? '?' : '';
    const camelName = toCamelCase(field.name);
    lines.push(`  readonly ${camelName}${optional}: ${tsType};`);
  }

  lines.push('}');

  return lines.join('\n');
}

function typescriptType(field: SchemaField): string {
  switch (field.type) {
    case 'uuid':
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'date':
    case 'datetime':
      return 'string';
    case 'json':
      return 'Record<string, unknown>';
    case 'enum':
      if (field.enumValues && field.enumValues.length > 0) {
        return field.enumValues.map((v) => `'${v}'`).join(' | ');
      }
      return 'string';
    default:
      return 'unknown';
  }
}

function toPascalCase(str: string): string {
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
