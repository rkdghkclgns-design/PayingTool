import { FileJson, FileCode, FileType } from 'lucide-react';
import { useSchemaStore } from '../../stores/schema-store';
import { exportJson, exportSchemaSql } from '../../services/export';
import { schemaToTypeScript } from '../../utils/schema-generator';
import Button from '../ui/Button';

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

  return (
    <div className="flex items-center gap-2">
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
