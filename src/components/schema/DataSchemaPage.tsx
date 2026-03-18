import { useState, useCallback } from 'react';
import { Wand2, FileDown, Database, GitBranch, List } from 'lucide-react';
import PageContainer from '../layout/PageContainer';
import Button from '../ui/Button';
import SchemaViewer from './SchemaViewer';
import SchemaExporter from './SchemaExporter';
import ErDiagram from './ErDiagram';
import { useSchemaStore } from '../../stores/schema-store';
import { useProductStore } from '../../stores/product-store';
import { useMindmapStore } from '../../stores/mindmap-store';
import { generateSchemas } from '../../services/gemini';
import { generateSchemasFromProducts } from '../../utils/schema-generator';
import { DEFAULT_SCHEMAS } from '../../data/schema-templates';

type ViewTab = 'list' | 'diagram';

export default function DataSchemaPage() {
  const setSchemas = useSchemaStore((s) => s.setSchemas);
  const schemas = useSchemaStore((s) => s.schemas);
  const products = useProductStore((s) => s.products);
  const analysisResult = useMindmapStore((s) => s.analysisResult);
  const genre = analysisResult?.genre;
  const [selectedSchemaId, setSelectedSchemaId] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<ViewTab>('list');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const handleAutoGenerate = useCallback(async () => {
    if (products.length === 0) {
      // 상품이 없으면 로컬 생성 fallback
      const generated = generateSchemasFromProducts(products, genre);
      setSchemas(generated);
      if (generated.length > 0) setSelectedSchemaId(generated[0].id);
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);
    try {
      // AI 기반 스키마 생성 (상품 + 장르 기반)
      const mutableProducts = [...products];
      const generated = await generateSchemas(mutableProducts, genre);
      setSchemas(generated);
      if (generated.length > 0) setSelectedSchemaId(generated[0].id);
    } catch (err) {
      // AI 실패 시 로컬 생성 fallback
      const fallback = generateSchemasFromProducts(products, genre);
      setSchemas(fallback);
      if (fallback.length > 0) setSelectedSchemaId(fallback[0].id);
      setGenerateError(err instanceof Error ? err.message : 'AI 스키마 생성 실패 — 로컬 생성으로 대체됨');
      setTimeout(() => setGenerateError(null), 5000);
    } finally {
      setIsGenerating(false);
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
          loading={isGenerating}
        >
          {isGenerating ? 'AI 생성 중...' : 'AI 스키마 생성'}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={<Database className="w-4 h-4" />}
          onClick={handleLoadTemplates}
        >
          템플릿 로드
        </Button>

        {generateError && (
          <span className="text-xs text-amber-600 dark:text-amber-400">{generateError}</span>
        )}

        {/* View Tab Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 ml-2">
          <button
            onClick={() => setViewTab('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewTab === 'list'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-600 dark:text-brand-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            스키마 목록
          </button>
          <button
            onClick={() => setViewTab('diagram')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewTab === 'diagram'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-600 dark:text-brand-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            데이터 구조도
          </button>
        </div>

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

      {/* Content based on tab */}
      {viewTab === 'list' ? (
        <SchemaViewer selectedId={selectedSchemaId} onSelect={setSelectedSchemaId} />
      ) : (
        <ErDiagram schemas={schemas} />
      )}
    </PageContainer>
  );
}
