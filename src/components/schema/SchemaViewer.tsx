import { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Table2,
  Key,
  Link2,
  Trash2,
} from 'lucide-react';
import type { DataSchema } from '../../models';
import { useSchemaStore } from '../../stores/schema-store';
import { schemaToSql, schemaToTypeScript } from '../../utils/schema-generator';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface SchemaViewerProps {
  readonly selectedId: string | null;
  readonly onSelect: (id: string) => void;
}

export default function SchemaViewer({ selectedId, onSelect }: SchemaViewerProps) {
  const schemas = useSchemaStore((s) => s.schemas);
  const deleteSchema = useSchemaStore((s) => s.deleteSchema);
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(new Set());
  const [previewTab, setPreviewTab] = useState<'sql' | 'ts'>('sql');

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedSchema = useMemo(
    () => schemas.find((s) => s.id === selectedId) ?? null,
    [schemas, selectedId],
  );

  if (schemas.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <Table2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">스키마가 없습니다. 자동 생성하거나 템플릿을 로드하세요.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Table List */}
      <div className="lg:col-span-2 flex flex-col gap-2">
        {schemas.map((schema) => {
          const isExpanded = expandedIds.has(schema.id);
          const isSelected = schema.id === selectedId;
          return (
            <div key={schema.id}>
              <button
                onClick={() => {
                  onSelect(schema.id);
                  toggleExpand(schema.id);
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-lg text-left
                  transition-colors border
                  ${
                    isSelected
                      ? 'bg-brand-50 border-brand-200 dark:bg-brand-950 dark:border-brand-800'
                      : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800/60'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                  <Table2 className="w-4 h-4 text-brand-500" />
                  <span className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {schema.tableName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge size="sm">{schema.fields.length} fields</Badge>
                  {schema.relations.length > 0 && (
                    <Badge variant="primary" size="sm">
                      {schema.relations.length} rels
                    </Badge>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSchema(schema.id);
                    }}
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors"
                    title="스키마 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </button>

              {/* Expanded field list */}
              {isExpanded && (
                <div className="ml-6 mt-1 mb-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {schema.description}
                  </p>
                  <div className="flex flex-col gap-1">
                    {schema.fields.map((field) => (
                      <div
                        key={field.name}
                        className="flex items-center gap-2 text-xs py-1"
                      >
                        <span className="font-mono text-gray-800 dark:text-gray-200 w-32 truncate">
                          {field.name}
                        </span>
                        <Badge size="sm">{field.type}</Badge>
                        {field.isPrimaryKey && (
                          <span className="text-yellow-600 dark:text-yellow-400" title="Primary Key">
                            <Key className="w-3 h-3" />
                          </span>
                        )}
                        {field.isForeignKey && (
                          <span className="text-blue-500 dark:text-blue-400" title={`FK -> ${field.foreignTable}`}>
                            <Link2 className="w-3 h-3" />
                          </span>
                        )}
                        {field.nullable && (
                          <span className="text-gray-400 text-[10px]">NULL</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail / Preview */}
      <div className="lg:col-span-3">
        {selectedSchema ? (
          <SchemaPreview schema={selectedSchema} activeTab={previewTab} onTabChange={setPreviewTab} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
            테이블을 선택하면 미리보기를 확인할 수 있습니다
          </div>
        )}
      </div>
    </div>
  );
}

interface SchemaPreviewProps {
  readonly schema: DataSchema;
  readonly activeTab: 'sql' | 'ts';
  readonly onTabChange: (tab: 'sql' | 'ts') => void;
}

function SchemaPreview({ schema, activeTab, onTabChange }: SchemaPreviewProps) {
  const code = useMemo(
    () => (activeTab === 'sql' ? schemaToSql(schema) : schemaToTypeScript(schema)),
    [schema, activeTab],
  );

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center gap-0 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <button
          onClick={() => onTabChange('sql')}
          className={`px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === 'sql'
              ? 'text-brand-600 bg-white dark:bg-gray-800 dark:text-brand-400 border-b-2 border-brand-500'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          SQL
        </button>
        <button
          onClick={() => onTabChange('ts')}
          className={`px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === 'ts'
              ? 'text-brand-600 bg-white dark:bg-gray-800 dark:text-brand-400 border-b-2 border-brand-500'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          TypeScript
        </button>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          className="mr-2"
          onClick={() => navigator.clipboard.writeText(code)}
        >
          복사
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-950 max-h-96">
        {code}
      </pre>
    </div>
  );
}
