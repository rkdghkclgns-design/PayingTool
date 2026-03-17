import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import type { Product } from '../models/product';
import type { FunnelStage } from '../models/funnel';
import type { MetricsConfig } from '../models/metrics';
import type { DataSchema } from '../models/schema';

export const exportJson = (data: unknown, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  saveAs(blob, `${filename}.json`);
};

export const exportCsv = (data: Record<string, unknown>[], filename: string): void => {
  const csv = Papa.unparse(data);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `${filename}.csv`);
};

export const exportProductsCsv = (products: readonly Product[]): void => {
  const rows = products.map(p => ({
    ID: p.id,
    이름: p.name,
    카테고리: p.category,
    세그먼트: p.targetSegments.join(', '),
    리텐션단계: p.targetRetentionStage,
    'USD 가격': p.priceUSD,
    'KRW 가격': p.priceKRW,
    구매제한: `${p.purchaseLimit.type}(${p.purchaseLimit.maxCount})`,
    퍼널단계: p.funnelStageId ?? '',
  }));
  exportCsv(rows, 'products');
};

export const exportFunnelCsv = (stages: readonly FunnelStage[]): void => {
  const rows = stages.map(s => ({
    단계: s.label,
    전환율: `${s.conversionRate}%`,
    설명: s.description,
    배치상품수: s.assignedProductIds.length,
  }));
  exportCsv(rows, 'funnel');
};

export const exportMetricsCsv = (config: MetricsConfig): void => {
  const rows = [
    { 지표: 'DAU', 값: config.dau },
    { 지표: 'MAU', 값: config.mau },
    { 지표: '과금전환율', 값: `${config.conversionRate}%` },
    { 지표: 'ARPPU', 값: `$${config.arppu}` },
    { 지표: 'ARPDAU', 값: `$${config.arpdau}` },
    { 지표: 'D1 리텐션', 값: `${config.d1Retention}%` },
    { 지표: 'D7 리텐션', 값: `${config.d7Retention}%` },
    { 지표: 'D30 리텐션', 값: `${config.d30Retention}%` },
  ];
  exportCsv(rows as Record<string, unknown>[], 'metrics');
};

export const exportSchemaSql = (schemas: readonly DataSchema[]): void => {
  const sql = schemas.map(schema => {
    const fields = schema.fields.map(f => {
      const typeMap: Record<string, string> = {
        string: 'VARCHAR(255)',
        number: 'DECIMAL(18,2)',
        boolean: 'BOOLEAN',
        datetime: 'TIMESTAMP',
        json: 'JSONB',
        enum: f.enumValues ? `ENUM(${f.enumValues.map(v => `'${v}'`).join(', ')})` : 'VARCHAR(50)',
      };
      const parts = [
        `  ${f.name}`,
        typeMap[f.type] || 'VARCHAR(255)',
        f.isPrimaryKey ? 'PRIMARY KEY' : '',
        !f.nullable && !f.isPrimaryKey ? 'NOT NULL' : '',
        f.defaultValue ? `DEFAULT ${f.defaultValue}` : '',
      ].filter(Boolean);
      return parts.join(' ');
    });
    return `-- ${schema.description}\nCREATE TABLE ${schema.tableName} (\n${fields.join(',\n')}\n);`;
  }).join('\n\n');

  const blob = new Blob([sql], { type: 'text/sql;charset=utf-8' });
  saveAs(blob, 'schema.sql');
};
