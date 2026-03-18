import { FileJson, FileCode, FileType, FileSpreadsheet } from 'lucide-react';
import { useSchemaStore } from '../../stores/schema-store';
import { exportJson, exportSchemaSql } from '../../services/export';
import { schemaToTypeScript } from '../../utils/schema-generator';
import type { DataSchema } from '../../models/schema';
import Button from '../ui/Button';

// ─── CSV 내보내기 유틸 ───

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function exportSchemaCsv(schemas: readonly DataSchema[]): void {
  // 헤더
  const headers = [
    '테이블명',
    '테이블 설명',
    '필드명',
    '타입',
    'Nullable',
    'PK',
    'FK',
    'FK 참조 테이블',
    'FK 참조 필드',
    '기본값',
    'Enum 값',
    '필드 설명',
  ];

  const rows: string[][] = [];

  for (const schema of schemas) {
    for (const field of schema.fields) {
      rows.push([
        schema.tableName,
        schema.description,
        field.name,
        field.type,
        field.nullable ? 'YES' : 'NO',
        field.isPrimaryKey ? 'YES' : 'NO',
        field.isForeignKey ? 'YES' : 'NO',
        field.foreignTable ?? '',
        field.foreignField ?? '',
        field.defaultValue ?? '',
        field.enumValues ? field.enumValues.join(' | ') : '',
        field.description,
      ]);
    }

    // 관계 정보를 별도 행으로 추가
    for (const rel of schema.relations) {
      rows.push([
        schema.tableName,
        `[관계] ${rel.fromTable}.${rel.fromField} → ${rel.toTable}.${rel.toField} (${rel.type})`,
        '',
        '',
        '',
        '',
        '',
        rel.toTable,
        rel.toField,
        '',
        '',
        `${rel.type} 관계: ${rel.fromTable} → ${rel.toTable}`,
      ]);
    }
  }

  const csvContent = [
    headers.map(escapeCsvField).join(','),
    ...rows.map((row) => row.map(escapeCsvField).join(',')),
  ].join('\n');

  // BOM 추가 (한글 깨짐 방지)
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'schemas.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function SchemaExporter() {
  const schemas = useSchemaStore((s) => s.schemas);
  const hasSchemas = schemas.length > 0;

  const handleExportJson = () => {
    exportJson(schemas, 'schemas');
  };

  const handleExportSql = () => {
    exportSchemaSql(schemas);
  };

  const handleExportTypeScript = () => {
    const tsCode = schemas.map((s) => schemaToTypeScript(s)).join('\n\n');
    const blob = new Blob([tsCode], { type: 'text/typescript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schemas.ts';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    exportSchemaCsv(schemas);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
        disabled={!hasSchemas}
        onClick={handleExportCsv}
      >
        CSV
      </Button>
      <Button
        variant="secondary"
        size="sm"
        icon={<FileJson className="w-3.5 h-3.5" />}
        disabled={!hasSchemas}
        onClick={handleExportJson}
      >
        JSON
      </Button>
      <Button
        variant="secondary"
        size="sm"
        icon={<FileCode className="w-3.5 h-3.5" />}
        disabled={!hasSchemas}
        onClick={handleExportSql}
      >
        SQL
      </Button>
      <Button
        variant="secondary"
        size="sm"
        icon={<FileType className="w-3.5 h-3.5" />}
        disabled={!hasSchemas}
        onClick={handleExportTypeScript}
      >
        TypeScript
      </Button>
    </div>
  );
}
