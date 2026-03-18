import { FileJson, FileCode, FileType, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useSchemaStore } from '../../stores/schema-store';
import { exportJson, exportSchemaSql } from '../../services/export';
import { schemaToTypeScript } from '../../utils/schema-generator';
import type { DataSchema } from '../../models/schema';
import Button from '../ui/Button';

// ─── Excel(.xlsx) 내보내기 — 테이블별 시트 분리 ───

function exportSchemaExcel(schemas: readonly DataSchema[]): void {
  const wb = XLSX.utils.book_new();

  for (const schema of schemas) {
    // 헤더 (테이블명/설명 제거)
    const headers = [
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

    const rows: (string | boolean)[][] = [];

    // 필드 행
    for (const field of schema.fields) {
      rows.push([
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

    // 빈 행 + 관계 정보
    if (schema.relations.length > 0) {
      rows.push([]);
      rows.push(['── 관계 정보 ──', '', '', '', '', '', '', '', '', '']);
      rows.push(['관계유형', 'From 테이블', 'From 필드', 'To 테이블', 'To 필드', '', '', '', '', '']);
      for (const rel of schema.relations) {
        rows.push([
          rel.type,
          rel.fromTable,
          rel.fromField,
          rel.toTable,
          rel.toField,
          '',
          '',
          '',
          '',
          '',
        ]);
      }
    }

    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // 열 너비 자동 조정
    ws['!cols'] = [
      { wch: 22 },  // 필드명
      { wch: 10 },  // 타입
      { wch: 9 },   // Nullable
      { wch: 5 },   // PK
      { wch: 5 },   // FK
      { wch: 18 },  // FK 참조 테이블
      { wch: 14 },  // FK 참조 필드
      { wch: 12 },  // 기본값
      { wch: 25 },  // Enum 값
      { wch: 40 },  // 필드 설명
    ];

    // 시트명: 테이블명 (Excel 시트명 31자 제한 처리)
    const sheetName = schema.tableName.slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  // 다운로드
  XLSX.writeFile(wb, 'schemas.xlsx');
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

  const handleExportExcel = () => {
    exportSchemaExcel(schemas);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
        disabled={!hasSchemas}
        onClick={handleExportExcel}
      >
        Excel
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
