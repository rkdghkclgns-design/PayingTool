import { useState, useCallback } from 'react';
import { Wand2, FileDown, Database } from 'lucide-react';
import PageContainer from '../layout/PageContainer';
import Button from '../ui/Button';
import SchemaViewer from './SchemaViewer';
import SchemaExporter from './SchemaExporter';
import { useSchemaStore } from '../../stores/schema-store';
import { useProductStore } from '../../stores/product-store';
import { useMindmapStore } from '../../stores/mindmap-store';
import { generateSchemasFromProducts } from '../../utils/schema-generator';
import { DEFAULT_SCHEMAS } from '../../data/schema-templates';

export default function DataSchemaPage() {
  const setSchemas = useSchemaStore((s) => s.setSchemas);
  const schemas = useSchemaStore((s) => s.schemas);
  const products = useProductStore((s) => s.products);
  const analysisResult = useMindmapStore((s) => s.analysisResult);
  const genre = analysisResult?.genre;
  const [selectedSchemaId, setSelectedSchemaId] = useState<string | null>(null);

  const handleAutoGenerate = useCallback(() => {
    const generated = generateSchemasFromProducts(products, genre);
    setSchemas(generated);
    if (generated.length > 0) {
      setSelectedSchemaId(generated[0].id);
    }
  }, [products, genre, setSchemas]);

  const handleLoadTemplates = useCallback(() => {
    setSchemas(DEFAULT_SCHEMAS);
    if (DEFAULT_SCHEMAS.length > 0) {
      setSelectedSchemaId(DEFAULT_SCHEMAS[0].id);
    }
  }, [setSchemas]);

  return (
    <PageContainer
      title="데이터 스키마"
      description="유료화 데이터 구조를 정의하고, SQL/TypeScript로 내보낼 수 있습니다."
      exportId="page-schema"
      exportName="데이터스키마"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button
          variant="primary"
          size="sm"
          icon={<Wand2 className="w-4 h-4" />}
          onClick={handleAutoGenerate}
        >
          스키마 자동 생성
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={<Database className="w-4 h-4" />}
          onClick={handleLoadTemplates}
        >
          템플릿 로드
        </Button>
        <div className="flex-1" />
        {schemas.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
              <FileDown className="w-3.5 h-3.5 inline-block mr-1" />
              내보내기:
            </span>
            <SchemaExporter />
          </div>
        )}
      </div>

      {/* Schema Viewer */}
      <SchemaViewer selectedId={selectedSchemaId} onSelect={setSelectedSchemaId} />
    </PageContainer>
  );
}
